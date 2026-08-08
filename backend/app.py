"""
Pink Bloom — backend API
Community report/case management: users submit reports (product shortages,
unsafe facilities, education needs), partners triage and advance them
through a status pipeline.

Security (POPIA-aligned):
- Passwords are hashed with bcrypt (never stored in plaintext).
- Auth uses signed JWTs (python-jose) with an expiry.
- Report endpoints are protected and enforce role-based access control.
- Data minimization: only necessary fields are returned; hashes never exposed.

Run:
    pip install -r requirements.txt
    uvicorn app:app --reload --port 8000
"""

import os
import random
import sqlite3
from datetime import date, datetime, timedelta, timezone
from typing import Literal, Optional

import bcrypt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field

DB_PATH = "pinkbloom.db"

STATUS_FLOW = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"]

# ---- Auth config ----
SECRET_KEY = os.environ.get("PINKBLOOM_SECRET", "dev-secret-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="Pink Bloom API")
# Restrict CORS to the frontend origin in production. Set PINKBLOOM_ORIGINS to a
# comma-separated list of allowed origins; defaults to "*" for the local demo.
_cors_origins = [
    o.strip()
    for o in os.environ.get("PINKBLOOM_ORIGINS", "*").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def gen_report_id() -> str:
    return f"PB-{random.randint(100000, 999999)}-{random.randint(10, 99)}"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def seed(conn):
    # ---- Schema migration ----
    # The users table used to be created without an `email` column. If we spot
    # that old shape, rebuild the table so the app can start reliably on any
    # existing pinkbloom.db file.
    cols = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()} \
        if conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").fetchone() else set()
    if cols and "email" not in cols:
        conn.execute("ALTER TABLE users RENAME TO users_old")
        _create_tables(conn)
        # Carry over any matching columns that already exist; cast role to a
        # known value so the RBAC checks keep working.
        common = [c for c in ("id", "name", "role", "created_at") if c in cols]
        conn.execute(
            f"INSERT INTO users (id, email, name, role, password_hash, created_at) "
            f"SELECT {', '.join(common)}, 'legacy@local', 'Legacy User', 'school', '!', '2024-01-01' FROM users_old"
        )
        conn.execute("DROP TABLE users_old")
    else:
        _create_tables(conn)
    conn.commit()


def _create_tables(conn):
    conn.execute(
        """CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            report_date TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            submitted_by TEXT NOT NULL
        )"""
    )

    # Demo users (email + password). Passwords are hashed at seed time.
    demo_users = [
        ("u1", "user@demo.com", "Demo User", "school", "Password123!"),
        ("u2", "partner@demo.com", "Breadline Africa (NGO)", "ngo", "Password123!"),
        ("u3", "admin@demo.com", "Programme Admin", "admin", "Password123!"),
    ]
    for uid, email, name, role, pw in demo_users:
        conn.execute(
            "INSERT OR IGNORE INTO users (id, email, name, role, password_hash, created_at) VALUES (?,?,?,?,?,?)",
            (uid, email, name, role, hash_password(pw), date.today().isoformat()),
        )

    existing = conn.execute("SELECT COUNT(*) c FROM reports").fetchone()["c"]
    if existing == 0:
        seed_reports = [
            ("PB-100001-11", "No sanitary pads available", "No sanitary pads available", "Mdantsane High School", "2026-08-05", "Medium", "In Progress", "u1"),
            ("PB-100002-22", "Unsafe or broken toilets", "Unsafe or broken toilets", "Umlazi Community", "2026-08-03", "Medium", "Under Review", "u1"),
            ("PB-100003-33", "Need health education", "Need health education", "Soweto Youth Centre", "2026-07-31", "Low", "Resolved", "u1"),
        ]
        conn.executemany(
            "INSERT INTO reports (id, title, category, location, report_date, priority, status, submitted_by) VALUES (?,?,?,?,?,?,?,?)",
            seed_reports,
        )
    conn.commit()


conn0 = get_db()
seed(conn0)
conn0.close()


# ---------- Pydantic models ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    role: Literal["school", "ngo", "admin"]
    password: str = Field(min_length=8, max_length=128)


class ReportIn(BaseModel):
    category: str
    location: str
    priority: Literal["Low", "Medium", "High"]
    details: Optional[str] = None


def user_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
    }


def report_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "location": row["location"],
        "report_date": row["report_date"],
        "priority": row["priority"],
        "status": row["status"],
        "submitted_by": row["submitted_by"],
    }


# ---------- Auth dependency ----------
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    if row is None:
        raise credentials_exception
    return row


def require_roles(*roles: str):
    def checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't have permission to do that")
        return user

    return checker


# ---------- Auth endpoints ----------
@app.post("/register", status_code=201)
def register(body: RegisterRequest):
    # Password strength (POPIA / good practice)
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if not any(c.islower() for c in body.password) or not any(c.isupper() for c in body.password):
        raise HTTPException(400, "Password must contain upper and lower case letters")
    if not any(c.isdigit() for c in body.password):
        raise HTTPException(400, "Password must contain at least one number")

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email=?", (body.email.lower(),)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(409, "An account with that email already exists")

    uid = f"u{random.randint(10000, 99999)}"
    conn.execute(
        "INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES (?,?,?,?,?,?)",
        (uid, body.email.lower(), body.name.strip(), body.role, hash_password(body.password), date.today().isoformat()),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    conn.close()

    token = create_access_token({"sub": row["id"], "role": row["role"]})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(row)}


@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE email=?", (form.username.lower(),)).fetchone()
    conn.close()
    if not row or not verify_password(form.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    token = create_access_token({"sub": row["id"], "role": row["role"]})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(row)}


@app.get("/me")
def me(user=Depends(get_current_user)):
    return user_to_dict(user)


# ---------- Reports ----------
@app.get("/reports")
def list_reports(
    status: Optional[str] = None,
    submitted_by: Optional[str] = None,
    user=Depends(get_current_user),
):
    conn = get_db()
    query = "SELECT * FROM reports WHERE 1=1"
    params = []

    # Role-based access: users only see their own reports.
    if user["role"] == "school":
        query += " AND submitted_by=?"
        params.append(user["id"])
    else:
        if status and status != "All":
            query += " AND status=?"
            params.append(status)
        if submitted_by:
            query += " AND submitted_by=?"
            params.append(submitted_by)

    query += " ORDER BY report_date DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [report_to_dict(r) for r in rows]


@app.post("/reports", status_code=201)
def submit_report(body: ReportIn, user=Depends(get_current_user)):
    conn = get_db()
    report_id = gen_report_id()
    title = body.details.strip() if body.details else body.category
    conn.execute(
        "INSERT INTO reports (id, title, category, location, report_date, priority, status, submitted_by) VALUES (?,?,?,?,?,?,?,?)",
        (report_id, title, body.category, body.location, date.today().isoformat(), body.priority, "Submitted", user["id"]),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
    conn.close()
    return report_to_dict(row)


@app.post("/reports/{report_id}/advance")
def advance_report(report_id: str, user=Depends(require_roles("ngo", "admin"))):
    conn = get_db()
    row = conn.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Report not found")
    idx = STATUS_FLOW.index(row["status"]) if row["status"] in STATUS_FLOW else 0
    next_status = STATUS_FLOW[min(idx + 1, len(STATUS_FLOW) - 1)]
    conn.execute("UPDATE reports SET status=? WHERE id=?", (next_status, report_id))
    conn.commit()
    row = conn.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
    conn.close()
    return report_to_dict(row)


@app.post("/reports/reset")
def reset_demo(user=Depends(require_roles("admin"))):
    conn = get_db()
    conn.execute("DELETE FROM reports")
    conn.commit()
    seed(conn)
    conn.close()
    return {"status": "reset"}


@app.get("/health")
def health():
    return {"status": "ok"}

