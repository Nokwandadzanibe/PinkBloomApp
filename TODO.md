# MVP Completion — Task List

## Backend skeleton (make it start reliably + clean)
- [x] Fix DB startup crash (migrate old users schema that lacks `email`)
- [x] Restrict CORS origin via env var (default `*` for local demo)
- [x] Add `.gitignore` (venv, *.db, __pycache__, logs)

## Frontend (polish to "perfect")
- [x] Persist auth in localStorage (restore session on refresh, logout clears)
- [x] Replace `alert()` with inline toast notifications
- [x] Add submit-success screen after reporting
- [x] Inline form validation with clear error states (login/register/report)
- [x] Status progress indicator on report cards
- [x] Fill partner "Reports" bottom-nav tab (no-op today)
- [x] Show profile info in top bar (name + role)

## Docs
- [x] Update README with current flow + demo credentials

## Verify
- [x] Backend starts and /health returns ok
- [x] Frontend builds (`npm run build`)

