import { motion } from "framer-motion";
import interior from "@/assets/interior.jpg";
import tools from "@/assets/tools.jpg";
import hero from "@/assets/hero.jpg";
import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";

const items = [
  { src: interior, span: "md:col-span-2 md:row-span-2", alt: "Dark luxury barbershop interior" },
  { src: tools, span: "", alt: "Vintage barbering tools flat lay" },
  { src: hero, span: "", alt: "Precision fade in progress" },
  { src: b1, span: "md:row-span-2", alt: "Master barber portrait" },
  { src: b2, span: "", alt: "Barber portrait" },
];

export function Gallery() {
  return (
    <section id="gallery" className="relative border-t border-border bg-background py-32 md:py-40">
      <div className="container-luxe">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">04 — The Studio</p>
            <h2 className="mt-6 text-4xl leading-[1.05] md:text-6xl">
              Inside <span className="italic text-gold-gradient">the Lab.</span>
            </h2>
          </div>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-2 gap-4 md:auto-rows-[280px] md:grid-cols-4 md:gap-6">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
              className={`group relative overflow-hidden bg-ink ${it.span}`}
            >
              <img
                src={it.src}
                alt={it.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
