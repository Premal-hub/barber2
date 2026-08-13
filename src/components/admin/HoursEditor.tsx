const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type Day = typeof DAYS[number];

export type HoursValue = Partial<Record<Day, { open?: string; close?: string; start?: string; end?: string }>>;

export const DEFAULT_HOURS: HoursValue = {
  mon: { open: "09:00", close: "20:00" }, tue: { open: "09:00", close: "20:00" },
  wed: { open: "09:00", close: "20:00" }, thu: { open: "09:00", close: "20:00" },
  fri: { open: "09:00", close: "21:00" }, sat: { open: "09:00", close: "18:00" },
  sun: { open: "10:00", close: "17:00" },
};
export const DEFAULT_SCHEDULE: HoursValue = {
  mon: { start: "09:00", end: "18:00" }, tue: { start: "09:00", end: "18:00" },
  wed: { start: "09:00", end: "18:00" }, thu: { start: "10:00", end: "20:00" },
  fri: { start: "10:00", end: "20:00" }, sat: { start: "09:00", end: "17:00" },
};

export function HoursEditor({
  value, onChange, kind,
}: { value: HoursValue; onChange: (v: HoursValue) => void; kind: "branch" | "barber" }) {
  const openKey = kind === "branch" ? "open" : "start";
  const closeKey = kind === "branch" ? "close" : "end";

  const setDay = (d: Day, patch: any) => {
    const next: HoursValue = { ...value };
    next[d] = { ...(next[d] || {}), ...patch };
    onChange(next);
  };
  const toggle = (d: Day, on: boolean) => {
    const next: HoursValue = { ...value };
    if (on) next[d] = { [openKey]: "09:00", [closeKey]: "18:00" } as any;
    else delete next[d];
    onChange(next);
  };

  return (
    <div className="grid min-w-0 gap-2">
      {DAYS.map(d => {
        const row = value[d];
        const on = !!(row && (row as any)[openKey] && (row as any)[closeKey]);
        return (
          <div key={d} className="grid min-w-0 gap-2 border border-border/60 bg-card/30 px-3 py-2 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center sm:gap-3">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
              <input type="checkbox" checked={on} onChange={e => toggle(d, e.target.checked)}/>
              {d}
            </label>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <input type="time" disabled={!on} value={(row as any)?.[openKey] ?? ""}
                onChange={e => setDay(d, { [openKey]: e.target.value })}
                className="min-w-0 border border-border bg-transparent px-2 py-1 text-xs disabled:opacity-30"/>
              <span className="text-xs text-muted-foreground">→</span>
              <input type="time" disabled={!on} value={(row as any)?.[closeKey] ?? ""}
                onChange={e => setDay(d, { [closeKey]: e.target.value })}
                className="min-w-0 border border-border bg-transparent px-2 py-1 text-xs disabled:opacity-30"/>
              {!on && <span className="col-span-3 text-[10px] uppercase tracking-widest text-muted-foreground/60">Closed</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
