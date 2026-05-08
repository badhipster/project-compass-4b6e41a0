import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Gauge,
  Crosshair,
  Mic,
  TrendingUp,
  Target,
} from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { companies, getIndianCompanies, getGlobalCompanies } from "@/lib/companies";

const DIMENSIONS = [
  {
    name: "Problem Framing",
    rationale: "Did you define the problem before designing the solution?",
  },
  {
    name: "User Empathy",
    rationale: "Did you anchor on a specific user, or stay generic?",
  },
  {
    name: "Prioritization Rationale",
    rationale: "Did you justify your choices, or list features randomly?",
  },
  {
    name: "Metric Definition",
    rationale: "Did you define how success would be measured?",
  },
  {
    name: "Trade-off Awareness",
    rationale: "Did you name what you were giving up?",
  },
];

type Mark = "yes" | "no" | "partial" | "na";

const Cell = ({ mark, label }: { mark: Mark; label: string }) => {
  const Icon =
    mark === "yes" ? CircleCheck : mark === "partial" ? CircleDot : CircleDashed;
  const color =
    mark === "yes"
      ? "text-green-600"
      : mark === "partial"
      ? "text-amber-600"
      : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
};

const COMPARISON: {
  dimension: string;
  this: { mark: Mark; label: string };
  chatgpt: { mark: Mark; label: string };
  exponent: { mark: Mark; label: string };
  igao: { mark: Mark; label: string };
  huru: { mark: Mark; label: string };
}[] = [
  {
    dimension: "PM-specific scoring rubric",
    this: { mark: "yes", label: "5 named dimensions" },
    chatgpt: { mark: "no", label: "No rubric" },
    exponent: { mark: "na", label: "Peer mock only" },
    igao: { mark: "partial", label: "Human verbal only" },
    huru: { mark: "partial", label: "Generic (clarity, filler)" },
  },
  {
    dimension: "Company-calibrated questions",
    this: { mark: "yes", label: "15 companies, weighted" },
    chatgpt: { mark: "no", label: "DIY prompt" },
    exponent: { mark: "partial", label: "Limited" },
    igao: { mark: "yes", label: "Insider-led" },
    huru: { mark: "no", label: "Generic" },
  },
  {
    dimension: "Company-specific hiring bar",
    this: { mark: "yes", label: "Dimension weights + bar" },
    chatgpt: { mark: "no", label: "No bar" },
    exponent: { mark: "partial", label: "Peer opinion" },
    igao: { mark: "yes", label: "Insider calibrated" },
    huru: { mark: "no", label: "No bar" },
  },
  {
    dimension: "Follow-up probes",
    this: { mark: "yes", label: "Up to 3 adaptive" },
    chatgpt: { mark: "no", label: "No probe" },
    exponent: { mark: "na", label: "Peer-dependent" },
    igao: { mark: "yes", label: "Human probe" },
    huru: { mark: "no", label: "No probe" },
  },
  {
    dimension: "Session memory & trends",
    this: { mark: "yes", label: "localStorage profile" },
    chatgpt: { mark: "no", label: "Stateless" },
    exponent: { mark: "no", label: "No analytics" },
    igao: { mark: "partial", label: "Manual notes" },
    huru: { mark: "partial", label: "Basic history" },
  },
  {
    dimension: "Async, no scheduling",
    this: { mark: "yes", label: "Instant" },
    chatgpt: { mark: "yes", label: "Instant" },
    exponent: { mark: "no", label: "3-day window" },
    igao: { mark: "no", label: "Booked sessions" },
    huru: { mark: "yes", label: "Instant" },
  },
  {
    dimension: "Cost",
    this: { mark: "yes", label: "Free" },
    chatgpt: { mark: "yes", label: "Free" },
    exponent: { mark: "partial", label: "$72-144/yr" },
    igao: { mark: "no", label: "$100-250/hr" },
    huru: { mark: "partial", label: "~$30/mo" },
  },
];

const MODES = [
  {
    icon: Gauge,
    name: "Calibrate",
    time: "~5 min",
    desc: "One question, scored on all 5 dimensions. See where you stand for a specific company.",
    color: "from-blue-500/15 to-primary/20 text-primary ring-primary/10",
  },
  {
    icon: Crosshair,
    name: "Drill",
    time: "~3 min/rep",
    desc: "Pick your weakest dimension. Get targeted questions. Score on that dimension only. Rapid-fire.",
    color: "from-amber-500/15 to-orange-500/20 text-amber-600 ring-amber-500/10",
  },
  {
    icon: Mic,
    name: "Mock",
    time: "~15 min",
    desc: "Full interview simulation. Question, answer, 2-3 adaptive probes, and a company-calibrated debrief.",
    color: "from-emerald-500/15 to-green-500/20 text-emerald-600 ring-emerald-500/10",
  },
];

const indiaCount = getIndianCompanies().length;
const globalCount = getGlobalCompanies().length;

const Landing = () => {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      {/* Hero zone wrapper */}
      <div className="relative overflow-hidden">
        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 bg-dot-grid" aria-hidden="true" />
        {/* Blue radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 -top-24 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
          aria-hidden="true"
        />
        {/* Indigo glow — top right */}
        <div
          className="pointer-events-none absolute -right-32 -top-16 h-80 w-80 rounded-full bg-indigo-500/[0.07] blur-[80px]"
          aria-hidden="true"
        />
        {/* Cyan whisper — bottom left */}
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cyan-500/[0.05] blur-[80px]"
          aria-hidden="true"
        />

        {/* HERO */}
        <section className="relative mx-auto max-w-5xl px-6 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <BrandIcon className="mx-auto mb-6" animate />
            <h1
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Know exactly where you{" "}
              <span className="text-gradient-primary">stand.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              The PM diagnostic engine that scores on cognitive skills, calibrates to {companies.length} company
              hiring bars, and tracks your progress across sessions — built for India's PM interview market.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 min-w-[220px] text-[15px] font-semibold shadow-soft transition-shadow hover:shadow-soft-md">
                <Link to="/practice">
                  Start calibrating <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-12 text-[15px] font-medium">
                <Link to="/method">How this was built</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              No signup. No paywall. Session data stays in your browser.
            </p>
          </div>

          {/* HERO GRAPHIC UI */}
          <div className="mx-auto mt-16 max-w-4xl animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="relative rounded-2xl border border-border/50 bg-card/30 p-2 backdrop-blur-xl shadow-2xl sm:p-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-indigo-500/[0.03] rounded-2xl" aria-hidden="true" />
              
              {/* Fake browser/app chrome */}
              <div className="flex items-center gap-1.5 px-3 pb-3 pt-1">
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_300px]">
                {/* Left panel: Score breakdown */}
                <div className="rounded-xl border border-border/40 bg-background/50 p-5 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Diagnostic Results</h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Mock Session</span>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: "Problem Framing", score: 4, width: "80%" },
                      { name: "User Empathy", score: 2, width: "40%", isWeak: true },
                      { name: "Prioritization Rationale", score: 3, width: "60%" },
                      { name: "Metric Definition", score: 4, width: "80%" },
                      { name: "Trade-off Awareness", score: 3, width: "60%" },
                    ].map(dim => (
                      <div key={dim.name} className="flex items-center gap-3">
                        <div className="w-32 shrink-0 text-xs text-muted-foreground">{dim.name}</div>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/50">
                          <div 
                            className={`h-full rounded-full ${dim.isWeak ? 'bg-amber-500' : 'bg-primary'}`} 
                            style={{ width: dim.width }} 
                          />
                        </div>
                        <div className="w-4 text-right text-xs font-medium text-foreground">{dim.score}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel: Adaptive Probe */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 rounded-xl border border-border/40 bg-background/50 p-5 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Targeted Probe</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      "You mentioned building for 'all shoppers'. Which specific segment experiences the pain of cart abandonment the most, and why target them first?"
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600">
                      <Crosshair className="h-3 w-3" />
                      Testing User Empathy
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/50 p-4 shadow-inner flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hiring Bar</h3>
                      <p className="text-sm font-medium text-foreground mt-0.5">Borderline</p>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THREE MODES */}
        <section className="relative mx-auto max-w-5xl px-6 pb-16 sm:px-8 sm:pb-24">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {MODES.map(mode => (
              <article key={mode.name} className="rounded-2xl border border-border card-glass p-7 shadow-soft-sm card-interactive">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mode.color} ring-1`}>
                  <mode.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {mode.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-primary">{mode.time}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {mode.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

      </div>{/* end hero zone */}

      {/* COMPANY INTELLIGENCE */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Not generic. Company-calibrated.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Each company has proprietary dimension weights reflecting what they actually test for.
              Your score is evaluated against their specific hiring bar — not a generic rubric.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* India Tech */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                <h3 className="text-sm font-semibold text-foreground">India Tech</h3>
                <span className="text-xs text-muted-foreground">({indiaCount} companies)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getIndianCompanies().map(c => (
                  <span key={c.id} className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Each company includes interview structure, hiring bar by role (APM/PM/SPM), and dimension weights calibrated to Indian PM interview patterns.
              </p>
            </div>

            {/* Global Tech */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-semibold text-foreground">Global Tech</h3>
                <span className="text-xs text-muted-foreground">({globalCount} companies)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getGlobalCompanies().map(c => (
                  <span key={c.id} className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Global companies with India hiring presence. Same calibration depth — dimension weights, hiring bars, and interview structure metadata.
              </p>
            </div>
          </div>

          {/* What's in the metadata */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Target, label: "Dimension weights", detail: "Per-company scoring calibration" },
              { icon: Building2, label: "Hiring bar", detail: "APM / PM / SPM thresholds" },
              { icon: TrendingUp, label: "Session memory", detail: "Tracks trends across sessions" },
              { icon: Crosshair, label: "Weakness targeting", detail: "Drill mode auto-suggests" },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-soft-sm">
                <item.icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How this compares to what you're using today
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Every existing option forces a trade-off. Here is where this tool sits, honestly.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft-sm">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Capability
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-primary">
                    This tool
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ChatGPT
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Exponent
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    IGotAnOffer
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Huru / general AI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON.map((row) => (
                  <tr key={row.dimension} className="align-top">
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {row.dimension}
                    </td>
                    <td className="px-5 py-4">
                      <Cell mark={row.this.mark} label={row.this.label} />
                    </td>
                    <td className="px-5 py-4">
                      <Cell mark={row.chatgpt.mark} label={row.chatgpt.label} />
                    </td>
                    <td className="px-5 py-4">
                      <Cell mark={row.exponent.mark} label={row.exponent.label} />
                    </td>
                    <td className="px-5 py-4">
                      <Cell mark={row.igao.mark} label={row.igao.label} />
                    </td>
                    <td className="px-5 py-4">
                      <Cell mark={row.huru.mark} label={row.huru.label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SCORING DIMENSIONS */}
      <section className="relative mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-24 overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[90px]" aria-hidden="true" />
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The five dimensions we score
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every answer is scored on five cognitive dimensions real PM interviewers evaluate.
            Each company weights these dimensions differently — CRED cares most about trade-offs,
            Razorpay weights metrics heavily.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DIMENSIONS.map((d, i) => (
            <li
              key={d.name}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft-sm card-interactive"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 text-sm font-bold text-primary ring-1 ring-primary/15">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">{d.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.rationale}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-indigo-500/[0.04] p-6">
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold">Why this rubric and not "clarity, confidence, filler
            words"?</span>{" "}
            Generic AI coaches grade you like a public-speaking app. PM interviews differentiate on
            cognitive skill, not delivery. The rationale for each dimension is on the{" "}
            <Link
              to="/method"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              How it works
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-primary/10 bg-gradient-to-b from-primary/[0.05] via-primary/[0.03] to-secondary/40">
        <div className="pointer-events-none absolute left-1/2 -bottom-20 h-72 w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" aria-hidden="true" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/[0.06] blur-[60px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to find out where you actually stand?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Choose a mode. Pick your target company. Get scored against their actual hiring bar.
            Three sessions unlock your calibration report.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 min-w-[220px] text-[15px] font-semibold shadow-soft transition-shadow hover:shadow-soft-md"
          >
            <Link to="/practice">
              Start calibrating <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default Landing;
