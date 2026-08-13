import { createFileRoute, useRouter } from "@tanstack/react-router";
import { adminOverview, upsertBarber, deleteBarber } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UserPlus, Trash2, X, Crown, Briefcase, User as UserIcon } from "lucide-react";
import { DEFAULT_SCHEDULE } from "@/components/admin/HoursEditor";
import { useCurrentUser, setCurrentUser, type AdminRole } from "@/hooks/useCurrentUser";

// Owner-only user directory. In dev-mode, employees are backed by the `barbers` table
// (each barber = one employee login). Role assignments are stored in localStorage until
// real auth ships; the shape maps 1:1 to a future user_profiles table.
export const Route = createFileRoute("/admin/employees")({
  loader: () => adminOverview(),
  component: EmployeesPage,
});

const ROLE_KEY = "admin:role-assignments";
type Assignments = Record<string, { role: AdminRole; branchId?: string | null }>;

function loadAssignments(): Assignments {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(ROLE_KEY) ?? "{}"); } catch { return {}; }
}
function saveAssignments(a: Assignments) { window.localStorage.setItem(ROLE_KEY, JSON.stringify(a)); }

function EmployeesPage() {
  const data = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const router = useRouter();
  const { user } = useCurrentUser();
  const upsert = useServerFn(upsertBarber);
  const del = useServerFn(deleteBarber);
  const [assignments, setAssignments] = useState<Assignments>(loadAssignments());
  const [invite, setInvite] = useState<any | null>(null);

  if (user.role !== "owner") {
    return <p className="text-sm text-muted-foreground">Only the Owner can manage employees.</p>;
  }

  const setRoleFor = (id: string, role: AdminRole, branchId?: string | null) => {
    const next = { ...assignments, [id]: { role, branchId: branchId ?? null } };
    setAssignments(next); saveAssignments(next);
  };

  const invitedSave = async (v: any) => {
    // Create the barber (employee) record. Role assignment stored client-side for now.
    const res = await upsert({ data: {
      branch_id: v.branch_id, name: v.name, title: v.title || "", bio: "",
      email: v.email, avatar_url: "", schedule: DEFAULT_SCHEDULE,
      sort_order: 0, active: true,
    }});
    setRoleFor((res as any).id, v.role, v.branch_id);
    setInvite(null); router.invalidate();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this employee?")) return;
    await del({ data: { id } });
    const next = { ...assignments }; delete next[id]; setAssignments(next); saveAssignments(next);
    router.invalidate();
  };

  const impersonate = (b: any, role: AdminRole) => {
    setCurrentUser({
      role, branchId: b.branch_id, barberId: role === "employee" ? b.id : null,
      displayName: role === "employee" ? b.name : `Manager · ${data.branches.find(x => x.id === b.branch_id)?.name ?? ""}`,
    });
    window.location.href = "/admin";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-xl">
          Employees are staff who can sign into the admin panel. Owner sees everything; Manager is scoped to one branch; Employee is scoped to their own bookings and schedule.
        </p>
        <button onClick={() => setInvite({ role: "employee", branch_id: data.branches[0]?.id })}
          className="flex items-center gap-2 border border-primary bg-primary text-primary-foreground px-5 py-2.5 text-[11px] uppercase tracking-[0.28em]">
          <UserPlus size={14}/> Invite employee
        </button>
      </div>

      <div className="border border-border/60 overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-card/60 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Branch</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.barbers.map(b => {
              const branch = data.branches.find(x => x.id === b.branch_id);
              const assigned = assignments[b.id]?.role ?? "employee";
              return (
                <tr key={b.id} className="border-t border-border/40">
                  <td className="px-4 py-3">{b.name}<div className="text-xs text-muted-foreground">{b.title}</div></td>
                  <td className="px-4 py-3 text-xs">{b.email}</td>
                  <td className="px-4 py-3 text-xs">{branch?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select value={assigned} onChange={e => setRoleFor(b.id, e.target.value as AdminRole, b.branch_id)}
                      className="border border-border bg-card/40 px-2 py-1 text-xs">
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => impersonate(b, assigned)} title="View as this user"
                        className="border border-border px-2 py-1.5 text-[10px] uppercase tracking-widest hover:border-primary/50 inline-flex items-center gap-1">
                        {assigned === "owner" ? <Crown size={12}/> : assigned === "manager" ? <Briefcase size={12}/> : <UserIcon size={12}/>} View as
                      </button>
                      <button onClick={() => remove(b.id)}
                        className="border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.barbers.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No employees yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {invite && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Invite employee</h2>
              <button onClick={() => setInvite(null)}><X size={18}/></button>
            </div>
            <div className="grid gap-4">
              <label><span className="eyebrow mb-2 block">Full name</span>
                <input className="input" value={invite.name||""} onChange={e=>setInvite({...invite, name:e.target.value})}/></label>
              <label><span className="eyebrow mb-2 block">Email</span>
                <input className="input" value={invite.email||""} onChange={e=>setInvite({...invite, email:e.target.value})}/></label>
              <label><span className="eyebrow mb-2 block">Title</span>
                <input className="input" value={invite.title||""} onChange={e=>setInvite({...invite, title:e.target.value})} placeholder="Master Barber"/></label>
              <div className="grid gap-4 grid-cols-2">
                <label><span className="eyebrow mb-2 block">Branch</span>
                  <select className="input" value={invite.branch_id||""} onChange={e=>setInvite({...invite, branch_id:e.target.value})}>
                    {data.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select></label>
                <label><span className="eyebrow mb-2 block">Role</span>
                  <select className="input" value={invite.role||"employee"} onChange={e=>setInvite({...invite, role:e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select></label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setInvite(null)} className="border border-border px-6 py-2.5 text-[11px] uppercase tracking-[0.28em]">Cancel</button>
              <button onClick={() => invitedSave(invite)} disabled={!invite.name || !invite.email || !invite.branch_id}
                className="border border-primary bg-primary px-8 py-2.5 text-[11px] uppercase tracking-[0.28em] text-primary-foreground disabled:opacity-50">Send invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
