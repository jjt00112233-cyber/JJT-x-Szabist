import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About JJT | JJT × SZABIST Community" },
      { name: "description", content: "A registered non-profit since 2014 providing free, quality education to underprivileged children in Pakistan." },
      { property: "og:title", content: "About JJT | JJT × SZABIST Community" },
      { property: "og:description", content: "Our story, vision, mission and registration documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const DOCS = ["Trust registration certificate (2018)", "Trust registration certificate (2024–25)", "FBR tax certificate", "October 2024 newsletter"];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About JJT"
        title="From one orphanage to a movement for education."
        backgroundImage="/about-hero.jpg"
        imagePosition="center"
      >
        Junior Jinnah Trust is a non-profit founded in 2014 to give orphans, child labourers and street children in Pakistan free, high-quality education.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-6 sm:gap-10 px-5 py-12 sm:px-6 sm:py-16 md:py-20 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xs">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Vision</p>
          <p className="mt-3 font-serif text-xl sm:text-2xl leading-snug">Raising educated, confident children who become responsible citizens of Pakistan.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xs">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Mission</p>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">To reach the children society overlooks — those collecting rubbish, begging or working — and give them classrooms, teachers, meals and clean water at no cost.</p>
        </div>
      </section>
      <section className="bg-muted/70">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-semibold">About JJT: registration & accountability</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">Junior Jinnah Trust is registered under the Trust Act 1882, is FBR certified and has served children since 2014. These credentials belong to the trust we support.</p>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">These documents are published on the trust's official website.</p>
          <ul className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2">
            {DOCS.map((d) => (
              <li key={d} className="flex items-center gap-3 rounded-xl bg-card p-4 sm:p-5 border shadow-xs text-sm sm:text-base">
                <FileCheck2 className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-primary" /> {d}
              </li>
            ))}
          </ul>
          <a href="https://jjtrust.org/" target="_blank" rel="noreferrer" className="mt-6 sm:mt-8 inline-block text-secondary underline text-sm sm:text-base">View on jjtrust.org</a>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold">Be part of the next chapter.</h2>
        <Link to="/donate" className="mt-6 inline-block w-full sm:w-auto rounded-xl bg-primary px-8 py-3.5 font-medium text-primary-foreground shadow-md transition hover:bg-primary/90">Donate now</Link>
      </section>
    </>
  );
}
