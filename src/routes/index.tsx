import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Barbers } from "@/components/sections/Barbers";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials, Marquee } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { BookCTA, Footer } from "@/components/sections/BookCTA";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "preload", as: "image", href: heroImg, fetchPriority: "high" }],
    meta: [
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <About />
      <Marquee />
      <Services />
      <Barbers />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Contact />
      <BookCTA />
      <Footer />
    </main>
  );
}
