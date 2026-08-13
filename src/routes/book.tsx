import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, MapPin, Scissors, User } from "lucide-react";
import {
  getBookingCatalog,
  getAvailableSlots,
  createBooking,
} from "@/lib/booking.functions";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Appointment — Barber Lab" },
      { name: "description", content: "Reserve your chair. Pick your branch, service, barber and time — in under a minute." },
    ],
  }),
  loader: async () => await getBookingCatalog(),
  component: BookPage,
});

type Catalog = Awaited<ReturnType<typeof getBookingCatalog>>;

const steps = ["Branch", "Service", "Barber", "Time", "Details", "Review"] as const;

function BookPage() {
  const catalog = Route.useLoaderData() as Catalog;
  const [step, setStep] = useState(0);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [dateISO, setDateISO] = useState<string>(() => todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", notes: "" });
  const [confirmation, setConfirmation] = useState<null | Awaited<ReturnType<typeof createBooking>>>(null);

  const branch = catalog.branches.find(b => b.id === branchId);
  const selectedServices = catalog.services.filter(s => serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((s, x) => s + x.duration_minutes, 0);
  const totalCents = selectedServices.reduce((s, x) => s + x.price_cents, 0);
  const barber = catalog.barbers.find(b => b.id === barberId);
  const barbersForBranch = catalog.barbers.filter(b => b.branch_id === branchId);

  const getSlotsFn = useServerFn(getAvailableSlots);
  const createBookingFn = useServerFn(createBooking);

  const slotsQuery = useQuery({
    queryKey: ["slots", branchId, barberId, serviceIds.join(","), dateISO],
    enabled: step === 3 && !!branchId && !!barberId && serviceIds.length > 0 && !!dateISO,
    queryFn: () => getSlotsFn({ data: { branchId: branchId!, barberId: barberId!, serviceIds, dateISO } }),
  });

  const bookingMutation = useMutation({
    mutationFn: () => createBookingFn({
      data: {
        branchId: branchId!, barberId: barberId!, serviceIds,
        dateISO, time: time!, customer,
      },
    }),
    onSuccess: (data) => setConfirmation(data),
  });

  const canAdvance = useMemo(() => {
    if (step === 0) return !!branchId;
    if (step === 1) return serviceIds.length > 0;
    if (step === 2) return !!barberId;
    if (step === 3) return !!time;
    if (step === 4) return customer.name.length > 1 && /.+@.+\..+/.test(customer.email);
    return true;
  }, [step, branchId, serviceIds, barberId, time, customer]);

  const toggleService = (id: string) =>
    setServiceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="container-luxe pt-32 pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Reserve · Barber Lab</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">Book your chair.</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl">
            Six unhurried steps. We'll only show you time slots that are truly free —
            live conflict checks prevent double bookings.
          </p>
        </div>

        {/* Progress */}
        <div className="mt-12 flex items-center gap-3 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => confirmation ? null : setStep(Math.min(step, i))}
                disabled={i > step || !!confirmation}
                className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                  i === step ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground/50"
                }`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full border text-[10px] ${
                  i < step ? "border-primary bg-primary text-primary-foreground" :
                  i === step ? "border-primary text-primary" : "border-border text-muted-foreground/50"
                }`}>{i < step ? <Check size={12}/> : i + 1}</span>
                {s}
              </button>
              {i < steps.length - 1 && <span className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        {/* Confirmation */}
        {confirmation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 border border-primary/40 bg-card/40 p-10 backdrop-blur"
          >
            <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-primary/40 text-primary">
              <Check size={22} />
            </div>
            <h2 className="font-display text-4xl text-center">You're booked.</h2>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              A confirmation is on its way to <span className="text-foreground">{customer.email}</span>.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 text-sm">
              <Info label="Booking ID" value={confirmation.bookingId.slice(0, 8).toUpperCase()} />
              <Info label="Services" value={`${confirmation.confirmation.services.join(", ")} · ${confirmation.confirmation.duration} min`} />
              <Info label="Barber" value={confirmation.confirmation.barber} />
              <Info label="Branch" value={confirmation.confirmation.branch} />
              <Info label="When" value={`${confirmation.confirmation.dateISO} · ${confirmation.confirmation.time}`} />
              <Info label="Price" value={`$${(confirmation.confirmation.priceCents/100).toFixed(2)} CAD`} />
            </div>
            <div className="mt-10 flex justify-center gap-3">
              <Link to="/" className="border border-border px-6 py-2.5 text-xs uppercase tracking-[0.28em] hover:border-primary/40">
                Back to home
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="mt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                {step === 0 && (
                  <StepGrid>
                    {catalog.branches.map(b => (
                      <SelectCard
                        key={b.id}
                        selected={branchId === b.id}
                        onClick={() => setBranchId(b.id)}
                        icon={<MapPin size={16} />}
                        title={b.name}
                        subtitle={b.address}
                        meta={b.phone}
                      />
                    ))}
                  </StepGrid>
                )}

                {step === 1 && (
                  <div>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Select one or more services. We'll book them back-to-back on the same chair.
                    </p>
                    <StepGrid>
                      {catalog.services.map(s => (
                        <SelectCard
                          key={s.id}
                          selected={serviceIds.includes(s.id)}
                          onClick={() => toggleService(s.id)}
                          icon={<Scissors size={16} />}
                          title={s.name}
                          subtitle={s.description ?? ""}
                          meta={`${s.duration_minutes} min · $${(s.price_cents/100).toFixed(0)}`}
                        />
                      ))}
                    </StepGrid>
                    {selectedServices.length > 0 && (
                      <div className="mt-6 flex items-center gap-4 border border-primary/30 bg-primary/5 px-5 py-3 text-xs text-primary">
                        <span>{selectedServices.length} selected</span>
                        <span className="text-primary/60">·</span>
                        <span>{totalDuration} min total</span>
                        <span className="text-primary/60">·</span>
                        <span>${(totalCents/100).toFixed(2)} CAD</span>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <StepGrid>
                    {barbersForBranch.length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-full">
                        No barbers configured for this branch yet.
                      </p>
                    )}
                    {barbersForBranch.map(b => (
                      <SelectCard
                        key={b.id}
                        selected={barberId === b.id}
                        onClick={() => setBarberId(b.id)}
                        icon={<User size={16} />}
                        title={b.name}
                        subtitle={b.title ?? ""}
                        meta={b.bio ?? ""}
                      />
                    ))}
                  </StepGrid>
                )}

                {step === 3 && (
                  <div className="grid gap-8 md:grid-cols-[280px,1fr]">
                    <div>
                      <label className="eyebrow mb-3 block">Date</label>
                      <input
                        type="date"
                        value={dateISO}
                        min={todayISO()}
                        onChange={(e) => { setDateISO(e.target.value); setTime(null); }}
                        className="w-full border border-border bg-card/40 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      />
                      {totalDuration > 0 && (
                        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={12}/> {totalDuration} minutes needed
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="eyebrow mb-3 block">Available times</label>
                      {slotsQuery.isLoading && <p className="text-sm text-muted-foreground">Checking availability…</p>}
                      {slotsQuery.isError && <p className="text-sm text-destructive">Couldn't load slots.</p>}
                      {slotsQuery.data && (
                        slotsQuery.data.slots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Barber isn't scheduled on this day. Try another date.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                            {slotsQuery.data.slots.map(s => (
                              <button
                                key={s.time}
                                disabled={!s.available}
                                onClick={() => setTime(s.time)}
                                className={`border px-3 py-2.5 text-xs tracking-wider transition-all ${
                                  time === s.time
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : s.available
                                    ? "border-border hover:border-primary/60"
                                    : "border-border/30 text-muted-foreground/30 line-through cursor-not-allowed"
                                }`}
                              >
                                {s.time}
                              </button>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
                    <Field label="Full name" required>
                      <input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}
                        className="input" placeholder="Alex Morgan" />
                    </Field>
                    <Field label="Email" required>
                      <input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})}
                        className="input" placeholder="alex@email.com" />
                    </Field>
                    <Field label="Phone">
                      <input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}
                        className="input" placeholder="+1 647-000-0000" />
                    </Field>
                    <Field label="Notes for your barber" className="md:col-span-2">
                      <textarea rows={4} value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})}
                        className="input resize-none" placeholder="Any style references, allergies, etc." />
                    </Field>
                  </div>
                )}

                {step === 5 && (
                  <div className="max-w-2xl border border-border bg-card/40 p-8 backdrop-blur">
                    <p className="eyebrow mb-6">Please review</p>
                    <div className="grid gap-4 text-sm">
                      <Info label="Branch" value={branch?.name ?? "—"} />
                      <Info label="Services" value={`${selectedServices.map(s=>s.name).join(", ") || "—"} · ${totalDuration} min`} />
                      <Info label="Barber" value={barber?.name ?? "—"} />
                      <Info label="When" value={`${dateISO} · ${time}`} />
                      <Info label="Price" value={totalCents ? `$${(totalCents/100).toFixed(2)} CAD` : "—"} />
                      <Info label="Contact" value={`${customer.name} · ${customer.email}`} />
                    </div>
                    {bookingMutation.isError && (
                      <p className="mt-6 border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                        {(bookingMutation.error as Error).message}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowLeft size={14} /> Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance}
                  className="group relative overflow-hidden border border-primary/50 px-8 py-3 text-[11px] uppercase tracking-[0.32em] text-primary disabled:opacity-30"
                >
                  <span className="relative z-10 flex items-center gap-2 transition-colors group-hover:text-primary-foreground">
                    Continue <ArrowRight size={14}/>
                  </span>
                  <span className="absolute inset-0 -z-0 translate-y-full bg-primary transition-transform duration-500 group-hover:translate-y-0" />
                </button>
              ) : (
                <button
                  onClick={() => bookingMutation.mutate()}
                  disabled={bookingMutation.isPending}
                  className="group relative overflow-hidden border border-primary bg-primary px-10 py-3 text-[11px] uppercase tracking-[0.32em] text-primary-foreground disabled:opacity-60"
                >
                  {bookingMutation.isPending ? "Confirming…" : "Confirm booking"}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// ---------- primitives ----------

function StepGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function SelectCard({
  selected, onClick, icon, title, subtitle, meta,
}: {
  selected: boolean; onClick: () => void; icon: React.ReactNode;
  title: string; subtitle: string; meta: string;
}) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`group relative overflow-hidden border p-6 text-left transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card/30 hover:border-primary/40"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-full border ${
          selected ? "border-primary text-primary" : "border-border text-muted-foreground"
        }`}>{icon}</span>
        {selected && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary">
            <Check size={16}/>
          </motion.span>
        )}
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{subtitle}</p>}
      {meta && <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-primary/80">{meta}</p>}
    </motion.button>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string; }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow mb-2 block">{label}{required && <span className="text-primary"> *</span>}</span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-3">
      <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function todayISO(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).reduce<Record<string, string>>((a, p) => (a[p.type] = p.value, a), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}
