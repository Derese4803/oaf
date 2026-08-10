# Organization Management System — MVP

A full-stack starter for the platform you spec'd: role-based field reporting
(Manager → Field Manager → Supervisor → Enumerator), departments/teams,
approvals, HR user creation, attendance & schedule alerts, and a letter
management module.

This is a **working Phase 1 MVP** (per the development plan in your doc) with
pieces of Phase 2 (letters, notifications) included, since you asked for those
directly. It's meant as a solid foundation to build the rest on — not the
full four-phase platform in one shot.

## Stack

- **Backend:** Node.js + Express + Prisma + SQLite (swap to Postgres/Neon in
  one config change — see below)
- **Frontend:** Next.js (App Router) + Tailwind CSS + Recharts
- **Auth:** JWT, bcrypt-hashed passwords, role-based middleware

## What's included (Phase 1 + requested extras)

- Login/security, JWT auth, role-based access
- Departments (M&E, Tree Team, Innovation, Procurement, HR — seeded)
- Staff & Teams, team membership
- Field report submission (Enumerator) → review/approve/reject
  (Supervisor/Field Manager/Manager)
- Dashboard with live stats + department performance chart
- HR "Create User" flow (employee ID, role, username/password, department)
- Attendance: clock in/out, breaks, daily log
- Schedule alerts: coffee time, lunch, end-of-day, Happy Friday
  (rule-based, admin-editable in `backend/src/routes/notifications.js`)
- Letter management: create, reference numbering, status flow
  (Draft → Pending Approval → Approved → Signed → Sent → Archived)

## Not yet built (Phase 2–4, per your own plan)

- Digital signatures, PDF generation, file/photo uploads, GPS capture
- GIS/map view, offline PWA data collection
- Advanced analytics, audit logs, government system integrations

These are natural next additions on top of this foundation.

## Running it locally

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API runs on `http://localhost:4000`.

Seeded demo accounts (all use password `password123`):

| Username     | Role          |
|--------------|---------------|
| admin        | Super Admin   |
| manager1     | Manager       |
| fieldmgr1    | Field Manager |
| supervisor1  | Supervisor    |
| abebe.k      | Enumerator    |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` — it proxies `/api/*` to the backend automatically.

## Switching to Postgres/Neon

1. In `backend/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `backend/.env`, set `DATABASE_URL` to your Neon connection string.
3. Run `npx prisma migrate dev --name init` again.

## Project structure

```
org-system/
├── backend/
│   ├── prisma/schema.prisma   # data model
│   ├── prisma/seed.js         # sample data
│   └── src/
│       ├── routes/            # one file per resource
│       ├── middleware/auth.js # JWT + role checks
│       └── index.js           # server entry
└── frontend/
    ├── app/                   # one folder per page (Next.js App Router)
    ├── components/            # Sidebar, Navbar, StatCard, ProtectedRoute
    └── lib/                   # api client, auth/session helpers
```

## Notes on security

- Passwords are bcrypt-hashed; HR/admins can reset but never view them.
- Change `JWT_SECRET` in `backend/.env` before any real deployment.
- Add HTTPS, rate limiting, and audit logging before production use.
