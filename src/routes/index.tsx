import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ShieldCheck, Utensils, Droplets, ChevronRight } from "lucide-react";
import { FundCard } from "@/components/FundCard";
import { contributionsQuery } from "@/lib/funds";
import { campaignConfigQuery } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JJT × SZABIST Community | Supporting Junior Jinnah Trust" },
      { name: "description", content: "JJT × SZABIST Community raises funds to support Junior Jinnah Trust's free education for children in Pakistan." },
      { property: "og:title", content: "JJT × SZABIST Community | Supporting Junior Jinnah Trust" },
      { property: "og:description", content: "Join our community fundraiser supporting free education at Junior Jinnah Trust schools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.prefetchQuery(contributionsQuery),
      context.queryClient.prefetchQuery(campaignConfigQuery),
    ]),
  component: Home,
});

const FACTS = [
  { icon: ShieldCheck, title: "About JJT", text: "Junior Jinnah Trust holds Trust Act 1882 registration and an FBR tax certificate." },
  { icon: BookOpen, title: "Free education", text: "Books, uniforms and teaching at no cost to families." },
  { icon: Utensils, title: "School meals", text: "Nutritious meals so children can focus on learning." },
  { icon: Droplets, title: "Clean water", text: "Water plants serving schools and their communities." },
];

function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-deep text-deep-foreground">
        <img src="/classroom-background.png" alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_58%]" />
        <div aria-hidden="true" className="home-photo-shade absolute inset-0 -z-10" />
        <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-14 sm:px-6 sm:pt-40 md:pt-44 md:pb-24">
          <div className="max-w-xl animate-rise">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">JJT × SZABIST Community</h1>
            <p className="mt-3 sm:mt-4 text-lg sm:text-xl font-medium text-primary">Help a child step into a classroom.</p>
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-deep-foreground/80 leading-relaxed">
              JJT × SZABIST Community is supporting Junior Jinnah Trust, which has worked since 2014 to bring orphans, child labourers and street children in Pakistan into real education.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="h-auto w-full sm:w-auto px-6 py-3.5 text-base justify-center shadow-md"><Link to="/donate">Contribute to the fund</Link></Button>
              <Button asChild variant="outline" className="h-auto w-full sm:w-auto border-deep-foreground/40 bg-deep/50 px-6 py-3.5 text-base text-deep-foreground hover:bg-deep hover:text-deep-foreground justify-center"><Link to="/progress">See our progress</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fund Summary & Progress Card Section */}
      <section className="mx-auto max-w-6xl px-5 pt-12 sm:px-6 sm:pt-16 md:pt-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold leading-snug">Your support helps keep a child in school.</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">Together, we can provide the everyday essentials children need to learn.</p>
          </div>
          <FundCard />
        </div>
      </section>

      {/* ---------------- ABOUT US SECTION (Official JJT Movement) ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Visual Card with Overlaid Stats (6 cols) */}
          <div className="lg:col-span-6 animate-rise">
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl">
              {/* Event & Students Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src="/about-hero.jpg"
                  alt="Junior Jinnah Trust students and leadership"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Golden Stats Banner */}
              <div className="bg-[#EAA11A] px-4 py-5 sm:px-6 sm:py-6 text-white shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/25 text-center">
                  <div className="pb-3 sm:pb-0 sm:px-2">
                    <p className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">70+</p>
                    <p className="mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95">
                      VOLUNTEER
                    </p>
                  </div>

                  <div className="pb-3 sm:pb-0 sm:px-2">
                    <p className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">22+</p>
                    <p className="mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95">
                      PARTNERS
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-0 sm:px-2">
                    <p className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">10+</p>
                    <p className="mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95">
                      PROJECTS
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-0 sm:px-2">
                    <p className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">1K+</p>
                    <p className="mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95">
                      Students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Content & Action Buttons (6 cols) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <div>
              <div className="h-1 w-16 rounded-full bg-[#1C3B43]" />
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C3B43] dark:text-foreground">
                ABOUT US
              </h2>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
              Junior Jinnah Trust is a non-profit organization founded with one Orphanage in 2014, with the aim to provide quality education for the underserved population of the society: orphans, child labor, street children, underprivileged and most deserving children in Pakistan.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1C3B43] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#13282E] hover:scale-[1.02] active:scale-95"
              >
                <span>DONATE NOW</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAA11A] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#D99110] hover:scale-[1.02] active:scale-95"
              >
                <span>LEARN MORE</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Facts & Organisation Section */}
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-6 sm:pb-16 md:pb-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">An established organisation you can trust</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          What began as one orphanage in 2014 is now a network of schools giving children who once collected rubbish or begged on the streets a real future.
        </p>
        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 sm:p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <f.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:px-6 sm:py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Your support helps keep a child in school.</h2>
            <p className="mt-2 text-muted-foreground">Together, we can provide the everyday essentials children need to learn.</p>
          </div>
          <Link to="/impact" className="w-full sm:w-auto text-center rounded-xl bg-secondary px-6 py-3.5 font-medium text-secondary-foreground shadow-sm">Where funds go</Link>
        </div>
      </section>
    </>
  );
}
