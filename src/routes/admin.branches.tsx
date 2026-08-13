import { createFileRoute, useRouter } from "@tanstack/react-router";
import { adminOverview, upsertBranch, deleteBranch } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { HoursEditor, DEFAULT_HOURS, type HoursValue } from "@/components/admin/HoursEditor";

export const Route = createFileRoute("/admin/branches")({
  loader: () => adminOverview(),
  component: BranchesPage,
});

type Branch = Awaited<ReturnType<typeof adminOverview>>["branches"][number];

function BranchesPage() {
  const data = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Branch> | null>(null);
  const upsert = useServerFn(upsertBranch);
  const del = useServerFn(deleteBranch);

  const save = async (b: any) => {
    await upsert({ data: {
      id: b.id, name: b.name, address: b.address, phone: b.phone, email: b.email,
      city: b.city || "Pickering", image_url: b.image_url || "",
      hours: b.hours || DEFAULT_HOURS, active: b.active ?? true,
    }});
    setEditing(null);
    router.invalidate();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this branch?")) return;
    await del({ data: { id } });
    router.invalidate();
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <div className="flex justify-end">
        <button onClick={() => setEditing({ hours: DEFAULT_HOURS as any, active: true })}
          className="flex max-w-full items-center gap-2 border border-primary/50 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-5 sm:tracking-[0.28em]">
          <Plus size={14}/> Add branch
        </button>
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {data.branches.map(b => (
          <div key={b.id} className="min-w-0 border border-border/60 bg-card/40 p-4 sm:p-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
              {b.image_url && <img src={b.image_url} alt="" className="h-24 w-24 shrink-0 object-cover"/>}
              <div className="flex-1 min-w-0">
                <h3 className="break-words font-display text-xl">{b.name}</h3>
                <p className="mt-1 break-words text-xs text-muted-foreground">{b.address}</p>
                <p className="mt-2 break-words text-xs">{b.phone} · {b.email}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setEditing(b as any)} className="flex items-center gap-2 border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:border-primary/50">
                <Pencil size={12}/> Edit
              </button>
              <button onClick={() => remove(b.id)} className="flex items-center gap-2 border border-destructive/40 px-3 py-1.5 text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10">
                <Trash2 size={12}/> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && <BranchModal value={editing} onClose={() => setEditing(null)} onSave={save}/>}
    </div>
  );
}

function BranchModal({ value, onClose, onSave }: { value: any; onClose: () => void; onSave: (v: any) => void }) {
  const [v, setV] = useState<any>(value);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden bg-black/80 px-3 pb-8 pt-16 backdrop-blur sm:px-4 sm:pb-10 sm:pt-20">
      <div className="w-full max-w-2xl overflow-hidden border border-border bg-card">
        <div className="flex min-w-0 items-center justify-between gap-4 border-b border-border/60 px-4 py-4 sm:px-6">
          <h2 className="min-w-0 break-words font-display text-2xl">{v.id ? "Edit branch" : "New branch"}</h2>
          <button onClick={onClose} className="shrink-0"><X size={18}/></button>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            <Field label="Name"><input className="input" value={v.name||""} onChange={e=>setV({...v, name:e.target.value})}/></Field>
            <Field label="City"><input className="input" value={v.city||"Pickering"} onChange={e=>setV({...v, city:e.target.value})}/></Field>
            <Field label="Address" full><input className="input" value={v.address||""} onChange={e=>setV({...v, address:e.target.value})}/></Field>
            <Field label="Phone"><input className="input" value={v.phone||""} onChange={e=>setV({...v, phone:e.target.value})}/></Field>
            <Field label="Email"><input className="input" value={v.email||""} onChange={e=>setV({...v, email:e.target.value})}/></Field>
            <Field label="Image URL" full><input className="input" value={v.image_url||""} onChange={e=>setV({...v, image_url:e.target.value})} placeholder="https://..."/></Field>
          </div>
          <div className="mt-4">
            <p className="eyebrow mb-3">Opening hours (open / close)</p>
            <HoursEditor kind="branch" value={(v.hours as HoursValue) || DEFAULT_HOURS} onChange={h => setV({...v, hours: h})}/>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button onClick={onClose} className="border border-border px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.28em]">Cancel</button>
          <button onClick={() => onSave(v)} className="border border-primary bg-primary px-8 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary-foreground sm:tracking-[0.28em]">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block min-w-0 ${full ? "md:col-span-2" : ""}`}><span className="eyebrow mb-2 block">{label}</span>{children}</label>;
}
