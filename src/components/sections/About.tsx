import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function CountUp({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startT = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - startT) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(start + (to - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 12, suffix: "+", label: "Years of craft" },
  { value: 48000, suffix: "+", label: "Cuts completed" },
  { value: 4.9, suffix: "★", label: "Google rating" },
  { value: 9, suffix: "", label: "Master barbers" },
];

export function About() {
  return (
    <section id="about" className="relative bg-background py-32 md:py-40">
      <div className="container-luxe">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="eyebrow"
            >
              01 — The Studio
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="mt-8 text-4xl leading-[1.05] md:text-6xl"
            >
              A quieter kind of barbershop,{" "}
              <span className="italic text-gold-gradient">obsessed with the detail.</span>
            </motion.h2>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              <p>
                Barber Lab was founded on a single premise — that grooming is not a
                transaction, but a ritual. Our Pickering studio brings together some of
                Ontario's most decorated barbers, working in a room designed for stillness:
                low light, warm brass, quiet conversation.
              </p>
              <p>
                Every appointment is private. Every service begins with a consultation.
                Every finish is inspected in three mirrors before you leave the chair.
              </p>
              <p className="text-foreground/80">
                Ten minutes late is not busy — it is a lack of respect for the next chair.
                We stay on time. Always.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-12 md:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="min-w-0"
                >
                  <div className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl leading-none break-words">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
