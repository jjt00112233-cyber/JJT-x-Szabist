import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Shirt, Utensils, Droplets, GraduationCap, School } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SUGGESTED_CONTRIBUTIONS, formatRs } from "@/lib/site";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Where your donation goes | JJT × SZABIST Community" },
      { name: "description", content: "Explore suggested contributions toward essential books, uniforms, meals, clean water and teaching." },
      { property: "og:title", content: "Where your donation goes | JJT × SZABIST Community" },
      { property: "og:description", content: "Support the everyday necessities that help children stay in school." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impact,
});

const ICONS = [BookOpen, Shirt, Utensils, GraduationCap, Droplets, School];
const ITEMS = SUGGESTED_CONTRIBUTIONS.map((item, index) => ({ ...item, icon: ICONS[index] ?? BookOpen }));

function Impact() {
  return (
    <>
      <PageHero
        eyebrow="Where funds go"
        title="Every rupee becomes part of a child's education."
        backgroundImage="/impact-supplies.png"
        imagePosition="center"
      >
        Your support can help provide the everyday necessities children rely on at Junior Jinnah Trust schools.
      </PageHero>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold">Support the essentials</h2>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">These are suggested contributions toward essential needs, not fixed costs or a minimum donation. Any amount you feel comfortable giving is welcome.</p>
        <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((i) => (
          <div key={i.title} className="group rounded-2xl border bg-card p-5 sm:p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg shadow-xs">
            <i.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <p className="mt-4 sm:mt-5 font-serif text-2xl sm:text-3xl font-semibold">{formatRs(i.amount)}</p>
            <h3 className="mt-1 text-base sm:text-lg font-semibold">{i.title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{i.text}</p>
          </div>
        ))}
        </div>
      </section>
      <section className="bg-hero text-deep-foreground">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Choose the change you want to make.</h2>
          <Link to="/donate" className="mt-6 inline-block w-full sm:w-auto rounded-xl bg-primary px-8 py-3.5 font-medium text-primary-foreground shadow-md transition hover:bg-primary/90">Donate now</Link>
        </div>
      </section>
    </>
  );
}
