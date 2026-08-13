import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Building2, Scissors, Users, CalendarCheck, Bell, Menu, X, Plus, CalendarDays, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/client";
import { motion, AnimatePresence } from "framer-motion";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Barber Lab" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: any; exact?: boolean; roles: Array<"owner"|"manager"|"employee"> };

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, roles: ["owner","manager","employee"] },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["owner","manager","employee"] },
  { to: "/admin/new-booking", label: "New booking", icon: Plus, roles: ["owner","manager","employee"] },
  { to: "/admin/my-schedule", label: "My schedule", icon: CalendarDays, roles: ["employee"] },
  { to: "/admin/branches", label: "Branches", icon: Building2, roles: ["owner"] },
  { to: "/admin/services", label: "Services", icon: Scissors, roles: ["owner"] },
  { to: "/admin/barbers", label: "Barbers", icon: Users, roles: ["owner","manager"] },
  { to: "/admin/employees", label: "Employees", icon: UserCog, roles: ["owner"] },
];

type Notif = { id: string; title: string; body: string; ts: number };

function AdminLayout() {
  const loc = useLocation();
  const { user } = useCurrentUser();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  const nav = useMemo(() => NAV.filter(n => n.roles.includes(user.role)), [user.role]);

  useEffect(() => {
    if (user.role === "employee") return; // employees don't get global notifications
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        const b: any = payload.new;
        if (user.role === "manager" && user.branchId && b.branch_id !== user.branchId) return;
        setNotifs(prev => [
          { id: b.id, title: `New booking · ${b.customer_name}`,
            body: `${new Date(b.start_at).toLocaleString()} — ${b.customer_email}`, ts: Date.now() },
          ...prev,
        ].slice(0, 12));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.role, user.branchId]);

  const SidebarNav = ({ onNav }: { onNav?: () => void }) => (
    <nav className="flex-1 p-4 space-y-1">
      {nav.map(n => {
        const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
        return (
          <Link key={n.to} to={n.to} onClick={onNav}
            className={`flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[0.24em] transition-colors ${
              active ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            <n.icon size={14}/> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-card/30 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 px-6 py-6 border-b border-border/60">
          <Scissors size={16} className="text-primary" />
          <span className="font-display tracking-[0.28em] text-sm">BARBER·LAB</span>
        </Link>
        <SidebarNav />
        <div className="p-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60 border-t border-border/60">
          {user.role} · dev mode
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 md:hidden"/>
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border/60 bg-card md:hidden">
              <div className="flex items-center justify-between px-6 py-6 border-b border-border/60">
                <Link to="/" className="flex items-center gap-3">
                  <Scissors size={16} className="text-primary" />
                  <span className="font-display tracking-[0.28em] text-sm">BARBER·LAB</span>
                </Link>
                <button onClick={() => setMobileOpen(false)}><X size={18}/></button>
              </div>
              <SidebarNav onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-card/20 backdrop-blur px-4 md:px-10 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="md:hidden border border-border p-2 shrink-0">
              <Menu size={16}/>
            </button>
            <h1 className="font-display text-xl md:text-2xl capitalize truncate">
              {loc.pathname.split("/").slice(2).join(" / ").replace(/-/g, " ") || "Overview"}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <RoleSwitcher/>
            {user.role !== "employee" && (
              <div className="relative">
                <button onClick={() => setOpen(v => !v)}
                  className="relative border border-border p-2.5 hover:border-primary/50 transition-colors">
                  <Bell size={16}/>
                  {notifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">
                      {notifs.length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                        <span className="eyebrow">Live notifications</span>
                        {notifs.length > 0 && (
                          <button onClick={() => setNotifs([])} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">clear</button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-auto">
                        {notifs.length === 0 && (<p className="p-6 text-xs text-muted-foreground text-center">No new bookings yet.</p>)}
                        {notifs.map(n => (
                          <div key={n.id + n.ts} className="border-b border-border/40 px-4 py-3 hover:bg-primary/5">
                            <p className="text-sm text-foreground">{n.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 overflow-x-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
