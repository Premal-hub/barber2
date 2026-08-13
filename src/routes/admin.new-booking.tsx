import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";
import { getBookingCatalog, getAvailableSlots, createBooking } from "@/lib/booking.functions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/admin/new-booking")({
  loader: () => getBookingCatalog(),
  component: AdminNewBooking,
});

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function AdminNewBooking() {
  const catalog = Route.useLoaderData() as Awaited<ReturnType<typeof getBookingCatalog>>;
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [branchId, setBranchId] = useState<string>(user.branchId ?? "");
  const [barberId, setBarberId] = useState<string>(user.role === "employee" ? (user.barberId ?? "") : "");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [dateISO, setDateISO] = useState(todayISO());
  const [time, setTime] = useState<string>("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", notes: "" });
  const [done, setDone] = useState<string | null>(null);

  // Employees/managers are locked to their branch; employees also locked to their barber.
  useEffect(() => {
    if (user.branchId && branchId !== user.branchId) setBranchId(user.branchId);
    if (user.role === "employee" && user.barberId && barberId !== user.barberId) setBarberId(user.barberId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role, user.branchId, user.barberId]);

  const getSlotsFn = useServerFn(getAvailableSlots);
  const createFn = useServerFn(createBooking);

  const branchesForRole = user.role === "owner" ? catalog.branches : catalog.branches.filter(b => b.id === user.branchId);
  const barbersForBranch = catalog.barbers.filter(b => b.branch_id === branchId)
    .filter(b => user.role !== "employee" || b.id === user.barberId);
  const selectedServices = catalog.services.filter(s => serviceIds.includes(s.id));
  const totalDur = selectedServices.reduce((a, s) => a + s.duration_minutes, 0);
  const totalCents = selectedServices.reduce((a, s) => a + s.price_cents, 0);

  const canQuerySlots = !!branchId && !!barberId && serviceIds.length > 0 && !!dateISO;
  const slots = useQuery({
    queryKey: ["admin-slots", branchId, barberId, serviceIds.join(","), dateISO],
    enabled: canQuerySlots,
    queryFn: () => getSlotsFn({ data: { branchId, barberId, serviceIds, dateISO } }),
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: {
      branchId, barberId, serviceIds, dateISO, time, customer,
    }}),
    onSuccess: (r) => setDone(r.bookingId),
  });

  const canSubmit = branchId && barberId && serviceIds.length > 0 && dateISO && time
    && customer.name.length > 1 && /.+@.+\..+/.test(customer.email);

  const toggleService = (id: string) =>
    setServiceIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  if (done) {
    return (
      <div className="max-w-2xl mx-auto text-center border border-primary/40 bg-card/40 p-10">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-primary/40 text-primary">
          <Check size={22} />
        </div>
        <h2 className="font-display text-3xl">Booking created</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Confirmation ID: <span className="text-primary font-mono">{done.slice(0,8).toUpperCase()}</span>
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => navigate({ to: "/admin/bookings" })}
            className="border border-primary bg-primary text-primary-foreground px-6 py-2.5 text-[11px] uppercase tracking-[0.28em]">
            View bookings
          </button>
          <button onClick={() => window.location.reload()}
            className="border border-border px-6 py-2.5 text-[11px] uppercase tracking-[0.28em]">
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label>
          <span className="eyebrow mb-2 block">Branch</span>
          <select className="input w-full" value={branchId} disabled={user.role !== "owner"}
            onChange={e => { setBranchId(e.target.value); setBarberId(""); setTime(""); }}>
            <option value="">Select branch…</option>
            {branchesForRole.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label>
          <span className="eyebrow mb-2 block">Barber</span>
          <select className="input w-full" value={barberId} disabled={!branchId || user.role === "employee"}
            onChange={e => { setBarberId(e.target.value); setTime(""); }}>
            <option value="">Select barber…</option>
            {barbersForBranch.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>

      <div>
        <span className="eyebrow mb-3 block">Services (pick one or more)</span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.services.map(s => {
            const selected = serviceIds.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => { toggleService(s.id); setTime(""); }}
                className={`text-left border p-4 transition-all ${selected ? "border-primary bg-primary/5" : "border-border bg-card/30 hover:border-primary/40"}`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-display text-base">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.duration_minutes} min · ${(s.price_cents/100).toFixed(0)}</p>
                  </div>
                  {selected && <Check size={16} className="text-primary shrink-0"/>}
                </div>
              </button>
            );
          })}
        </div>
        {selectedServices.length > 0 && (
          <p className="mt-3 text-xs text-primary flex items-center gap-2">
            <Clock size={12}/> {totalDur} min · ${(totalCents/100).toFixed(2)} CAD
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <label>
          <span className="eyebrow mb-2 block">Date</span>
          <input type="date" min={todayISO()} value={dateISO}
            onChange={e => { setDateISO(e.target.value); setTime(""); }}
            className="input w-full"/>
        </label>
        <div>
          <span className="eyebrow mb-2 block">Available times</span>
          {!canQuerySlots && <p className="text-xs text-muted-foreground">Pick branch, barber and services first.</p>}
          {slots.isLoading && <p className="text-xs text-muted-foreground">Checking…</p>}
          {slots.data && (slots.data.slots.length === 0
            ? <p className="text-xs text-muted-foreground">Barber isn't scheduled that day.</p>
            : <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {slots.data.slots.map(s => (
                  <button key={s.time} type="button" disabled={!s.available} onClick={() => setTime(s.time)}
                    className={`border px-2 py-2 text-xs ${
                      time === s.time ? "border-primary bg-primary text-primary-foreground"
                        : s.available ? "border-border hover:border-primary/60"
                        : "border-border/30 text-muted-foreground/40 line-through cursor-not-allowed"
                    }`}>{s.time}</button>
                ))}
              </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label><span className="eyebrow mb-2 block">Customer name *</span>
          <input className="input w-full" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}/></label>
        <label><span className="eyebrow mb-2 block">Email *</span>
          <input type="email" className="input w-full" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}/></label>
        <label><span className="eyebrow mb-2 block">Phone</span>
          <input className="input w-full" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}/></label>
        <label className="md:col-span-2"><span className="eyebrow mb-2 block">Notes</span>
          <textarea rows={3} className="input w-full resize-none" value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})}/></label>
      </div>

      {create.isError && (
        <p className="border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {(create.error as Error).message}
        </p>
      )}

      <div className="flex justify-end">
        <button disabled={!canSubmit || create.isPending} onClick={() => create.mutate()}
          className="border border-primary bg-primary text-primary-foreground px-8 py-3 text-[11px] uppercase tracking-[0.32em] disabled:opacity-40">
          {create.isPending ? "Creating…" : "Create booking"}
        </button>
      </div>
    </div>
  );
}
