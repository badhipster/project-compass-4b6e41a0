import { Link } from "react-router-dom";
import { Zap, Target, Mic, TrendingUp, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandIcon } from "@/components/BrandIcon";
import { getSessionCount, getWeakestDimension, getDimensionAverages, isCalibrationReady } from "@/lib/profile";
import { dimensionShortLabel } from "@/types/interview";

const PracticeHub = () => {
  const sessionCount = getSessionCount();
  const weakest = getWeakestDimension();
  const avgs = getDimensionAverages();
  const calibrationReady = isCalibrationReady();

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
        <div className="text-center animate-fade-up">
          <BrandIcon className="mx-auto mb-6" animate />
          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Choose your <span className="text-gradient-primary">mode.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Quick diagnostic, focused practice, or a full interview simulation.
            {sessionCount > 0 && ` You've completed ${sessionCount} session${sessionCount === 1 ? "" : "s"} so far.`}
          </p>
        </div>

        {/* Profile summary bar */}
        {sessionCount > 0 && avgs && weakest && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft-sm animate-fade-up animate-fade-up-delay-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Weakest dimension: <span className="text-score-low">{dimensionShortLabel(weakest)}</span>
                    <span className="ml-1 text-muted-foreground">({avgs[weakest]}/5 avg)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sessionCount} session{sessionCount === 1 ? "" : "s"} tracked
                    {calibrationReady && " · Calibration report available"}
                  </p>
                </div>
              </div>
              {calibrationReady && (
                <Link
                  to="/profile"
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  View profile
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mode cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* CALIBRATE */}
          <Link
            to="/practice/calibrate"
            className="group relative rounded-2xl border border-border bg-card p-7 shadow-soft-sm card-interactive animate-fade-up animate-fade-up-delay-1"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-primary/20 text-primary ring-1 ring-primary/10">
              <Zap className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Calibrate</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary/70">~5 minutes</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              One question, scored on all 5 dimensions. Find out where you stand for a specific company.
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Start diagnostic <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* DRILL */}
          <Link
            to="/practice/drill"
            className="group relative rounded-2xl border border-border bg-card p-7 shadow-soft-sm card-interactive animate-fade-up animate-fade-up-delay-2"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 text-amber-600 ring-1 ring-amber-500/10">
              <Target className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Drill</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-amber-600/70">~3 min / rep</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pick a weak dimension. Get targeted questions that test only that skill. Rapid-fire.
              {weakest && (
                <span className="mt-2 block text-xs text-amber-600">
                  Suggested: {dimensionShortLabel(weakest)}
                </span>
              )}
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
              Start drill <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* MOCK */}
          <Link
            to="/practice/mock"
            className="group relative rounded-2xl border border-border bg-card p-7 shadow-soft-sm card-interactive animate-fade-up animate-fade-up-delay-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 ring-1 ring-emerald-500/10">
              <Mic className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Mock</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-600/70">~15 minutes</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Full interview simulation. Question, answer, 2-3 follow-up probes, and a detailed debrief with company-calibrated assessment.
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
              Start mock <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          No signup. No paywall. All session data stays in your browser.
        </p>
      </div>

      <SiteFooter />
    </main>
  );
};

export default PracticeHub;
