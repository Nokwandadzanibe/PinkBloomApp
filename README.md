# Pink Bloom — MVP

Community report/case tracker for menstrual health access issues (product
shortages, unsafe facilities, education needs). Users submit reports;
partners (NGOs/admins) triage and advance them through a status pipeline.

## Structure

```
backend/    FastAPI + SQLite API (users, reports, status pipeline, login)
frontend/   Vite + React app (landing, role login, User + Partner dashboards)
```

## Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt   # Windows
venv\Scripts\uvicorn app:app --reload --port 8000
```

This creates `pinkbloom.db` on first run, seeded with 3 demo reports and
3 demo logins (one per role). On startup the app auto-migrates any older
database that lacks the `email` column, so it always starts reliably.

Demo logins (email + password):

| Role | Email | Password |
|------|-------|----------|
| User (School) | `user@demo.com` | `Password123!` |
| Partner (NGO) | `partner@demo.com` | `Password123!` |
| Admin | `admin@demo.com` | `Password123!` |

Environment variables (optional):
- `PINKBLOOM_SECRET` — JWT signing key (change in production).
- `PINKBLOOM_ORIGINS` — comma-separated allowed CORS origins (defaults to `*`).

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. Talks to the backend at
`http://localhost:8000` by default — override with a `.env` file:

```
VITE_API_BASE=http://localhost:8000
```

## Flow

1. Landing page (logo + "Get started")
2. Role picker: User / Partner (NGO) / Admin, then email + password login.
   New visitors can create an account.
3. Signed in with a JWT stored securely in `localStorage` (session is restored
   on refresh; logout clears it).
4. Dashboard:
   - **User** — Home with "What to Report," "Submit Report," "Check My Case,"
     and an active-cases count, plus a bottom nav (Home / Report / Cases).
     After submitting, a success confirmation is shown and your new case
     appears in "My cases" with a status progress bar.
   - **Partner / Admin** — stat tiles (total, under review, in progress,
     resolved), status filter pills, and a report list where each card can be
     advanced to its next status. A dedicated "Reports" tab lists everything.
     Includes a "Reset demo data" control.
5. Inline form validation shows clear errors, and all actions surface
   toast notifications instead of browser alerts.

Status pipeline: `Submitted → Under Review → Assigned → In Progress → Resolved`.

## Notes for the demo

- Submit a report as User, log out, log back in as Partner, and advance it
  through the pipeline live — that loop is the whole pitch in one minute.
- Login is secure demo auth (bcrypt + JWT). Swap in real accounts and rotate
  the `PINKBLOOM_SECRET` before any real deployment.
