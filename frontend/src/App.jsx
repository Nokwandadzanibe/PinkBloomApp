import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  FileText,
  MapPin,
  ClipboardList,
  PenSquare,
  CheckCircle2,
  RotateCcw,
  Inbox,
  Hourglass,
  Wrench,
  Sprout,
  ArrowRight,
  ArrowLeft,
  LogOut,
  LogIn,
  UserPlus,
  X,
  Check,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const PINK = "#D6337A";
const PINK_DARK = "#B02268";
const PINK_SOFT = "#F7A8C4";
const PINK_TINT = "#FCE3ED";
const GREEN = "#2F9E6E";
const GREEN_DARK = "#1F7A54";
const GREEN_TINT = "#DFF3E3";
const AMBER_TINT = "#FBF0D2";
const AMBER_TXT = "#8A5F16";
const BLUE_TINT = "#DCEAFB";
const BLUE_TXT = "#2A5B8C";
const RED = "#E14B4B";
const INK = "#2B1B24";
const DIM = "#8A6B78";
const BG = "#FDF1F6";
const SURFACE = "#FFFFFF";
const BORDER = "#F3D9E8";

const FONT_DISPLAY = "'Poppins', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const STATUS_FLOW = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
const CATEGORIES = ["No sanitary pads available", "Unsafe or broken toilets", "Need health education", "Other"];
const ROLES = { school: "User", ngo: "Partner (NGO)", admin: "Admin" };

// ---------- Helpers ----------
function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function api(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return {
    get: (path) =>
      fetchWithTimeout(`${API_BASE}${path}`, { headers }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || "Request failed");
        return r.json();
      }),
    post: (path, body) =>
      fetchWithTimeout(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body ?? {}),
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || "Request failed");
        return r.json();
      }),
  };
}

function statusTone(status) {
  return status === "Resolved" ? GREEN_DARK : PINK_DARK;
}

function priorityStyle(priority) {
  if (priority === "Low") return { bg: GREEN_TINT, fg: GREEN_DARK, dot: GREEN };
  if (priority === "High") return { bg: "#FBE0E0", fg: "#A72E2E", dot: RED };
  return { bg: AMBER_TINT, fg: AMBER_TXT, dot: "#E3A23D" };
}

// ---------- Toast system ----------
function Toast({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.kind === "error" ? RED : t.kind === "success" ? GREEN : INK,
            color: "#fff",
            borderRadius: 12,
            padding: "12px 40px 12px 16px",
            fontSize: 13.5,
            lineHeight: 1.4,
            fontWeight: 600,
            position: "relative",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            animation: "slideIn 0.25s ease-out",
            wordBreak: "break-word",
          }}
        >
          {t.message}
          <button
            onClick={() => removeToast(t.id)}
            style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 4 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const addToast = useCallback((message, kind = "info", duration = 4000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, [removeToast]);
  return { toasts, addToast, removeToast };
}

// ---------- Button ----------
function Button({ children, onClick, variant = "primary", disabled, style, type = "button" }) {
  const variants = {
    primary: { background: PINK, color: "#fff", border: "none" },
    soft: { background: PINK_TINT, color: PINK_DARK, border: "none" },
    ghost: { background: "transparent", color: PINK_DARK, border: `1.5px solid ${PINK}` },
    green: { background: GREEN, color: "#fff", border: "none" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 12,
        padding: "12px 18px",
        fontWeight: 700,
        fontSize: 14,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: FONT_BODY,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return <div style={{ background: SURFACE, borderRadius: 18, boxShadow: "0 4px 18px rgba(214, 51, 122, 0.08)", ...style }}>{children}</div>;
}

function Logo({ size = 28 }) {
  return <img src="/logo.jpeg" alt="Pink Bloom" style={{ width: size, height: size, objectFit: "contain", borderRadius: size / 4 }} />;
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1.5px solid ${BORDER}`,
  fontSize: 14,
  fontFamily: FONT_BODY,
  color: INK,
  boxSizing: "border-box",
  marginTop: 6,
  outline: "none",
};

const inputErrorStyle = { ...inputStyle, borderColor: RED, background: "#FFF5F5" };

const labelStyle = { fontSize: 12.5, fontWeight: 700, color: INK };

function Field({ label, error, ...props }) {
  return (
    <label>
      <div style={labelStyle}>{label}</div>
      <input {...props} style={error ? inputErrorStyle : inputStyle} />
      {error && <div style={{ fontSize: 11.5, color: RED, marginTop: 4 }}>{error}</div>}
    </label>
  );
}

function AuthError({ msg }) {
  return msg ? <div style={{ fontSize: 12.5, color: RED, marginBottom: 8 }}>{msg}</div> : null;
}

// ---------- Status progress bar ----------
function StatusProgress({ current }) {
  const idx = STATUS_FLOW.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 10, marginBottom: 6 }}>
      {STATUS_FLOW.map((s, i) => {
        const done = i <= idx;
        const isCurrent = i === idx;
        return (
          <React.Fragment key={s}>
            <div
              style={{
                flex: 1,
                height: 5,
                borderRadius: 4,
                background: done ? PINK : BORDER,
                position: "relative",
                transition: "background 0.3s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 9,
                  fontWeight: 700,
                  color: isCurrent ? PINK : done ? PINK_DARK : DIM,
                  whiteSpace: "nowrap",
                  fontFamily: FONT_MONO,
                }}
              >
                {s === "Resolved" ? "Done" : s}
              </div>
            </div>
            {i < STATUS_FLOW.length - 1 && <div style={{ width: 2, height: 2, borderRadius: "50%", background: DIM }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------- Landing ----------
function Landing({ onStart }) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px",
        background: `radial-gradient(circle at 50% 0%, ${PINK_TINT} 0%, ${BG} 60%)`,
      }}
    >
      <img src="/logo.jpeg" alt="Pink Bloom" style={{ width: 220, height: 220, objectFit: "contain", borderRadius: 24 }} />
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 28, marginBottom: 0 }}>
        Data · Insight · Impact
      </h1>
      <p style={{ fontFamily: FONT_BODY, color: INK, fontSize: 15, maxWidth: 340, margin: "10px 0 36px" }}>
        Menstrual intelligence for stronger communities — report a need, and get connected to the partners who can act on it.
      </p>
      <Button onClick={onStart} style={{ width: "auto", padding: "14px 32px", fontSize: 15 }}>
        Get started <ArrowRight size={16} />
      </Button>
    </div>
  );
}

// ---------- Role select ----------
function RoleSelect({ onPick, onBack }) {
  const roles = [
    { id: "school", label: "User", desc: "Report a need and track your cases.", color: PINK },
    { id: "ngo", label: "Partner (NGO)", desc: "Review and respond to community reports.", color: GREEN },
    { id: "admin", label: "Admin", desc: "Full oversight across all partners.", color: PINK_DARK },
  ];
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px", background: BG }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", background: "none", border: "none", color: DIM, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back
      </button>
      <Logo size={64} />
      <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, color: INK, margin: "18px 0 6px" }}>Sign in as</h2>
      <p style={{ fontSize: 13, color: DIM, margin: "0 0 22px" }}>Choose the account type you'll use.</p>
      <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 380 }}>
        {roles.map((r) => (
          <Card key={r.id} style={{ padding: 18, cursor: "pointer" }}>
            <div onClick={() => onPick(r.id)} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 40, borderRadius: 6, background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{r.label}</div>
                <div style={{ fontSize: 12.5, color: DIM, marginTop: 2 }}>{r.desc}</div>
              </div>
              <ArrowRight size={16} color={DIM} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Login ----------
function LoginForm({ role, onBack, onSuccess, goRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const hints = {
    school: { e: "user@demo.com", p: "Password123!" },
    ngo: { e: "partner@demo.com", p: "Password123!" },
    admin: { e: "admin@demo.com", p: "Password123!" },
  };

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append("username", email.trim());
      body.append("password", password);
      const res = await fetchWithTimeout(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Couldn't sign in");
      onSuccess(data);
    } catch (err) {
      if (err.name === "AbortError") setError("Sign-in is taking too long. The server may be down — please try again.");
      else setError(err.message || "Couldn't sign in. Check email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: BG }}>
      <Card style={{ padding: 30, width: "100%", maxWidth: 340 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: DIM, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, marginBottom: 18, padding: 0 }}>
          <ArrowLeft size={14} /> Change role
        </button>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.1em", color: PINK, textTransform: "uppercase", marginBottom: 6 }}>{ROLES[role]} login</div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, color: INK, margin: "0 0 20px" }}>Sign in to your account</h3>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Email" type="email" value={email} placeholder="you@example.com" autoComplete="email" onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} error={errors.email} />
            <Field label="Password" type="password" value={password} placeholder="••••••••" autoComplete="current-password" onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} error={errors.password} />
          </div>
          <AuthError msg={error} />
          <div style={{ fontSize: 11.5, color: DIM, marginBottom: 16 }}>
            Demo for {ROLES[role]}: {hints[role].e} / {hints[role].p}
          </div>
          <Button type="submit" disabled={loading}>
            <LogIn size={15} /> {loading ? "Signing in\u2026" : "Sign in"}
          </Button>
        </form>
        <button onClick={goRegister} style={{ width: "100%", marginTop: 16, background: "none", border: "none", color: PINK_DARK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          New here? Create an account
        </button>
      </Card>
    </div>
  );
}

// ---------- Register ----------
function RegisterForm({ onBack, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("school");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters";
    else if (!/[a-z]/.test(password)) e.password = "Must contain a lowercase letter";
    else if (!/[A-Z]/.test(password)) e.password = "Must contain an uppercase letter";
    else if (!/\d/.test(password)) e.password = "Must contain a number";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Couldn't create account");
      onSuccess(data);
    } catch (err) {
      if (err.name === "AbortError") setError("Sign-up is taking too long. The server may be down \u2014 please try again.");
      else setError(err.message || "Couldn't create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: BG }}>
      <Card style={{ padding: 30, width: "100%", maxWidth: 340 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: DIM, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, marginBottom: 18, padding: 0 }}>
          <ArrowLeft size={14} /> Back to login
        </button>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.1em", color: PINK, textTransform: "uppercase", marginBottom: 6 }}>Create account</div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, color: INK, margin: "0 0 20px" }}>Join Pink Bloom</h3>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Full name" type="text" value={name} placeholder="Zanele Mbeki" autoComplete="name" onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }} error={errors.name} />
            <Field label="Email" type="email" value={email} placeholder="you@example.com" autoComplete="email" onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} error={errors.email} />
            <label>
              <div style={labelStyle}>I am a {"…"}</div>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                <option value="school">User (report needs)</option>
                <option value="ngo">Partner / NGO</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Field label="Password" type="password" value={password} placeholder="At least 8 chars, incl. upper, lower, number" autoComplete="new-password" onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} error={errors.password} />
            <Field label="Confirm password" type="password" value={confirm} placeholder="Repeat password" autoComplete="new-password" onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }} error={errors.confirm} />
          </div>
          <AuthError msg={error} />
          <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>
            <UserPlus size={15} /> {loading ? "Creating\u2026" : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

// ---------- Toast + TopBar ----------
function TopBar({ title, user, onLogout }) {
  return (
    <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={28} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, color: PINK }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{user?.name || ""}</div>
          <div style={{ fontSize: 11, color: DIM }}>{user ? (ROLES[user.role] || user.role) : ""}</div>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: DIM, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

function RolePill({ label }) {
  return <span style={{ background: PINK_TINT, color: PINK_DARK, fontSize: 12.5, fontWeight: 700, padding: "5px 14px", borderRadius: 999, display: "inline-block" }}>{label}</span>;
}

function BottomNav({ tabs, active, onChange }) {
  return (
    <div style={{ position: "sticky", bottom: 0, background: SURFACE, borderTop: `1px solid ${BORDER}`, display: "flex", padding: "10px 0 14px" }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            color: active === t.id ? PINK : "#B99AA8",
          }}
        >
          <t.icon size={20} />
          <span style={{ fontSize: 11.5, fontWeight: 600 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function StatTile({ icon: Icon, count, label, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: 16 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon size={17} color={INK} />
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 600, color: INK }}>{count}</div>
      <div style={{ fontSize: 12.5, color: DIM, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ---------- Report card ----------
function ReportCard({ report, showAdvance, onAdvance }) {
  const pr = priorityStyle(report.priority);
  const isResolved = report.status === "Resolved";

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: PINK, fontWeight: 600, marginBottom: 6 }}>{report.id}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: INK, marginBottom: 4 }}>{report.title}</div>
      <div style={{ fontSize: 13, color: DIM, marginBottom: 12 }}>
        {report.location} {"·"} {new Date(report.report_date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ background: pr.bg, color: pr.fg, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: pr.dot, display: "inline-block" }} />
          {report.priority} Priority
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: statusTone(report.status) }}>{report.status}</span>
      </div>
      <StatusProgress current={report.status} />
      {showAdvance && !isResolved && (
        <Button variant="soft" onClick={() => onAdvance(report.id)} style={{ marginTop: 14 }}>
          Advance to "{STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(report.status) + 1, STATUS_FLOW.length - 1)]}" {"→"}
        </Button>
      )}
    </Card>
  );
}

function Spinner({ size = 24, color = PINK }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}22`,
          borderTopColor: color,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

// ---------- User: Home ----------
function UserHome({ user, reports, onNav, loading }) {
  const activeCount = reports.filter((r) => r.status !== "Resolved").length;
  const recent = reports.slice(0, 3);
  return (
    <div style={{ padding: "22px 18px 10px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: INK }}>Hello, {user.name.split(" ")[0]}</div>
      <div style={{ fontSize: 14, color: DIM, margin: "4px 0 10px" }}>How can we help you bloom today?</div>
      <RolePill label="User" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22 }}>
        <div onClick={() => onNav("whatToReport")} style={{ cursor: "pointer" }}>
          <StatCardStatic icon={ClipboardList} bg="#FBEADB" title="What to Report" desc="See report categories & guidance" />
        </div>
        <div onClick={() => onNav("submit")} style={{ cursor: "pointer" }}>
          <StatCardStatic icon={PenSquare} bg="#F5AFC8" title="Submit Report" desc="Report a problem in your community" dark />
        </div>
        <div onClick={() => onNav("cases")} style={{ cursor: "pointer" }}>
          <StatCardStatic icon={MapPin} bg="#E4DCF7" title="Check My Case" desc="Track your report status" />
        </div>
        <div onClick={() => onNav("cases")} style={{ cursor: "pointer" }}>
          <StatCardStatic icon={CheckCircle2} bg="#FBF0D2" title={`${activeCount} Active Cases`} desc={`${reports.length} total reports submitted`} />
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: INK, margin: "26px 0 12px" }}>Recent Reports</div>
      {loading ? (
        <Spinner />
      ) : recent.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Sprout size={48} color={GREEN} />
          <div style={{ fontSize: 13, color: DIM, marginTop: 8 }}>No reports yet {"—"} nothing is growing here, yet.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {recent.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCardStatic({ icon: Icon, bg, title, desc, dark }) {
  return (
    <div style={{ background: bg, borderRadius: 18, padding: 16, minHeight: 128 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={17} color={INK} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: dark ? "#5E1436" : INK, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: dark ? "#84325B" : DIM, lineHeight: 1.3 }}>{desc}</div>
    </div>
  );
}

// ---------- User: What to report ----------
function WhatToReport({ onBack }) {
  const items = [
    { title: "No sanitary pads available", desc: "Your school or community centre has run out of stock." },
    { title: "Unsafe or broken toilets", desc: "Facilities that are unsafe, broken, or lack privacy." },
    { title: "Need health education", desc: "A request for menstrual health training or awareness sessions." },
    { title: "Other", desc: "Anything else affecting menstrual health access nearby." },
  ];
  return (
    <div style={{ padding: "22px 18px" }}>
      <BackRow onBack={onBack} label="What to report" />
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((it) => (
          <Card key={it.title} style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: INK, marginBottom: 4 }}>{it.title}</div>
            <div style={{ fontSize: 12.5, color: DIM }}>{it.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BackRow({ onBack, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: DIM, cursor: "pointer", display: "flex", alignItems: "center" }}>
        <ArrowLeft size={18} />
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: INK }}>{label}</div>
    </div>
  );
}

// ---------- User: Submit report ----------
function SubmitReport({ user, onBack, onSubmitted, token, addToast }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e = {};
    if (!location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api(token).post("/reports", { category, location, priority, details: details || category });
      setSubmitted(true);
      addToast("Report submitted successfully!", "success");
      onSubmitted();
    } catch (err) {
      addToast(err.message || "Could not submit report.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: "22px 18px" }}>
        <BackRow onBack={onBack} label="" />
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Check size={56} color={GREEN} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: INK, marginTop: 12 }}>Report submitted!</div>
          <div style={{ fontSize: 14, color: DIM, marginTop: 6, maxWidth: 280, margin: "6px auto 0" }}>
            Your report has been received. A partner will review it soon.
          </div>
          <Button onClick={() => setSubmitted(false)} variant="soft" style={{ marginTop: 20, maxWidth: 200, marginLeft: "auto", marginRight: "auto" }}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "22px 18px" }}>
      <BackRow onBack={onBack} label="Submit report" />
      <form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 18 }}>
        <label>
          <div style={labelStyle}>Category</div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <div style={labelStyle}>Location (school or community)</div>
          <input value={location} onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: "" })); }} placeholder="e.g. Mdantsane High School" style={errors.location ? inputErrorStyle : inputStyle} />
          {errors.location && <div style={{ fontSize: 11.5, color: RED, marginTop: 4 }}>{errors.location}</div>}
        </label>
        <label>
          <div style={labelStyle}>Priority</div>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label>
          <div style={labelStyle}>Details (optional)</div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Anything else that would help a partner respond" style={{ ...inputStyle, resize: "vertical" }} />
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting\u2026" : "Submit report"}
        </Button>
      </form>
    </div>
  );
}

// ---------- User: My cases ----------
function MyCases({ reports, onBack, loading }) {
  return (
    <div style={{ padding: "22px 18px" }}>
      <BackRow onBack={onBack} label="My cases" />
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {loading ? (
          <Spinner />
        ) : reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Sprout size={48} color={GREEN} />
            <div style={{ fontSize: 13, color: DIM, marginTop: 8 }}>You haven't submitted a report yet.</div>
          </div>
        ) : (
          reports.map((r) => <ReportCard key={r.id} report={r} />)
        )}
      </div>
    </div>
  );
}

// ---------- Partner dashboard ----------
function PartnerDashboard({ user, reports, filter, setFilter, onAdvance, onReset, loading }) {
  const counts = {
    total: reports.length,
    review: reports.filter((r) => r.status === "Under Review").length,
    progress: reports.filter((r) => r.status === "In Progress" || r.status === "Assigned").length,
    resolved: reports.filter((r) => r.status === "Resolved").length,
  };
  const filters = ["All", ...STATUS_FLOW];
  const visible = filter === "All" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div style={{ padding: "22px 18px 10px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: INK }}>Hello, {user.name.split(" ")[0]}</div>
      <div style={{ fontSize: 14, color: DIM, margin: "4px 0 10px" }}>Manage and respond to community reports.</div>
      <RolePill label={user.role === "admin" ? "Admin" : "Partner"} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22 }}>
        <StatTile icon={Inbox} bg={BLUE_TINT} count={counts.total} label="Total reports" />
        <StatTile icon={Hourglass} bg={AMBER_TINT} count={counts.review} label="Under review" />
        <StatTile icon={Wrench} bg={PINK_TINT} count={counts.progress} label="In progress" />
        <StatTile icon={CheckCircle2} bg={GREEN_TINT} count={counts.resolved} label="Resolved" />
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: INK, margin: "26px 0 12px" }}>All Reports</div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flexShrink: 0,
              background: filter === f ? PINK : SURFACE,
              color: filter === f ? "#fff" : INK,
              border: `1px solid ${filter === f ? PINK : BORDER}`,
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visible.map((r) => (
            <ReportCard key={r.id} report={r} showAdvance onAdvance={onAdvance} />
          ))}
          {visible.length === 0 && <div style={{ textAlign: "center", color: DIM, fontSize: 13, padding: "20px 0" }}>No reports in this status.</div>}
        </div>
      )}

      {user.role === "admin" && (
        <Button variant="ghost" onClick={onReset} style={{ marginTop: 24 }}>
          <RotateCcw size={14} /> Reset demo data
        </Button>
      )}
    </div>
  );
}

// ---------- App shell ----------
const STORAGE_KEY = "pinkbloom_auth";

function loadSavedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export default function App() {
  const saved = loadSavedAuth();
  const [stage, setStage] = useState(() => (saved ? "app" : "landing"));
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(() => saved?.user || null);
  const [token, setToken] = useState(() => saved?.access_token || null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("All");
  const [userTab, setUserTab] = useState("home");
  const [partnerTab, setPartnerTab] = useState("home");
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();

  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  const saveAuth = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ access_token: data.access_token, user: data.user }));
    } catch { /* storage may be full */ }
  }, []);

  const clearAuth = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  const loadReports = useCallback(async (u) => {
    if (!u) return;
    setLoading(true);
    try {
      const query = u.role === "school" ? `?submitted_by=${u.id}` : "";
      const data = await api(tokenRef.current).get(`/reports${query}`);
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadReports(user);
  }, [user, loadReports]);

  function handleAuthSuccess(data) {
    setToken(data.access_token);
    setUser(data.user);
    saveAuth(data);
    setStage("app");
    setReports([]);
  }

  function logout() {
    clearAuth();
    setUser(null);
    setRole(null);
    setToken(null);
    setStage("landing");
    setUserTab("home");
    setPartnerTab("home");
    setReports([]);
    setFilter("All");
  }

  async function advance(id) {
    await api(tokenRef.current).post(`/reports/${id}/advance`);
    addToast("Report status advanced!", "success");
    loadReports(user);
  }

  async function resetDemo() {
    await api(tokenRef.current).post("/reports/reset");
    addToast("Demo data has been reset.", "info");
    loadReports(user);
  }

  const isPartner = user && (user.role === "ngo" || user.role === "admin");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT_BODY }}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {stage === "landing" && <Landing onStart={() => setStage("roleSelect")} />}

      {stage === "roleSelect" && (
        <RoleSelect onBack={() => setStage("landing")} onPick={(r) => { setRole(r); setStage("login"); }} />
      )}

      {stage === "login" && (
        <LoginForm
          role={role}
          onBack={() => setStage("roleSelect")}
          onSuccess={handleAuthSuccess}
          goRegister={() => setStage("register")}
        />
      )}

      {stage === "register" && (
        <RegisterForm onBack={() => setStage("login")} onSuccess={handleAuthSuccess} />
      )}

      {stage === "app" && user && !isPartner && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <TopBar title="Pinkbloom" user={user} onLogout={logout} />
          <div style={{ flex: 1 }}>
            {userTab === "home" && <UserHome user={user} reports={reports} onNav={setUserTab} loading={loading} />}
            {userTab === "whatToReport" && <WhatToReport onBack={() => setUserTab("home")} />}
            {userTab === "submit" && <SubmitReport token={token} user={user} onBack={() => setUserTab("home")} onSubmitted={() => loadReports(user)} addToast={addToast} />}
            {userTab === "cases" && <MyCases reports={reports} onBack={() => setUserTab("home")} loading={loading} />}
          </div>
          <BottomNav
            tabs={[
              { id: "home", label: "Home", icon: Home },
              { id: "submit", label: "Report", icon: FileText },
              { id: "cases", label: "Cases", icon: MapPin },
            ]}
            active={userTab}
            onChange={setUserTab}
          />
        </div>
      )}

      {stage === "app" && user && isPartner && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <TopBar title="Partner Dashboard" user={user} onLogout={logout} />
          <div style={{ flex: 1 }}>
            {partnerTab === "home" && (
              <PartnerDashboard
                user={user}
                reports={reports}
                filter={filter}
                setFilter={setFilter}
                onAdvance={advance}
                onReset={resetDemo}
                loading={loading}
              />
            )}
            {partnerTab === "list" && (
              <div style={{ padding: "22px 18px" }}>
                <BackRow onBack={() => setPartnerTab("home")} label="All reports" />
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  {loading ? (
                    <Spinner />
                  ) : reports.length === 0 ? (
                    <div style={{ textAlign: "center", color: DIM, fontSize: 13, padding: "20px 0" }}>No reports yet.</div>
                  ) : (
                    reports.map((r) => <ReportCard key={r.id} report={r} showAdvance onAdvance={advance} />)
                  )}
                </div>
              </div>
            )}
          </div>
          <BottomNav
            tabs={[
              { id: "home", label: "Home", icon: Home },
              { id: "list", label: "Reports", icon: FileText },
            ]}
            active={partnerTab}
            onChange={setPartnerTab}
          />
        </div>
      )}
    </div>
  );
}

