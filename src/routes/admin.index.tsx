import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { adminOverview, updateBookingStatus, deleteBooking } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Scissors, Users, CalendarCheck, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useCurrentUser, scopeBookings, scopeByBranch } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/admin/")({
  loader: () => adminOverview(),
  component: AdminHome,
});

type Filter = "upcoming" | "today" | "week" | "month" | "past" | "all";

function AdminHome() {
  const raw = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const { user } = useCurrentUser();
  const data = useMemo(() => ({
    ...raw,
    bookings: scopeBookings(raw.bookings, user),
    barbers: scopeByBranch(raw.barbers, user),
    branches: user.role === "owner" ? raw.branches : raw.branches.filter(b => b.id === user.branchId),
  }), [raw, user]);
  const router = useRouter();
  const update = useServerFn(updateBookingStatus);
  const del = useServerFn(deleteBooking);
  const [filter, setFilter] = useState<Filter>("upcoming");

  const now = Date.now();
  const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
  const endOfToday = new Date(); endOfToday.setHours(23,59,59,999);
  const weekAhead = now + 7 * 86400000;
  const monthAhead = now + 30 * 86400000;

  const list = useMemo(() => {
    const b = data.bookings;
    switch (filter) {
      case "upcoming": return b.filter(x => new Date(x.start_at).getTime() >= now && x.status === "confirmed");
      case "today":    return b.filter(x => { const t = new Date(x.start_at).getTime(); return t >= startOfToday.getTime() && t <= endOfToday.getTime(); });
      case "week":     return b.filter(x => { const t = new Date(x.start_at).getTime(); return t >= now && t <= weekAhead; });
      case "month":    return b.filter(x => { const t = new Date(x.start_at).getTime(); return t >= now && t <= monthAhead; });
      case "past":     return b.filter(x => new Date(x.start_at).getTime() < now);
      default:         return b;
    }
  }, [data.bookings, filter, now]);

  const counts = {
    upcoming: data.bookings.filter(x => new Date(x.start_at).getTime() >= now && x.status === "confirmed").length,
    today:    data.bookings.filter(x => { const t = new Date(x.start_at).getTime(); return t >= startOfToday.getTime() && t <= endOfToday.getTime(); }).length,
  };

  const stats = [
    { key: "upcoming" as Filter, icon: CalendarCheck, label: "Upcoming", value: counts.upcoming, tone: "text-primary" },
    { key: "today" as Filter,    icon: CalendarCheck, label: "Today",    value: counts.today,    tone: "text-emerald-400" },
    { key: null,                  icon: Building2,     label: "Branches", value: data.branches.length, to: "/admin/branches" },
    { key: null,                  icon: Users,         label: "Barbers",  value: data.barbers.length,  to: "/admin/barbers" },
    { key: null,                  icon: Scissors,      label: "Services", value: data.services.length, to: "/admin/services" },
  ];

  const remove = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    await del({ data: { id } });
    router.invalidate();
  };
  const setStatus = async (id: string, status: string) => {
    await update({ data: { id, status: status as any } });
    router.invalidate();
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => {
          const isActive = s.key && s.key === filter;
          const inner = (
            <>
              <div className="flex items-center justify-between text-muted-foreground">
                <s.icon size={16}/>
                <span className="text-[10px] uppercase tracking-[0.24em]">{s.label}</span>
              </div>
              <p className={`mt-3 font-display text-3xl md:text-4xl ${s.tone ?? ""}`}>{s.value}</p>
            </>
          );
          const cls = `text-left border p-5 backdrop-blur transition-all ${
            isActive ? "border-primary bg-primary/10" : "border-border/60 bg-card/40 hover:border-primary/40"
          }`;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              {s.to ? (
                <Link to={s.to} className={cls + " block"}>{inner}</Link>
              ) : (
                <button onClick={() => s.key && setFilter(s.key)} className={cls + " w-full"}>{inner}</button>
              )}
            </motion.div>
          );
        })}
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-2xl capitalize">{filter} bookings</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {(["upcoming","today","week","month","past","all"] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] border ${
                  filter === f ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"
                }`}>{f}</button>
            ))}
            <Link to="/admin/new-booking"
              className="flex items-center gap-1 border border-primary bg-primary text-primary-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.24em]">
              <Plus size={12}/> New
            </Link>
          </div>
        </div>

        <div className="border border-border/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-card/60 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Barber</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 25).map(b => {
                const branch = data.branches.find(x => x.id === b.branch_id);
                const barber = data.barbers.find(x => x.id === b.barber_id);
                return (
                  <tr key={b.id} className="border-t border-border/40 hover:bg-primary/5">
                    <td className="px-4 py-3">
                      <div>{b.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{b.customer_email}</div>
                    </td>
                    <td className="px-4 py-3">{new Date(b.start_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}</td>
                    <td className="px-4 py-3">{branch?.name ?? "—"}</td>
                    <td className="px-4 py-3">{barber?.name ?? "—"}</td>
                    <td className="px-4 py-3"><StatusPill status={b.status}/></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select value={b.status} onChange={e => setStatus(b.id, e.target.value)}
                          className="border border-border bg-card/40 px-2 py-1 text-xs">
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no_show">No show</option>
                        </select>
                        <button onClick={() => remove(b.id)} title="Delete"
                          className="border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-8">Nothing here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "border-primary/40 text-primary",
    completed: "border-emerald-500/40 text-emerald-400",
    cancelled: "border-destructive/40 text-destructive",
    no_show: "border-muted-foreground/40 text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-widest ${map[status] ?? "border-border"}`}>
      {status}
    </span>
  );
}
