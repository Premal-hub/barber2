// Dev-mode RBAC. Simulates the Owner / Manager / Employee hierarchy via localStorage
// without turning real auth back on. When real auth ships, swap the storage read for
// a server fn that returns the same shape (role, branchId, barberId) — pages don't change.
import { useSyncExternalStore, useCallback } from "react";

export type AdminRole = "owner" | "manager" | "employee";

export type CurrentUser = {
  role: AdminRole;
  branchId: string | null;   // required for manager/employee
  barberId: string | null;   // required for employee
  displayName: string;
};

const KEY = "admin:current-user";
const DEFAULT: CurrentUser = { role: "owner", branchId: null, barberId: null, displayName: "Owner" };

let cached: CurrentUser = DEFAULT;
let cachedRaw: string | null = "__init__";

function read(): CurrentUser {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    cached = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    return cached;
  } catch { return DEFAULT; }
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function snapshot() { return read(); }
function serverSnapshot() { return DEFAULT; }

export function setCurrentUser(u: CurrentUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(u));
  cachedRaw = JSON.stringify(u);
  cached = { ...DEFAULT, ...u };
  listeners.forEach(fn => fn());
}

export function useCurrentUser() {
  const user = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const setUser = useCallback((u: CurrentUser) => setCurrentUser(u), []);
  return { user, setUser };
}

// Helpers used by admin pages to filter datasets by role scope.
export function scopeBookings<T extends { branch_id: string; barber_id: string }>(rows: T[], u: CurrentUser): T[] {
  if (u.role === "owner") return rows;
  if (u.role === "manager") return u.branchId ? rows.filter(r => r.branch_id === u.branchId) : [];
  if (u.role === "employee") return u.barberId ? rows.filter(r => r.barber_id === u.barberId) : [];
  return rows;
}

export function scopeByBranch<T extends { branch_id: string }>(rows: T[], u: CurrentUser): T[] {
  if (u.role === "owner") return rows;
  return u.branchId ? rows.filter(r => r.branch_id === u.branchId) : [];
}

export function canManageBranches(u: CurrentUser) { return u.role === "owner"; }
export function canManageServices(u: CurrentUser) { return u.role === "owner"; }
export function canManageEmployees(u: CurrentUser) { return u.role === "owner"; }
export function canManageAllBarbers(u: CurrentUser) { return u.role === "owner" || u.role === "manager"; }
