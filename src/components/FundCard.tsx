import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { contributionsQuery, summarize } from "@/lib/funds";
import { SITE, formatRs, useCampaignConfig } from "@/lib/site";

export function ProgressRing({ pct, size = 150 }: { pct: number; size?: number }) {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={12} className="stroke-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={12} strokeLinecap="round"
          className="stroke-primary transition-all duration-1000"
          strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl font-semibold text-foreground">{Math.round(clamped)}%</span>
        <span className="text-xs text-muted-foreground">of goal</span>
      </div>
    </div>
  );
}

export function FundCard() {
  const config = useCampaignConfig();
  const { data } = useQuery(contributionsQuery);
  const { total, supporters } = summarize(data ?? []);
  const targetGoal = config.goal || SITE.goal;
  const pct = (total / targetGoal) * 100;
  return (
    <div className="rounded-2xl bg-card p-5 sm:p-7 text-card-foreground shadow-2xl">
      <h3 className="text-xl font-semibold text-center sm:text-left">Classrooms for Every Child</h3>
      <div className="mt-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-7">
        <ProgressRing pct={pct} />
        <dl className="space-y-3">
          <div><dt className="text-sm text-muted-foreground">Raised so far</dt><dd className="font-serif text-3xl font-semibold">{formatRs(total)}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Our goal</dt><dd className="font-semibold">{formatRs(targetGoal)}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Supporters</dt><dd className="font-semibold">{supporters}</dd></div>
        </dl>
      </div>
      <Link to="/donate" className="mt-6 block rounded-xl bg-primary py-3 sm:py-3.5 text-center font-medium text-primary-foreground transition hover:brightness-105 shadow-md">
        Donate now
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        {supporters === 0 ? "We have just begun. The first confirmed contribution starts the count." : "Every confirmed contribution is listed publicly on our progress page."}
      </p>
    </div>
  );
}
