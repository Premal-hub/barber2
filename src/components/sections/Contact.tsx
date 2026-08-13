import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";

const hours = [
  ["Monday", "10:00 — 20:00"],
  ["Tuesday", "10:00 — 20:00"],
  ["Wednesday", "10:00 — 20:00"],
  ["Thursday", "10:00 — 21:00"],
  ["Friday", "10:00 — 21:00"],
  ["Saturday", "09:00 — 19:00"],
  ["Sunday", "10:00 — 17:00"],
];

export function Contact() {
  return (
    <section id="contact" className="relative border-t border-border bg-background py-32 md:py-40">
      <div className="container-luxe">
        <div className="mb-20 max-w-3xl">
          <p className="eyebrow">08 — Visit</p>
          <h2 className="mt-6 text-4xl leading-[1.05] md:text-6xl">
            Find <span className="italic text-gold-gradient">the Lab.</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative aspect-[4/3] overflow-hidden border border-border bg-ink lg:aspect-auto"
          >
            <iframe
              title="Barber Lab location map"
              src="https://www.google.com/maps?q=2060+Liverpool+Rd,+Pickering,+ON+L1X+1E2&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full grayscale contrast-125"
              style={{ filter: "grayscale(1) contrast(1.2) invert(0.92) hue-rotate(180deg)" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="flex flex-col justify-between gap-10 border border-border bg-card p-10"
          >
            <div>
              <h3 className="text-2xl">Barber Lab · Pickering</h3>
              <div className="hairline mt-6 mb-8" />
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                  <a href="https://maps.google.com/?q=2060+Liverpool+Rd,+Pickering,+ON+L1X+1E2" target="_blank" rel="noopener" className="text-foreground/85 hover:text-primary">
                    2060 Liverpool Rd<br />Pickering, ON L1X 1E2, Canada
                  </a>
                </li>
                <li className="flex gap-4">
                  <Phone size={16} className="mt-0.5 shrink-0 text-primary" />
                  <a href="tel:+16475705791" className="text-foreground/85 hover:text-primary">+1 647-570-5791</a>
                </li>
                <li className="flex gap-4">
                  <Mail size={16} className="mt-0.5 shrink-0 text-primary" />
                  <a href="mailto:hello@barberlab.ca" className="text-foreground/85 hover:text-primary">hello@barberlab.ca</a>
                </li>
                <li className="flex gap-4">
                  <Instagram size={16} className="mt-0.5 shrink-0 text-primary" />
                  <a href="#" className="text-foreground/85 hover:text-primary">@barberlab.pickering</a>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-primary">
                <Clock size={12} /> Hours
              </div>
              <dl className="space-y-2 text-sm">
                {hours.map(([day, time]) => (
                  <div key={day} className="flex justify-between border-b border-border/40 pb-2 text-foreground/80">
                    <dt>{day}</dt>
                    <dd className="font-mono text-xs">{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
