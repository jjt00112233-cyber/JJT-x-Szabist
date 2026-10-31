import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { ProgressRing } from "@/components/FundCard";
import { contributionsQuery, summarize } from "@/lib/funds";
import { SITE, formatRs, campaignConfigQuery, useCampaignConfig } from "@/lib/site";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Funds raised so far | JJT × SZABIST Community" },
      { name: "description", content: "A public record of every confirmed contribution to the Classrooms for Every Child fund." },
      { property: "og:title", content: "Funds raised so far | JJT × SZABIST Community" },
      { property: "og:description", content: "Track our progress toward the Classrooms for Every Child goal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.prefetchQuery(contributionsQuery),
      context.queryClient.prefetchQuery(campaignConfigQuery),
    ]),
  component: Progress,
});

function Progress() {
  const config = useCampaignConfig();
  const { data, isLoading } = useQuery(contributionsQuery);
  const rows = data ?? [];
  const { total, supporters } = summarize(rows);
  const targetGoal = config.goal || SITE.goal;
  const pct = (total / targetGoal) * 100;

  return (
    <>
      <PageHero
        eyebrow="Progress"
        title="Every contribution, recorded in public."
        backgroundImage="/progress-learning.png"
        imagePosition="center"
      />
      <section className="mx-auto -mt-8 sm:-mt-10 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] items-center gap-6 sm:gap-8 rounded-2xl border bg-card p-5 sm:p-8 shadow-xl text-center md:text-left">
          <div className="shrink-0">
            <ProgressRing pct={pct} size={160} />
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 w-full">
            <Stat label="Raised so far" value={formatRs(total)} big />
            <Stat label="Goal" value={formatRs(targetGoal)} />
            <div className="col-span-2 sm:col-span-1">
              <Stat label="Supporters" value={String(supporters)} />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{formatRs(Math.max(0, targetGoal - total))} still needed</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-semibold">Contribution record</h2>
        <div className="mt-4 sm:mt-6 overflow-x-auto rounded-xl border bg-card shadow-xs">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-muted/80 text-muted-foreground">
              <tr><th className="p-3.5 sm:p-4">Date</th><th className="p-3.5 sm:p-4">Supporter</th><th className="p-3.5 sm:p-4">Purpose</th><th className="p-3.5 sm:p-4 text-right">Amount</th></tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center">
                  <p className="font-serif text-lg">We have just begun.</p>
                  <p className="mt-1 text-muted-foreground text-sm">The first confirmed contribution will appear here.</p>
                  <Link to="/donate" className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-sm">Be the first supporter</Link>
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/20 transition">
                  <td className="p-3.5 sm:p-4 whitespace-nowrap text-muted-foreground">{new Date(r.received_on).toLocaleDateString("en-PK", { dateStyle: "medium" })}</td>
                  <td className="p-3.5 sm:p-4 font-medium">{r.donor_label}</td>
                  <td className="p-3.5 sm:p-4 text-muted-foreground">{r.purpose ?? "General fund"}</td>
                  <td className="p-3.5 sm:p-4 text-right font-serif font-semibold">{formatRs(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={big ? "font-serif text-3xl font-semibold" : "text-xl font-semibold"}>{value}</p>
    </div>
  );
}
