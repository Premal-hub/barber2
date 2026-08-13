# Admin refactor: folder split + RBAC (dev-mode)

## 1. Folder split (admin only)

Move admin UI + logic into two folders. Public site (`/`, `/book`, `/login`) untouched.

```text
src/
  frontend/admin/         ← UI only (components, pages, forms, tables)
    layout/AdminShell.tsx
    components/RoleSwitcher.tsx
    components/BookingsTable.tsx
    components/BranchScopeBadge.tsx
    pages/Overview.tsx
    pages/Bookings.tsx
    pages/NewBooking.tsx
    pages/Branches.tsx
    pages/Services.tsx
    pages/Barbers.tsx
    pages/Employees.tsx     (new — owner-only user mgmt)
    pages/MySchedule.tsx    (new — employee availability)
  backend/admin/          ← server fns, zod schemas, scoping helpers
    admin.functions.ts    (moved from src/lib/admin.functions.ts)
    employees.functions.ts (new)
    scope.ts              (role/branch filter helpers)
    schemas.ts
  routes/admin*.tsx       ← thin route files that just import from frontend/admin/pages
```

Route files stay under `src/routes/` (TanStack requires it) but shrink to 2–5 lines each — real work lives in `src/frontend/admin/pages/*`.

## 2. RBAC (dev-mode, auth still bypassed)

Per your choice, we **don't** turn login on. Instead we simulate role + branch via a header switcher persisted to `localStorage`, exposed through a `useCurrentUser()` hook. Every page reads from it and filters accordingly. When you later flip auth on, swap the hook's implementation to read from `user_roles` — pages don't change.

### Roles

- **Owner** — sees everything across all branches. Full CRUD on branches, services, barbers, employees, bookings.
- **Manager** — locked to one branch. Sees only that branch's bookings/barbers/services. Can create bookings, manage barbers in their branch, cannot touch branches or other managers.
- **Employee** (barber) — locked to one branch + one barber profile. Can:
  - View own bookings only
  - Create bookings assigned to themselves
  - Manage own availability (blocks time slots via `barber.schedule`)

### Header switcher

Top-right dropdown: `👑 Owner · 💼 Manager (Branch A) · 👥 Employee (Alex @ Branch A)`. Picks role + branch + barber_id, stores in localStorage, reloads current view. A "DEV MODE" pill next to it makes it clear this isn't real auth.

### Scoping (backend/admin/scope.ts)

Single helper `applyScope(query, ctx)` that all server fns route through:
- Owner → no filter
- Manager → `.eq('branch_id', ctx.branchId)`
- Employee → `.eq('barber_id', ctx.barberId)`

Server fns accept `{ actor: { role, branchId?, barberId? } }` passed from the client hook (dev-mode only — real version will read from `user_roles` server-side).

## 3. New pages

- **Employees** (owner-only, `/admin/employees`): list barbers with role assignment, invite modal (email + role + branch), toggle active/inactive. Backed by existing `barbers` table plus a local `role` field stored in localStorage map (until real auth).
- **My Schedule** (employee, `/admin/my-schedule`): weekly grid; toggle unavailable slots → writes to `barbers.schedule` for that barber. Booking flow already respects `schedule`.

## 4. Booking flow already respects blocks

`src/lib/booking.functions.ts` reads `barbers.schedule`. Employee blocking their Tuesday afternoon → those slots hidden on the public `/book` page automatically. No change needed there.

## Technical notes

- No DB migration needed for the dev-mode version. When we later enable real auth, we'll add `user_profiles(user_id, role, branch_id, barber_id)` and switch `useCurrentUser()` from localStorage to a server fn.
- Existing route files under `src/routes/admin.*.tsx` will re-export from `src/frontend/admin/pages/*` — same URLs, same behavior, cleaner code.
- `src/lib/admin.functions.ts` stays as a re-export shim so nothing breaks mid-migration.
- Nav in `src/routes/admin.tsx` becomes role-aware: Employees see only `Overview · My Bookings · New Booking · My Schedule`; Managers hide `Branches`; Owner sees everything + `Employees`.

## Out of scope (per your answers)

- Real Supabase login for admin (bypass stays)
- Public homepage changes
- Splitting `/` or `/book` into frontend/backend folders

Ready to build?