import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  { q: "Do you accept walk-ins?", a: "We reserve the majority of chairs for booked appointments. Walk-ins are welcome subject to availability — call ahead and we'll let you know honestly." },
  { q: "What's your cancellation policy?", a: "Cancel or reschedule up to 4 hours before your appointment at no cost. Late cancellations are charged 50%; no-shows are charged the full service." },
  { q: "Do you cut children's hair?", a: "Yes. The Young Gentleman service (under 12) is designed as a proper first-class experience, including a framed certificate for a first haircut." },
  { q: "Can I request a specific barber?", a: "Absolutely — every booking lets you choose your barber. If they're away, we'll suggest a matched replacement with similar specialities." },
  { q: "Do you take cash?", a: "We accept all cards, Apple Pay, Google Pay, and cash. Tips can be added to card payments or given directly to your barber." },
  { q: "Is parking available?", a: "Yes, free customer parking directly in front of the studio on Liverpool Rd, with additional spots at the rear." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative border-t border-border bg-charcoal py-32 md:py-40">
      <div className="container-luxe grid gap-16 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="eyebrow">07 — Details</p>
          <h2 className="mt-6 text-4xl leading-[1.05] md:text-6xl">
            Frequently <span className="italic text-gold-gradient">asked.</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Everything else, we're happy to answer over the phone.{" "}
            <a href="tel:+16475705791" className="text-primary hover:underline">647-570-5791</a>.
          </p>
        </div>

        <div className="divide-y divide-border border-t border-border">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-8 text-left"
                >
                  <span className="font-display text-xl text-foreground transition-colors group-hover:text-primary md:text-2xl">
                    {f.q}
                  </span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                    <Plus size={20} className="text-primary" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-8 pr-10 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
