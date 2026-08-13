import { useState, useEffect } from "react";
import { Crown, Briefcase, User as UserIcon, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/client";
import { useCurrentUser, type CurrentUser } from "@/hooks/useCurrentUser";

type Branch = { id: string; name: string };
type Barber = { id: string; name: string; branch_id: string };

export function RoleSwitcher() {
  const { user, setUser } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    (async () => {
      const [b, br] = await Promise.all([
        supabase.from("branches").select("id, name").eq("active", true),
        supabase.from("barbers").select("id, name, branch_id").eq("active", true),
      ]);
      setBranches(b.data ?? []);
      setBarbers(br.data ?? []);
    })();
  }, []);

  const icon = user.role === "owner" ? Crown : user.role === "manager" ? Briefcase : UserIcon;
  const Icon = icon;

  const apply = (u: CurrentUser) => { setUser(u); setOpen(false); window.location.reload(); };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 border border-primary/40 bg-primary/5 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-primary hover:bg-primary/10">
        <Icon size={12}/>
        <span className="hidden sm:inline">{user.displayName}</span>
        <ChevronDown size={12}/>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <span className="eyebrow">Simulate role</span>
            <span className="text-[9px] uppercase tracking-widest text-amber-500/80">Dev mode</span>
          </div>
          <div className="max-h-[420px] overflow-auto py-2">
            <Item icon={Crown} label="Owner · all branches" active={user.role === "owner"}
              onClick={() => apply({ role: "owner", branchId: null, barberId: null, displayName: "Owner" })}/>

            <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-muted-foreground">Managers</div>
            {branches.map(b => (
              <Item key={"m"+b.id} icon={Briefcase} label={`Manager · ${b.name}`}
                active={user.role === "manager" && user.branchId === b.id}
                onClick={() => apply({ role: "manager", branchId: b.id, barberId: null, displayName: `Manager · ${b.name}` })}/>
            ))}

            <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-muted-foreground">Employees</div>
            {barbers.map(br => {
              const branch = branches.find(b => b.id === br.branch_id);
              return (
                <Item key={"e"+br.id} icon={UserIcon} label={`${br.name} · ${branch?.name ?? "—"}`}
                  active={user.role === "employee" && user.barberId === br.id}
                  onClick={() => apply({ role: "employee", branchId: br.branch_id, barberId: br.id, displayName: br.name })}/>
              );
            })}
            {barbers.length === 0 && <p className="px-4 py-3 text-xs text-muted-foreground">No barbers yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center gap-2 px-4 py-2 text-xs text-left transition-colors ${active ? "bg-primary/10 text-primary" : "hover:bg-primary/5"}`}>
      <Icon size={12}/> {label}
    </button>
  );
}
