import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  getProfile, clearProfile, getDimensionAverages, getWeakestDimension,
  getStrongestDimension, getRecentSessions, isCalibrationReady,
} from "@/lib/profile";
import { dimensionShortLabel, weightLabel, DIMENSION_KEYS } from "@/types/interview";
import { scoreColorClass, scoreLabel } from "@/lib/scoring";
import { getCompanyById } from "@/lib/companies";
import { useState } from "react";

const Profile = () => {
  const [, forceUpdate] = useState(0);
  const profile = getProfile();
  const avgs = getDimensionAverages();
  const weakest = getWeakestDimension();
  const strongest = getStrongestDimension();
  const recent = getRecentSessions(10);
  const ready = isCalibrationReady();

  const handleClear = () => {
    if (window.confirm("Clear all session history? This cannot be undone.")) {
      clearProfile();
      forceUpdate(n => n + 1);
    }
  };

  if (profile.sessions.length === 0) {
    return (
      <main className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">No sessions yet</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Complete a calibration session to start building your profile.
          </p>
          <Button asChild className="mt-6">
            <Link to="/practice">Start practicing</Link>
          </Button>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
        <Link to="/practice" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to practice
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your <span className="text-gradient-primary">Profile</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile.sessions.length} session{profile.sessions.length === 1 ? "" : "s"} tracked
              {!ready && ` · ${3 - profile.sessions.length} more for calibration report`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Clear all data"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Dimension averages */}
        {avgs && (
          <section className="mt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dimension Averages
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {DIMENSION_KEYS.map(dim => {
                const avg = avgs[dim];
                const isWeakest = dim === weakest;
                const isStrongest = dim === strongest;
                return (
                  <div
                    key={dim}
                    className={`rounded-xl border p-4 text-center ${
                      isWeakest ? "border-red-200 bg-red-50" :
                      isStrongest ? "border-green-200 bg-green-50" :
                      "border-border bg-card"
                    }`}
                  >
                    <p className="text-xs font-medium text-muted-foreground">{dimensionShortLabel(dim)}</p>
                    <p className={`mt-1 text-2xl font-bold ${scoreColorClass(Math.round(avg))}`}>
                      {avg}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{scoreLabel(Math.round(avg))}</p>
                    {isWeakest && (
                      <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-score-low">
                        <TrendingDown className="h-3 w-3" /> Weakest
                      </span>
                    )}
                    {isStrongest && (
                      <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-score-high">
                        <TrendingUp className="h-3 w-3" /> Strongest
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Calibration report teaser */}
        {ready && avgs && weakest && strongest && (
          <section className="mt-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-blue-500/[0.04] p-6">
            <h2 className="text-base font-semibold text-foreground">Calibration Summary</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Across {profile.sessions.length} sessions, your strongest dimension is{" "}
              <strong>{dimensionShortLabel(strongest)}</strong> ({avgs[strongest]}/5) and your weakest is{" "}
              <strong className="text-score-low">{dimensionShortLabel(weakest)}</strong> ({avgs[weakest]}/5).
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              We recommend using <strong>Drill mode</strong> to target {dimensionShortLabel(weakest)} specifically.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/practice/drill">Drill {dimensionShortLabel(weakest)}</Link>
            </Button>
          </section>
        )}

        {/* Recent sessions */}
        <section className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {recent.map(session => {
              const companyData = getCompanyById(session.company);
              const totalScore = DIMENSION_KEYS.reduce(
                (sum, k) => sum + (session.scores[k]?.score ?? 0), 0
              );
              const avg = Math.round((totalScore / 5) * 10) / 10;
              return (
                <div key={session.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {companyData?.name ?? session.company}
                      <span className="ml-1.5 text-xs text-muted-foreground">· {session.role} · {session.interviewType}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString()} · {session.mode}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-bold ${scoreColorClass(Math.round(avg))}`}>{avg}</p>
                    <p className={`text-[10px] font-medium capitalize ${
                      session.barAssessment === "above" ? "text-score-high" :
                      session.barAssessment === "at" ? "text-primary" :
                      session.barAssessment === "borderline" ? "text-score-mid" :
                      "text-score-low"
                    }`}>
                      {session.barAssessment ?? "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
};

export default Profile;
