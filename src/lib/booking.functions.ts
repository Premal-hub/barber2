import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------- helpers ----------
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type Hours = Partial<Record<(typeof DAY_KEYS)[number], { open?: string; close?: string; start?: string; end?: string }>>;

function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}
function fmtHM(min: number): string {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function torontoOffsetMinutes(date: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = fmt.formatToParts(date).reduce<Record<string, string>>((a, p) => (a[p.type] = p.value, a), {});
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUTC - date.getTime()) / 60000;
}
function torontoLocalToUTC(dateISO: string, minutes: number): Date {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60));
  const offset = torontoOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60000);
}
function weekdayKey(dateISO: string): (typeof DAY_KEYS)[number] {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return DAY_KEYS[dt.getUTCDay()];
}

// ---------- server fns ----------

export const getBookingCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/client.server");
  const [branches, services, barbers] = await Promise.all([
    supabaseAdmin.from("branches").select("*").eq("active", true).order("name"),
    supabaseAdmin.from("services").select("*").eq("active", true).order("sort_order"),
    supabaseAdmin.from("barbers").select("*").eq("active", true).order("sort_order"),
  ]);
  if (branches.error) throw new Error(branches.error.message);
  if (services.error) throw new Error(services.error.message);
  if (barbers.error) throw new Error(barbers.error.message);
  return { branches: branches.data, services: services.data, barbers: barbers.data };
});

const SlotInput = z.object({
  branchId: z.string().uuid(),
  barberId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1).max(6),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SlotInputType = z.infer<typeof SlotInput>;

export const getAvailableSlots = createServerFn({ method: "POST" })
  .inputValidator(SlotInput.parse)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { branchId, barberId, serviceIds, dateISO } = data;

    const [branchRes, barberRes, servicesRes] = await Promise.all([
      supabaseAdmin.from("branches").select("hours").eq("id", branchId).single(),
      supabaseAdmin.from("barbers").select("schedule, branch_id").eq("id", barberId).single(),
      supabaseAdmin.from("services").select("id, duration_minutes").in("id", serviceIds),
    ]);
    if (branchRes.error || barberRes.error || servicesRes.error) {
      throw new Error("Unable to load availability");
    }
    if (barberRes.data.branch_id !== branchId) {
      throw new Error("Barber does not belong to this branch");
    }
    const totalDur = (servicesRes.data ?? []).reduce((s, x) => s + x.duration_minutes, 0);
    if (!totalDur) return { slots: [], totalDuration: 0 };

    const dayKey = weekdayKey(dateISO);
    const bh = (branchRes.data.hours as Hours)[dayKey];
    const sh = (barberRes.data.schedule as Hours)[dayKey];
    if (!bh?.open || !bh?.close || !sh?.start || !sh?.end) {
      return { slots: [], totalDuration: totalDur };
    }

    const dayStart = Math.max(parseHM(bh.open), parseHM(sh.start));
    const dayEnd = Math.min(parseHM(bh.close), parseHM(sh.end));

    const dayStartUTC = torontoLocalToUTC(dateISO, 0);
    const nextDayUTC = new Date(dayStartUTC.getTime() + 26 * 3600 * 1000);

    const { data: existing, error } = await supabaseAdmin
      .from("bookings")
      .select("start_at, end_at")
      .eq("barber_id", barberId)
      .eq("status", "confirmed")
      .gte("start_at", dayStartUTC.toISOString())
      .lt("start_at", nextDayUTC.toISOString());
    if (error) throw new Error(error.message);

    const busy = (existing ?? []).map(b => ({
      s: new Date(b.start_at).getTime(),
      e: new Date(b.end_at).getTime(),
    }));

    const STEP = 15;
    const now = Date.now();
    const slots: { time: string; available: boolean }[] = [];
    for (let t = dayStart; t + totalDur <= dayEnd; t += STEP) {
      const startUTC = torontoLocalToUTC(dateISO, t).getTime();
      const endUTC = startUTC + totalDur * 60000;
      const inPast = startUTC < now + 30 * 60000;
      const conflict = busy.some(b => startUTC < b.e && endUTC > b.s);
      slots.push({ time: fmtHM(t), available: !inPast && !conflict });
    }
    return { slots, totalDuration: totalDur };
  });

const BookingInput = z.object({
  branchId: z.string().uuid(),
  barberId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1).max(6),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal("")),
  }),
});

export type BookingInputType = z.infer<typeof BookingInput>;

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(BookingInput.parse)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { branchId, barberId, serviceIds, dateISO, time, customer } = data;

    const [branchRes, barberRes, servicesRes] = await Promise.all([
      supabaseAdmin.from("branches").select("*").eq("id", branchId).single(),
      supabaseAdmin.from("barbers").select("*").eq("id", barberId).single(),
      supabaseAdmin.from("services").select("*").in("id", serviceIds),
    ]);
    if (branchRes.error || barberRes.error || servicesRes.error) throw new Error("Invalid booking selection");
    if (barberRes.data.branch_id !== branchId) throw new Error("Barber/branch mismatch");

    const orderedServices = serviceIds
      .map(id => servicesRes.data!.find(s => s.id === id))
      .filter(Boolean) as NonNullable<typeof servicesRes.data>;
    if (orderedServices.length !== serviceIds.length) throw new Error("Unknown service selected");
    const totalDur = orderedServices.reduce((s, x) => s + x.duration_minutes, 0);
    const totalCents = orderedServices.reduce((s, x) => s + x.price_cents, 0);

    const dayKey = weekdayKey(dateISO);
    const bh = (branchRes.data.hours as Hours)[dayKey];
    const sh = (barberRes.data.schedule as Hours)[dayKey];
    if (!bh?.open || !bh?.close || !sh?.start || !sh?.end) throw new Error("Selected day is closed");

    const startMin = parseHM(time);
    const endMin = startMin + totalDur;
    const dayStart = Math.max(parseHM(bh.open), parseHM(sh.start));
    const dayEnd = Math.min(parseHM(bh.close), parseHM(sh.end));
    if (startMin < dayStart || endMin > dayEnd) throw new Error("Time is outside working hours");

    const startUTC = torontoLocalToUTC(dateISO, startMin);
    const endUTC = new Date(startUTC.getTime() + totalDur * 60000);
    if (startUTC.getTime() < Date.now() + 30 * 60000) throw new Error("Please pick a slot at least 30 minutes ahead");

    const { data: conflicts, error: cErr } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("barber_id", barberId)
      .eq("status", "confirmed")
      .lt("start_at", endUTC.toISOString())
      .gt("end_at", startUTC.toISOString())
      .limit(1);
    if (cErr) throw new Error(cErr.message);
    if (conflicts && conflicts.length > 0) throw new Error("Sorry, that slot was just taken. Please pick another time.");

    const { data: booking, error: insErr } = await supabaseAdmin
      .from("bookings")
      .insert({
        branch_id: branchId,
        barber_id: barberId,
        service_id: orderedServices[0].id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
        notes: customer.notes || null,
        start_at: startUTC.toISOString(),
        end_at: endUTC.toISOString(),
        status: "confirmed",
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    // Insert booking_services rows
    const linkRows = orderedServices.map((s, i) => ({
      booking_id: booking.id,
      service_id: s.id,
      sort_order: i,
      duration_minutes: s.duration_minutes,
      price_cents: s.price_cents,
    }));
    const { error: bsErr } = await supabaseAdmin.from("booking_services").insert(linkRows);
    if (bsErr) console.error("[booking_services]", bsErr);

    void sendBookingEmails({
      bookingId: booking.id,
      branch: branchRes.data,
      barber: barberRes.data,
      services: orderedServices,
      customer,
      startUTC,
      endUTC,
      totalDur,
      totalCents,
    }).catch((e) => console.error("[email]", e));

    return {
      bookingId: booking.id,
      confirmation: {
        branch: branchRes.data.name,
        barber: barberRes.data.name,
        services: orderedServices.map(s => s.name),
        duration: totalDur,
        priceCents: totalCents,
        dateISO,
        time,
      },
    };
  });

// ---------- email ----------

type EmailArgs = {
  bookingId: string;
  branch: { name: string; address: string; email: string; phone: string };
  barber: { name: string; email: string };
  services: { name: string; duration_minutes: number; price_cents: number }[];
  customer: { name: string; email: string; phone?: string; notes?: string };
  startUTC: Date;
  endUTC: Date;
  totalDur: number;
  totalCents: number;
};

async function sendBookingEmails(a: EmailArgs) {
  const priceStr = `$${(a.totalCents / 100).toFixed(2)} CAD`;
  const when = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", dateStyle: "full", timeStyle: "short",
  }).format(a.startUTC);
  const servicesList = a.services.map(s => `${s.name} (${s.duration_minutes}m)`).join(" · ");

  const html = (title: string, intro: string) => `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#0a0a0a;padding:40px;color:#f5f5f5">
      <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #262626;padding:40px">
        <p style="letter-spacing:.32em;font-size:11px;color:#c8a96a;margin:0 0 24px">BARBER · LAB</p>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;margin:0 0 12px;color:#fff;font-weight:400">${title}</h1>
        <p style="color:#a3a3a3;font-size:14px;line-height:1.6">${intro}</p>
        <hr style="border:0;border-top:1px solid #262626;margin:28px 0" />
        <table style="width:100%;font-size:14px;color:#e5e5e5;line-height:1.9">
          <tr><td style="color:#737373;width:40%">Services</td><td>${servicesList}</td></tr>
          <tr><td style="color:#737373">Total time</td><td>${a.totalDur} min</td></tr>
          <tr><td style="color:#737373">Barber</td><td>${a.barber.name}</td></tr>
          <tr><td style="color:#737373">When</td><td>${when}</td></tr>
          <tr><td style="color:#737373">Where</td><td>${a.branch.name}<br/>${a.branch.address}</td></tr>
          <tr><td style="color:#737373">Price</td><td>${priceStr}</td></tr>
          <tr><td style="color:#737373">Booking ID</td><td style="font-family:monospace;font-size:12px;color:#c8a96a">${a.bookingId}</td></tr>
        </table>
        <hr style="border:0;border-top:1px solid #262626;margin:28px 0" />
        <p style="font-size:12px;color:#737373">Need to reschedule? Reply to this email or call ${a.branch.phone}.</p>
      </div>
    </div>`;

  const messages = [
    { to: a.customer.email, subject: `Your appointment at ${a.branch.name} is confirmed`,
      html: html("You're booked in.", `Hi ${a.customer.name}, we're looking forward to seeing you.`) },
    { to: a.barber.email, subject: `New appointment — ${a.customer.name} — ${when}`,
      html: html("New appointment on your chair.", `${a.customer.name} just booked ${servicesList}.` +
        (a.customer.notes ? `<br/><br/><em>Notes:</em> ${a.customer.notes}` : "")) },
    { to: a.branch.email, subject: `Booking confirmed — ${a.customer.name} with ${a.barber.name}`,
      html: html("Booking confirmed.", `${a.customer.name} booked ${servicesList} with ${a.barber.name}.`) },
  ];

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[booking-emails] RESEND_API_KEY not set — would send:", messages.map(m => m.subject));
    return;
  }
  await Promise.all(messages.map(m =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: "Barber Lab <bookings@barberlab.ca>", to: [m.to], subject: m.subject, html: m.html }),
    }).then(r => r.ok ? null : r.text().then(t => { throw new Error(t); }))
  ));
}
