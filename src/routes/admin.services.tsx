import { createFileRoute, useRouter } from "@tanstack/react-router";
import { adminOverview, upsertService, deleteService } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export const Route = createFileRoute("/admin/services")({
  loader: () => adminOverview(),
  component: ServicesPage,
});

function ServicesPage() {
  const data = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const router = useRouter();
  const [editing, setEditing] = useState<any | null>(null);
  const upsert = useServerFn(upsertService);
  const del = useServerFn(deleteService);

  const save = async (s: any) => {
    await upsert({ data: {
      id: s.id, name: s.name, description: s.description || "",
      duration_minutes: Number(s.duration_minutes) || 30,
      price_cents: Math.round(Number(s.price_dollars || 0) * 100),
      sort_order: Number(s.sort_order) || 0, active: s.active ?? true,
    }});
    setEditing(null); router.invalidate();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await del({ data: { id } }); router.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setEditing({ active: true, duration_minutes: 30, price_dollars: 45 })}
          className="flex items-center gap-2 border border-primary/50 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] text-primary hover:bg-primary hover:text-primary-foreground">
          <Plus size={14}/> Add service
        </button>
      </div>

      <div className="border border-border/60 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Active</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.services.map(s => (
              <tr key={s.id} className="border-t border-border/40 hover:bg-primary/5">
                <td className="px-4 py-3">
                  <div>{s.name}</div>
                  {s.description && <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>}
                </td>
                <td className="px-4 py-3">{s.duration_minutes} min</td>
                <td className="px-4 py-3">${(s.price_cents/100).toFixed(2)}</td>
                <td className="px-4 py-3">{s.active ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => setEditing({ ...s, price_dollars: s.price_cents / 100 })}
                    className="border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:border-primary/50 inline-flex items-center gap-1">
                    <Pencil size={12}/> Edit
                  </button>
                  <button onClick={() => remove(s.id)}
                    className="border border-destructive/40 px-3 py-1.5 text-[10px] uppercase tracking-widest text-destructive inline-flex items-center gap-1">
                    <Trash2 size={12}/> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{editing.id ? "Edit service" : "New service"}</h2>
              <button onClick={() => setEditing(null)}><X size={18}/></button>
            </div>
            <div className="grid gap-4">
              <label><span className="eyebrow mb-2 block">Name</span>
                <input className="input" value={editing.name||""} onChange={e=>setEditing({...editing, name:e.target.value})}/></label>
              <label><span className="eyebrow mb-2 block">Description</span>
                <textarea rows={3} className="input" value={editing.description||""} onChange={e=>setEditing({...editing, description:e.target.value})}/></label>
              <div className="grid gap-4 grid-cols-2">
                <label><span className="eyebrow mb-2 block">Duration (min)</span>
                  <input type="number" className="input" value={editing.duration_minutes||30} onChange={e=>setEditing({...editing, duration_minutes:e.target.value})}/></label>
                <label><span className="eyebrow mb-2 block">Price (CAD)</span>
                  <input type="number" step="0.01" className="input" value={editing.price_dollars||0} onChange={e=>setEditing({...editing, price_dollars:e.target.value})}/></label>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={editing.active ?? true} onChange={e=>setEditing({...editing, active:e.target.checked})}/>
                Active
              </label>
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
