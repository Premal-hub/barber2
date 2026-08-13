import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";

const services = [
  { name: "Signature Cut", duration: "45 min", price: 55, tag: "Most booked", desc: "Consultation, precision cut, hot-towel finish, style." },
  { name: "Skin Fade", duration: "50 min", price: 60, tag: "House specialty", desc: "Bald-fade taper with razor-line detail." },
  { name: "Beard Sculpt", duration: "30 min", price: 35, tag: "", desc: "Shape, line-up, hot-towel and beard oil ritual." },
  { name: "Hot Towel Shave", duration: "45 min", price: 50, tag: "Ritual", desc: "Straight-razor shave, three passes, cold-finish." },
  { name: "Cut + Beard", duration: "70 min", price: 80, tag: "", desc: "The complete reset. Everything, in one chair." },
  { name: "The Executive", duration: "90 min", price: 140, tag: "Premium", desc: "Cut, shave, scalp treatment, styling. Espresso included." },
  { name: "Colour & Grey Blend", duration: "60 min", price: 75, tag: "", desc: "Discreet, natural colour work by appointment." },
  { name: "Young Gentleman (u12)", duration: "30 min", price: 30, tag: "", desc: "A first-class first haircut. Certificate included." },
];

export function Services() {
  return (
    <section id="services" className="relative border-t border-border bg-background py-32 md:py-40">
      <div className="container-luxe">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">02 — Services</p>
            <h2 className="mt-6 max-w-2xl text-4xl leading-[1.05] md:text-6xl">
              A curated menu.{" "}
              <span className="italic text-gold-gradient">No shortcuts.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Prices are transparent. Every service includes consultation, a hot towel,
            and a proper style-out before you stand up.
          </p>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {services.map((s, i) => (
            <motion.a
              key={s.name}
              href="#book"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 2) * 0.1 }}
              className="group relative flex flex-col justify-between gap-8 bg-background p-8 transition-colors hover:bg-charcoal md:p-10"
            >
              <div>
                <div className="flex items-start justify-between gap-6">
                  <h3 className="text-2xl leading-tight md:text-3xl">{s.name}</h3>
                  <span className="font-display text-3xl text-primary md:text-4xl">
                    ${s.price}
                  </span>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock size={11} /> {s.duration}
                  </span>
                  {s.tag && <span className="text-primary/80">· {s.tag}</span>}
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-foreground/40 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
