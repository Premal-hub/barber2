import { createFileRoute, useRouter } from "@tanstack/react-router";
import { adminOverview, updateBookingStatus, deleteBooking } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { StatusPill } from "./admin.index";
import { motion } from "framer-motion";
import { Download, Trash2, Lock } from "lucide-react";
import { useCurrentUser, scopeBookings } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/admin/bookings")({
  loader: () => adminOverview(),
  component: BookingsPage,
});

const LOCK_DAYS = 5;

function BookingsPage() {
  const raw = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const { user } = useCurrentUser();
  const data = useMemo(() => ({ ...raw, bookings: scopeBookings(raw.bookings, user) }), [raw, user]);
  const router = useRouter();
  const update = useServerFn(updateBookingStatus);
  const del = useServerFn(deleteBooking);
  const [tab, setTab] = useState<string>(user.role === "manager" && user.branchId ? user.branchId : "all");
  const [search, setSearch] = useState("");

  const setStatus = async (id: string, status: "confirmed" | "cancelled" | "completed" | "no_show") => {
    await update({ data: { id, status } });
    router.invalidate();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this booking permanently?")) return;
    await del({ data: { id } });
    router.invalidate();
  };

  const filtered = useMemo(() => {
    let list = tab === "all" ? data.bookings : data.bookings.filter(b => b.branch_id === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q) ||
        (b.customer_phone ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [tab, search, data.bookings]);

  const rows = filtered.map(b => {
    const branch = data.branches.find(x => x.id === b.branch_id);
    const barber = data.barbers.find(x => x.id === b.barber_id);
    const links = data.bookingServices.filter(l => l.booking_id === b.id).sort((a, c) => a.sort_order - c.sort_order);
    const services = links.length ? links : [];
    const svcNames = services.length
      ? services.map(l => data.services.find(s => s.id === l.service_id)?.name ?? "?").join(", ")
      : data.services.find(s => s.id === b.service_id)?.name ?? "—";
    const totalCents = services.reduce((sum, l) => sum + (l.price_cents || 0), 0)
      || (data.services.find(s => s.id === b.service_id)?.price_cents ?? 0);
    const dur = Math.round((new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / 60000);
    const daysUntil = Math.floor((new Date(b.start_at).getTime() - Date.now()) / 86400000);
    const daysSinceCreated = Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000);
    const locked = daysSinceCreated >= LOCK_DAYS;
    return { b, branch, barber, svcNames, totalCents, dur, daysUntil, locked };
  });

  const downloadCSV = () => {
    const header = ["When","Customer","Email","Phone","Branch","Barber","Services","Duration (min)","Amount (CAD)","Status","Booked at"];
    const lines = rows.map(({ b, branch, barber, svcNames, totalCents, dur }) => [
      new Date(b.start_at).toLocaleString("en-CA", { timeZone: "America/Toronto" }),
      b.customer_name, b.customer_email, b.customer_phone ?? "",
      branch?.name ?? "", barber?.name ?? "", svcNames, dur,
      (totalCents / 100).toFixed(2), b.status,
      new Date(b.created_at).toLocaleString("en-CA", { timeZone: "America/Toronto" }),
    ]);
    const csv = [header, ...lines].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2 border-b border-border/60 flex-1 min-w-0">
          {user.role === "owner" && <TabBtn active={tab === "all"} onClick={() => setTab("all")}>All branches</TabBtn>}
          {data.branches
            .filter(b => user.role === "owner" || b.id === user.branchId)
            .map(b => (
              <TabBtn key={b.id} active={tab === b.id} onClick={() => setTab(b.id)}>{b.name}</TabBtn>
            ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name / email"
            className="border border-border bg-card/40 px-3 py-2 text-xs w-44 sm:w-56 focus:border-primary focus:outline-none"
          />
          <button onClick={downloadCSV}
            className="flex items-center gap-2 border border-primary/50 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-primary hover:bg-primary hover:text-primary-foreground">
            <Download size={12}/> Export CSV
          </button>
        </div>
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="border border-border/60 overflow-x-auto">
        <table className="w-full text-sm min-w-[1050px]">
          <thead className="bg-card/60 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Contact</th>
              <th className="text-left px-4 py-3">Services</th>
              <th className="text-left px-4 py-3">Barber</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ b, barber, svcNames, totalCents, dur, locked }) => (
              <tr key={b.id} className="border-t border-border/40">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(b.start_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}</td>
                <td className="px-4 py-3">{b.customer_name}</td>
                <td className="px-4 py-3 text-xs">
                  <div>{b.customer_email}</div>
                  {b.customer_phone && <div className="text-muted-foreground">{b.customer_phone}</div>}
                </td>
                <td className="px-4 py-3 text-xs">{svcNames}</td>
                <td className="px-4 py-3">{barber?.name ?? "—"}</td>
                <td className="px-4 py-3">{dur} min</td>
                <td className="px-4 py-3 whitespace-nowrap">${(totalCents/100).toFixed(2)}</td>
                <td className="px-4 py-3"><StatusPill status={b.status}/></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {locked ? (
                      <span title={`Status locked ${LOCK_DAYS}+ days after booking`}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Lock size={10}/> Locked
                      </span>
                    ) : (
                      <select
                        value={b.status}
                        onChange={e => setStatus(b.id, e.target.value as any)}
                        className="border border-border bg-card/40 px-2 py-1 text-xs"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No show</option>
                      </select>
                    )}
                    <button onClick={() => remove(b.id)} title="Delete"
                      className="border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted-foreground py-10">No bookings.</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
        Status changes are locked {LOCK_DAYS} days after a booking is created.
      </p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors border-b-2 -mb-px ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}>{children}</button>
  );
}
