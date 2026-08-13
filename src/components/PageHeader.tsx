import { motion } from "framer-motion";

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="container-luxe pt-40 pb-16">
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-5">{eyebrow}</motion.p>
      <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="font-display text-5xl md:text-7xl leading-[1.02]">{title}</motion.h1>
      {subtitle && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-6 max-w-xl text-sm text-muted-foreground">{subtitle}</motion.p>
      )}
      <div className="mt-10 h-px w-24 bg-primary/50" />
    </section>
  );
}
