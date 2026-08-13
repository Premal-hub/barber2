import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import { Link } from "@tanstack/react-router";


export function BookCTA() {
  return (
    <section id="book" className="relative overflow-hidden border-t border-border bg-ink py-32 md:py-48">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse at center, var(--gold) 0%, transparent 60%)" }}
      />
      <div className="container-luxe relative text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="eyebrow"
        >
          — Reserve your chair
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mx-auto mt-8 max-w-4xl font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl"
        >
          Ready when <span className="italic text-gold-gradient">you are.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mx-auto mt-8 max-w-lg text-base text-muted-foreground"
        >
          Booking takes 40 seconds. Confirmation, calendar invite, and a reminder — handled.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
        >
          <Link
            to="/book"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden border border-primary bg-primary px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-primary-foreground transition-transform hover:scale-[1.02] sm:px-12 sm:py-5 sm:text-xs sm:tracking-[0.32em]"
          >
            <Scissors size={14} />
            <span className="relative z-10">Book Appointment</span>
          </Link>
          <a
            href="tel:+16475705791"
            className="inline-flex items-center justify-center gap-3 border border-border px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-foreground/80 transition-colors hover:border-primary hover:text-primary sm:px-12 sm:py-5 sm:text-xs sm:tracking-[0.32em]"
          >
            Or call 647·570·5791
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink py-16">
      <div className="container-luxe">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Scissors size={16} className="text-primary" />
              <span className="font-display text-lg tracking-[0.28em]">BARBER<span className="text-primary">·</span>LAB</span>
            </div>
            <p className="mt-6 max-w-sm text-sm text-muted-foreground">
              A men's grooming studio in Pickering, Ontario. Precision cuts,
              hot-towel shaves, and grooming rituals — since 2013.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-5">Studio</div>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><a href="#services" className="hover:text-primary">Services</a></li>
              <li><a href="#barbers" className="hover:text-primary">Barbers</a></li>
              <li><a href="#gallery" className="hover:text-primary">Gallery</a></li>
              <li><Link to="/book" className="hover:text-primary">Book</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-5">Contact</div>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>2060 Liverpool Rd</li>
              <li>Pickering, ON L1X 1E2</li>
              <li><a href="tel:+16475705791" className="hover:text-primary">+1 647-570-5791</a></li>
              <li><a href="mailto:hello@barberlab.ca" className="hover:text-primary">hello@barberlab.ca</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Barber Lab. All rights reserved.</span>
          <span>Precision · Style · Confidence</span>
        </div>
      </div>
    </footer>
  );
}
