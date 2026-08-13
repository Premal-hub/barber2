import { createFileRoute, useRouter } from "@tanstack/react-router";
import { adminOverview, upsertBarber, deleteBarber } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, X, User } from "lucide-react";
import { HoursEditor, DEFAULT_SCHEDULE, type HoursValue } from "@/components/admin/HoursEditor";
import { useCurrentUser, scopeByBranch } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/admin/barbers")({
  loader: () => adminOverview(),
  component: BarbersPage,
});

function BarbersPage() {
  const raw = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const { user } = useCurrentUser();
  const data = useMemo(() => ({
    ...raw,
    barbers: scopeByBranch(raw.barbers, user),
    branches: user.role === "owner" ? raw.branches : raw.branches.filter(b => b.id === user.branchId),
  }), [raw, user]);
  const router = useRouter();
  const [editing, setEditing] = useState<any | null>(null);
  const upsert = useServerFn(upsertBarber);
  const del = useServerFn(deleteBarber);

  const save = async (b: any) => {
    await upsert({ data: {
      id: b.id, branch_id: b.branch_id, name: b.name, title: b.title || "",
      bio: b.bio || "", email: b.email, avatar_url: b.avatar_url || "",
      schedule: b.schedule || DEFAULT_SCHEDULE, sort_order: Number(b.sort_order) || 0,
      active: b.active ?? true,
    }});
    setEditing(null); router.invalidate();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this barber?")) return;
    await del({ data: { id } }); router.invalidate();
  };

  const grouped = data.branches.map(br => ({
    branch: br,
    barbers: data.barbers.filter(b => b.branch_id === br.id),
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => setEditing({ active: true, schedule: DEFAULT_SCHEDULE, branch_id: data.branches[0]?.id })}
          className="flex items-center gap-2 border border-primary/50 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] text-primary hover:bg-primary hover:text-primary-foreground">
          <Plus size={14}/> Add barber
        </button>
      </div>

      {grouped.map(g => (
        <section key={g.branch.id}>
          <h2 className="font-display text-xl mb-3">{g.branch.name}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {g.barbers.length === 0 && <p className="text-sm text-muted-foreground">No barbers yet.</p>}
            {g.barbers.map(b => (
              <div key={b.id} className="border border-border/60 bg-card/40 p-5">
                <div className="flex gap-4">
                  {b.avatar_url
                    ? <img src={b.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border border-border"/>
                    : <div className="w-16 h-16 rounded-full grid place-items-center bg-card border border-border text-muted-foreground"><User size={20}/></div>}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg leading-tight">{b.name}</h3>
                    <p className="text-xs text-muted-foreground">{b.title}</p>
                    <p className="mt-1 text-xs">{b.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditing(b)} className="flex items-center gap-1 border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:border-primary/50">
                    <Pencil size={12}/> Edit
                  </button>
                  <button onClick={() => remove(b.id)} className="flex items-center gap-1 border border-destructive/40 px-3 py-1.5 text-[10px] uppercase tracking-widest text-destructive">
                    <Trash2 size={12}/> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-start justify-center p-4 overflow-auto">
          <div className="w-full max-w-2xl bg-card border border-border p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{editing.id ? "Edit barber" : "New barber"}</h2>
              <button onClick={() => setEditing(null)}><X size={18}/></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="eyebrow mb-2 block">Branch</span>
                <select className="input" value={editing.branch_id||""} onChange={e=>setEditing({...editing, branch_id:e.target.value})}>
                  <option value="">Select…</option>
                  {data.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></label>
              <label><span className="eyebrow mb-2 block">Name</span>
                <input className="input" value={editing.name||""} onChange={e=>setEditing({...editing, name:e.target.value})}/></label>
              <label><span className="eyebrow mb-2 block">Title</span>
                <input className="input" value={editing.title||""} onChange={e=>setEditing({...editing, title:e.target.value})} placeholder="Master Barber"/></label>
              <label><span className="eyebrow mb-2 block">Email</span>
                <input className="input" value={editing.email||""} onChange={e=>setEditing({...editing, email:e.target.value})}/></label>
              <label className="md:col-span-2"><span className="eyebrow mb-2 block">Photo URL</span>
                <input className="input" value={editing.avatar_url||""} onChange={e=>setEditing({...editing, avatar_url:e.target.value})} placeholder="https://..."/></label>
              <label className="md:col-span-2"><span className="eyebrow mb-2 block">Bio</span>
                <textarea rows={3} className="input" value={editing.bio||""} onChange={e=>setEditing({...editing, bio:e.target.value})}/></label>
            </div>
            <div className="mt-6">
              <p className="eyebrow mb-3">Working hours & availability rules</p>
              <p className="text-xs text-muted-foreground mb-3">Uncheck a day to mark it as a day off. Bookings can only occur within these hours.</p>
              <HoursEditor kind="barber" value={(editing.schedule as HoursValue) || DEFAULT_SCHEDULE} onChange={s => setEditing({...editing, schedule: s})}/>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="border border-border px-6 py-2.5 text-[11px] uppercase tracking-[0.28em]">Cancel</button>
              <button onClick={() => save(editing)} className="border border-primary bg-primary px-8 py-2.5 text-[11px] uppercase tracking-[0.28em] text-primary-foreground">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
