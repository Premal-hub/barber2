import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "James H.", text: "The kind of place that ruins other barbershops for you. Marco takes his time and the fade is immaculate every visit.", rating: 5 },
  { name: "Alexei P.", text: "Booked The Executive before a wedding. Espresso, hot shave, cut — I walked out different. Worth every dollar.", rating: 5 },
  { name: "Terrance W.", text: "I've been to shops in Toronto and Manhattan. This is on that level. Quiet, sharp, on time.", rating: 5 },
  { name: "Marcus V.", text: "Devon handled my son's first haircut like a specialist. Framed certificate and everything. Wife nearly cried.", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-charcoal py-32 md:py-40">
      <div className="container-luxe">
        <div className="mb-20 max-w-3xl">
          <p className="eyebrow">05 — Regulars</p>
          <h2 className="mt-6 text-4xl leading-[1.05] md:text-6xl">
            What our chairs <span className="italic text-gold-gradient">say back.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <motion.blockquote
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="glass flex flex-col justify-between p-8"
            >
              <div>
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} size={12} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-6 font-display text-xl leading-snug text-foreground">
                  "{r.text}"
                </p>
              </div>
              <footer className="mt-8 flex items-center justify-between border-t border-border/60 pt-6 text-[10px] uppercase tracking-[0.28em]">
                <cite className="not-italic text-foreground/80">{r.name}</cite>
                <span className="text-muted-foreground">Google review</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const items = ["Precision", "Style", "Confidence", "Craft", "Ritual", "Pickering", "Est. Barber Lab"];
  return (
    <div className="relative overflow-hidden border-y border-border bg-background py-8">
      <div className="flex animate-marquee gap-16 whitespace-nowrap">
        {[...items, ...items, ...items].map((w, i) => (
          <span key={i} className="font-display text-5xl italic text-foreground/10 md:text-7xl">
            {w} <span className="text-primary/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
