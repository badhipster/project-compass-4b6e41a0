import { useState } from "react";
import { Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandIcon } from "@/components/BrandIcon";
import { TypeSelector } from "@/components/interview/TypeSelector";
import { CompanySelectorGrouped } from "@/components/interview/CompanySelectorGrouped";
import { RoleSelector } from "@/components/interview/RoleSelector";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInput } from "@/components/interview/AnswerInput";
import { track } from "@/lib/track";
import { getCompanyById } from "@/lib/companies";
import { saveSession, getWeakestDimension } from "@/lib/profile";
import { dimensionShortLabel, dimensionLabel, DIMENSION_KEYS } from "@/types/interview";
import { scoreColorClass, scoreLabel } from "@/lib/scoring";
import type { EvaluationResult, InterviewType, Role, Scores } from "@/types/interview";

type DrillStep = "setup" | "answering" | "evaluating" | "feedback";

const DIMENSION_DESCRIPTIONS: Record<keyof Scores, string> = {
  problemFraming: "Did you restate, scope, and clarify the problem before jumping to solutions?",
  userEmpathy: "Did you identify a specific user segment with a real, felt pain point?",
  prioritizationRationale: "Did you explain WHY this approach over alternatives, with clear criteria?",
  metricDefinition: "Did you propose a clear primary metric and guardrails?",
  tradeoffAwareness: "Did you acknowledge what you're giving up or what could go wrong?",
};

const Drill = () => {
  const [step, setStep] = useState<DrillStep>("setup");
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [targetDimension, setTargetDimension] = useState<keyof Scores | null>(null);
  const [question, setQuestion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [repCount, setRepCount] = useState(0);

  const suggestedDimension = getWeakestDimension();

  const reset = () => {
    setStep("setup");
    setQuestion("");
    setEvaluation(null);
  };

  const fullReset = () => {
    reset();
    setInterviewType(null);
    setCompany(null);
    setRole(null);
    setTargetDimension(null);
    setRepCount(0);
  };

  const handleGenerate = async () => {
    if (!interviewType || !company || !role || !targetDimension) return;
    setGenerating(true);
    try {
      const companyData = getCompanyById(company);
      if (!companyData) throw new Error("Company not found");

      const dimName = dimensionShortLabel(targetDimension);

      const { data, error } = await supabase.functions.invoke("generate-question", {
        body: {
          interviewType,
          company: companyData.name,
          role,
          companyContext: companyData.context,
          interviewCulture: companyData.interviewCulture,
          roleContext: companyData.roleContext[role],
          sampleQuestions: companyData.sampleQuestions[interviewType],
          drillDimension: dimName,
        },
      });
      if (error) throw error;
      const q = (data as { question?: string })?.question;
      if (!q) throw new Error("No question returned");
      setQuestion(q);
      setStep("answering");
      setRepCount(n => n + 1);
      track("session_start", { interview_type: interviewType, company, role, mode: "drill", dimension: targetDimension });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate";
      toast.error(msg.includes("Rate limit") ? msg : "Could not generate a question.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeToAnswerSec: number) => {
    if (!interviewType || !company || !role || !targetDimension) return;
    setSubmitting(true);
    setStep("evaluating");
    track("answer_submitted", { char_count: answer.length, time_to_answer_sec: timeToAnswerSec, mode: "drill" });
    try {
      const companyData = getCompanyById(company);
      const { data, error } = await supabase.functions.invoke("evaluate", {
        body: { interviewType, company, role, question, answer, dimensionWeights: companyData?.dimensionWeights },
      });
      if (error) throw error;
      const result = data as EvaluationResult;
      if (!result?.scores) throw new Error("No scores returned");
      setEvaluation(result);

      saveSession({
        company,
        role,
        interviewType,
        mode: "drill",
        scores: result.scores,
        barAssessment: result.barAssessment ?? "borderline",
        probeCount: 0,
        targetDimension,
        targetDimensionScore: result.scores[targetDimension]?.score,
      });

      setStep("feedback");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Evaluation failed";
      toast.error(msg.includes("Rate limit") ? msg : "Could not evaluate. Try again.");
      setStep("answering");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextRep = () => {
    setQuestion("");
    setEvaluation(null);
    handleGenerate();
  };

  if (!supabaseConfigured) {
    return (
      <main className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="text-muted-foreground">Backend not connected.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader
        rightSlot={step !== "setup" ? (
          <button type="button" onClick={fullReset} className="ml-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            Restart
          </button>
        ) : null}
      />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        {step === "setup" && (
          <>
            <Link to="/practice" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> All modes
            </Link>

            <div className="space-y-10 animate-fade-up">
              <div className="text-center">
                <BrandIcon className="mx-auto mb-4" animate />
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Dimension <span className="text-gradient-primary">Drill</span>
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Pick a weakness. Get targeted questions. Score on that dimension only. Rapid-fire.
                </p>
              </div>

              {/* Dimension selector */}
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">1. Dimension to Drill</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {DIMENSION_KEYS.map(dim => {
                    const isSuggested = dim === suggestedDimension;
                    const isSelected = dim === targetDimension;
                    return (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => setTargetDimension(dim)}
                        className={`relative rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-soft"
                            : "border-border bg-card hover:border-primary/30 hover:shadow-soft-sm card-interactive"
                        }`}
                      >
                        {isSuggested && (
                          <span className="absolute -top-2 right-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Suggested
                          </span>
                        )}
                        <p className="text-sm font-semibold text-foreground">{dimensionShortLabel(dim)}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-snug">{DIMENSION_DESCRIPTIONS[dim]}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">2. Interview Type</h2>
                <TypeSelector selected={interviewType} onSelect={setInterviewType} />
              </section>

              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">3. Target Company</h2>
                <CompanySelectorGrouped selected={company} onSelect={setCompany} />
              </section>

              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">4. Role Level</h2>
                <RoleSelector selectedRole={role} onSelect={setRole} />
              </section>

              <div className="flex justify-center pt-2">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!targetDimension || !interviewType || !company || !role || generating}
                  className="min-w-[260px] h-12 text-[15px] font-semibold shadow-soft hover:shadow-soft-md"
                >
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : `Drill ${targetDimension ? dimensionShortLabel(targetDimension) : "..."}`}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "answering" && interviewType && company && role && targetDimension && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  DRILL: {dimensionShortLabel(targetDimension)}
                </span>
                <span className="text-xs text-muted-foreground">Rep #{repCount}</span>
              </div>
            </div>
            <QuestionCard interviewType={interviewType} company={company} question={question} role={role} />
            <AnswerInput onSubmit={handleSubmitAnswer} disabled={submitting} />
          </div>
        )}

        {step === "evaluating" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 shadow-soft-sm">
              <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
            </div>
            <p className="text-base font-medium text-foreground">
              Evaluating {dimensionShortLabel(targetDimension!)}…
            </p>
          </div>
        )}

        {step === "feedback" && evaluation && targetDimension && interviewType && (
          <div className="space-y-8 animate-fade-up">
            {/* Focused dimension result */}
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {dimensionLabel(targetDimension, interviewType)}
              </p>
              <p className={`mt-2 text-5xl font-bold ${scoreColorClass(evaluation.scores[targetDimension].score)}`}>
                {evaluation.scores[targetDimension].score}<span className="text-lg text-muted-foreground">/5</span>
              </p>
              <p className={`mt-1 text-sm font-medium ${scoreColorClass(evaluation.scores[targetDimension].score)}`}>
                {scoreLabel(evaluation.scores[targetDimension].score)}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/80">
                {evaluation.scores[targetDimension].reason}
              </p>
            </div>

            {/* Other dimensions (collapsed) */}
            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                See all 5 dimension scores
              </summary>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {DIMENSION_KEYS.map(dim => (
                  <div key={dim} className={`rounded-lg border p-3 text-center ${dim === targetDimension ? "border-primary bg-primary/5" : "border-border"}`}>
                    <p className="text-[10px] font-medium text-muted-foreground">{dimensionShortLabel(dim)}</p>
                    <p className={`mt-0.5 text-xl font-bold ${scoreColorClass(evaluation.scores[dim].score)}`}>
                      {evaluation.scores[dim].score}
                    </p>
                  </div>
                ))}
              </div>
            </details>

            {/* Actions */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button onClick={handleNextRep} className="min-w-[200px] gap-2">
                <RotateCcw className="h-4 w-4" /> Drill again
              </Button>
              <Button variant="outline" asChild>
                <Link to="/practice">Switch mode</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/profile">View profile</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
};

export default Drill;
