import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Scissors } from "lucide-react";
import { useState } from "react";

const LINKS: Array<{ label: string; hash: string }> = [
  { label: "Services", hash: "services" },
  { label: "Barbers", hash: "barbers" },
  { label: "Gallery", hash: "gallery" },
  { label: "Contact", hash: "contact" },
];

export function Nav() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const jump = (hash: string) => {
    setOpen(false);
    if (loc.pathname !== "/") {
      navigate({ to: "/", hash });
      return;
    }
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40"
    >
      <div className="container-luxe flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="group flex items-center gap-2 sm:gap-3">
          <Scissors size={18} className="text-primary transition-transform group-hover:-rotate-12" />
          <span className="font-display text-sm tracking-[0.24em] sm:text-lg sm:tracking-[0.28em]">
            BARBER<span className="text-primary">·</span>LAB
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.28em] text-foreground/70 lg:flex">
          {LINKS.map(l => (
            <button key={l.hash} onClick={() => jump(l.hash)}
              className="group relative py-2 transition-colors hover:text-primary">
              {l.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setOpen(v => !v)} className="lg:hidden text-[10px] uppercase tracking-widest px-2 py-1">
            {open ? "Close" : "Menu"}
          </button>
          <Link to="/book"
            className="group relative overflow-hidden border border-primary/40 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-primary sm:px-6 sm:py-2.5 sm:tracking-[0.32em]">
            <span className="relative z-10 transition-colors group-hover:text-primary-foreground">Book</span>
            <span className="absolute inset-0 -z-0 translate-y-full bg-primary transition-transform duration-500 group-hover:translate-y-0" />
          </Link>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container-luxe flex flex-col gap-4 py-6 text-[11px] uppercase tracking-[0.28em]">
            {LINKS.map(l => (
              <button key={l.hash} onClick={() => jump(l.hash)} className="text-left hover:text-primary">
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.header>
  );
}
