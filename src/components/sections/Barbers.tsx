import { motion } from "framer-motion";
import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";
import b3 from "@/assets/barber-3.jpg";

const barbers = [
  { name: "Marco Ricci", role: "Master Barber · Founder", img: b1, years: 14, specialty: "Scissor work · Classic cuts", langs: "EN · IT" },
  { name: "Devon Blake", role: "Senior Barber", img: b2, years: 9, specialty: "Skin fades · Line-ups", langs: "EN" },
  { name: "Anders Voll", role: "Senior Barber · Straight-razor", img: b3, years: 22, specialty: "Hot-towel shaves · Beard sculpt", langs: "EN · SV" },
];

export function Barbers() {
  return (
    <section id="barbers" className="relative border-t border-border bg-charcoal py-32 md:py-40">
      <div className="container-luxe">
        <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div>
            <p className="eyebrow">03 — The Chairs</p>
            <h2 className="mt-6 max-w-2xl text-4xl leading-[1.05] md:text-6xl">
              Meet your <span className="italic text-gold-gradient">barber.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Every barber at the Lab has passed a three-round trade test.
            Book by name, or let us match you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {barbers.map((b, i) => (
            <motion.article
              key={b.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
              className="group relative overflow-hidden"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-ink">
                <img
                  src={b.img}
                  alt={`Portrait of ${b.name}, ${b.role} at Barber Lab`}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover grayscale transition-all duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-90" />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-3xl leading-tight">{b.name}</h3>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-primary">{b.role}</p>
                    </div>
                    <span className="font-display text-4xl text-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-6 space-y-2 border-t border-foreground/15 pt-4 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    <div className="flex justify-between"><span>Experience</span><span className="text-foreground/80">{b.years} yrs</span></div>
                    <div className="flex justify-between"><span>Speciality</span><span className="text-foreground/80">{b.specialty}</span></div>
                    <div className="flex justify-between"><span>Languages</span><span className="text-foreground/80">{b.langs}</span></div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
