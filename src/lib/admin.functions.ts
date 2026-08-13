import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// NOTE: admin auth is intentionally bypassed per user request.
// TODO: re-enable role check via user_roles when going live.

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const HoursSchema = z.record(
  z.enum(DAY_KEYS),
  z.object({
    open: z.string().optional(), close: z.string().optional(),
    start: z.string().optional(), end: z.string().optional(),
  }).partial()
);

// -------- Overview / listings --------

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/client.server");
  const [branches, services, barbers, bookings] = await Promise.all([
    supabaseAdmin.from("branches").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("services").select("*").order("sort_order"),
    supabaseAdmin.from("barbers").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("bookings").select("*").order("start_at", { ascending: false }).limit(500),
  ]);
  for (const r of [branches, services, barbers, bookings]) if (r.error) throw new Error(r.error.message);

  const bookingIds = (bookings.data ?? []).map(b => b.id);
  const { data: links } = bookingIds.length
    ? await supabaseAdmin.from("booking_services").select("*").in("booking_id", bookingIds)
    : { data: [] as any[] };

  return {
    branches: branches.data ?? [],
    services: services.data ?? [],
    barbers: barbers.data ?? [],
    bookings: bookings.data ?? [],
    bookingServices: links ?? [],
  };
});

// -------- Branches --------

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || `x-${Date.now().toString(36)}`;
}

const BranchInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  city: z.string().min(1).default("Pickering"),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  image_url: z.string().url().optional().or(z.literal("")),
  hours: HoursSchema,
  active: z.boolean().default(true),
});

export type BranchInputType = z.infer<typeof BranchInput>;
export type ServiceInputType = z.infer<typeof ServiceInput>;
export type BarberInputType = z.infer<typeof BarberInput>;

export const upsertBranch = createServerFn({ method: "POST" })
  .inputValidator(BranchInput.parse)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { id, image_url, slug, ...rest } = data;
    const payload = { ...rest, image_url: image_url || null, slug: slug || slugify(rest.name) };
    const q = id
      ? await supabaseAdmin.from("branches").update(payload).eq("id", id).select().single()
      : await supabaseAdmin.from("branches").insert(payload).select().single();
    if (q.error) throw new Error(q.error.message);
    return q.data;
  });

export const deleteBranch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { error } = await supabaseAdmin.from("branches").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Services --------

const ServiceInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().or(z.literal("")),
  duration_minutes: z.number().int().min(5).max(480),
  price_cents: z.number().int().min(0),
  sort_order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const upsertService = createServerFn({ method: "POST" })
  .inputValidator(ServiceInput.parse)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { id, slug, ...rest } = data;
    const payload = { ...rest, slug: slug || slugify(rest.name) };
    const q = id
      ? await supabaseAdmin.from("services").update(payload).eq("id", id).select().single()
      : await supabaseAdmin.from("services").insert(payload).select().single();
    if (q.error) throw new Error(q.error.message);
    return q.data;
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { error } = await supabaseAdmin.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Barbers --------

const BarberInput = z.object({
  id: z.string().uuid().optional(),
  branch_id: z.string().uuid(),
  name: z.string().min(1),
  title: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  email: z.string().email(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  schedule: HoursSchema,
  sort_order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const upsertBarber = createServerFn({ method: "POST" })
  .inputValidator(BarberInput.parse)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { id, avatar_url, ...rest } = data;
    const payload = { ...rest, avatar_url: avatar_url || null };
    const q = id
      ? await supabaseAdmin.from("barbers").update(payload).eq("id", id).select().single()
      : await supabaseAdmin.from("barbers").insert(payload).select().single();
    if (q.error) throw new Error(q.error.message);
    return q.data;
  });

export const deleteBarber = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { error } = await supabaseAdmin.from("barbers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Bookings --------

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
    }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    const { error } = await supabaseAdmin.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/client.server");
    await supabaseAdmin.from("booking_services").delete().eq("booking_id", data.id);
    const { error } = await supabaseAdmin.from("bookings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

