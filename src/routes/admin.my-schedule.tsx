import { createFileRoute, useRouter } from "@tanstack/react-router";
import { adminOverview, upsertBarber } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { HoursEditor, DEFAULT_SCHEDULE, type HoursValue } from "@/components/admin/HoursEditor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CalendarX } from "lucide-react";

export const Route = createFileRoute("/admin/my-schedule")({
  loader: () => adminOverview(),
  component: MySchedulePage,
});

function MySchedulePage() {
  const data = Route.useLoaderData() as Awaited<ReturnType<typeof adminOverview>>;
  const { user } = useCurrentUser();
  const router = useRouter();
  const upsert = useServerFn(upsertBarber);

  const me = useMemo(() => data.barbers.find(b => b.id === user.barberId), [data.barbers, user.barberId]);
  const [schedule, setSchedule] = useState<HoursValue>((me?.schedule as HoursValue) ?? DEFAULT_SCHEDULE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (user.role !== "employee") {
    return <p className="text-sm text-muted-foreground">Switch to an Employee role to manage your schedule.</p>;
  }
  if (!me) {
    return <p className="text-sm text-muted-foreground">No barber profile found for this account.</p>;
  }

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      await upsert({ data: {
        id: me.id, branch_id: me.branch_id, name: me.name, title: me.title ?? "",
        bio: me.bio ?? "", email: me.email, avatar_url: me.avatar_url ?? "",
        schedule, sort_order: me.sort_order ?? 0, active: me.active ?? true,
      }});
      setSaved(true); router.invalidate();
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl">My schedule</h2>
        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
          <CalendarX size={14}/> Uncheck a day to mark yourself unavailable — the public booking page will hide those slots automatically.
        </p>
      </div>

      <div className="border border-border/60 bg-card/40 p-6">
        <HoursEditor kind="barber" value={schedule} onChange={setSchedule}/>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-400">Saved.</span>}
        <button onClick={save} disabled={saving}
          className="border border-primary bg-primary px-8 py-2.5 text-[11px] uppercase tracking-[0.28em] text-primary-foreground disabled:opacity-50">
          {saving ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </div>
  );
}
