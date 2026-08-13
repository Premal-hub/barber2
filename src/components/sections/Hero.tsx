import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, MapPin, Phone, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[720px] overflow-hidden bg-ink">
      {/* Background image with slow ken-burns + parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroImg}
          alt="Master barber performing a precision fade at Barber Lab Pickering"
          className="h-full w-full object-cover"
          fetchPriority="high"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--ink)_95%)] opacity-70" />
      </motion.div>

      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }} />

      {/* Content */}
      <motion.div style={{ opacity }} className="container-luxe relative z-10 flex h-full flex-col justify-end pb-24 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="eyebrow mb-6"
        >
          — Est. Pickering · Master Grooming Studio
        </motion.p>

        <h1 className="max-w-5xl text-[clamp(3rem,9vw,8.5rem)] leading-[0.95] text-foreground">
          {["Precision.", "Style.", "Confidence."].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.35 + i * 0.15, ease: [0.19, 1, 0.22, 1] }}
              className="mr-6 inline-block"
            >
              {i === 2 ? <span className="text-gold-gradient italic">{word}</span> : word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          A men's grooming studio built on old-world discipline and modern craft.
          Every cut is a private appointment with a specialist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="mt-8 inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-primary w-fit"
        >
          <Sparkles size={12} /> First cut? 15% off with code <span className="font-semibold">LAB15</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.05 }}
          className="mt-6 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/book"
            className="group relative overflow-hidden border border-primary/40 bg-primary/5 px-10 py-4 text-xs uppercase tracking-[0.32em] text-primary transition-all hover:border-primary"
          >
            <span className="relative z-10 transition-colors group-hover:text-primary-foreground">
              Book Appointment
            </span>
            <span className="absolute inset-0 -z-0 translate-y-full bg-primary transition-transform duration-500 ease-out group-hover:translate-y-0" />
          </Link>
          <a
            href="#services"
            className="group flex items-center gap-3 px-2 py-4 text-xs uppercase tracking-[0.32em] text-foreground/80 transition-colors hover:text-primary"
          >
            Explore Services
            <span className="h-px w-8 bg-current transition-all group-hover:w-14" />
          </a>
        </motion.div>
      </motion.div>

      {/* Floating corner meta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="pointer-events-auto absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
      >
        <div className="glass flex flex-col gap-4 px-5 py-6 text-[10px] uppercase tracking-[0.28em] text-foreground/70">
          <div className="flex items-center gap-2"><MapPin size={12} className="text-primary" /> Pickering, ON</div>
          <div className="flex items-center gap-2"><Phone size={12} className="text-primary" /> 647·570·5791</div>
          <div className="hairline" />
          <div className="text-primary">Open Today · 10—8</div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center"
      >
        <div className="mx-auto h-10 w-6 rounded-full border border-foreground/25">
          <div className="mx-auto mt-2 h-1.5 w-1 rounded-full bg-primary animate-scroll-dot" />
        </div>
        <ArrowDown size={12} className="mx-auto mt-3 text-foreground/40" />
      </motion.div>
    </section>
  );
}
