import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
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
import { ScoreCard } from "@/components/interview/ScoreCard";
import { ProbeCard } from "@/components/interview/ProbeCard";
import { StepIndicator } from "@/components/interview/StepIndicator";
import { track } from "@/lib/track";
import { getCompanyById } from "@/lib/companies";
import { saveSession, getSessionCount, getDimensionAverages, getWeakestDimension } from "@/lib/profile";
import { dimensionShortLabel } from "@/types/interview";
import type { EvaluationResult, InterviewType, SessionStep, Role } from "@/types/interview";

const Calibrate = () => {
  const [step, setStep] = useState<SessionStep>("setup");
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [question, setQuestion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  const reset = () => {
    setStep("setup");
    setInterviewType(null);
    setCompany(null);
    setRole(null);
    setQuestion("");
    setEvaluation(null);
    setSessionSaved(false);
  };

  const handleGenerate = async () => {
    if (!interviewType || !company || !role) return;
    setGenerating(true);
    try {
      const companyData = getCompanyById(company);
      if (!companyData) throw new Error("Company data not found");

      const { data, error } = await supabase.functions.invoke("generate-question", {
        body: {
          interviewType,
          company: companyData.name,
          role,
          companyContext: companyData.context,
          interviewCulture: companyData.interviewCulture,
          roleContext: companyData.roleContext[role],
          sampleQuestions: companyData.sampleQuestions[interviewType],
        },
      });
      if (error) throw error;
      const q = (data as { question?: string })?.question;
      if (!q) throw new Error("No question returned");
      setQuestion(q);
      setStep("answering");
      track("session_start", { interview_type: interviewType, company, role, mode: "calibrate" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate question";
      toast.error(msg.includes("Rate limit") ? msg : "Could not generate a question. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeToAnswerSec: number) => {
    if (!interviewType || !company || !role) return;
    setSubmittingAnswer(true);
    setStep("scoring");
    track("answer_submitted", { char_count: answer.length, time_to_answer_sec: timeToAnswerSec, mode: "calibrate" });
    try {
      const companyData = getCompanyById(company);
      const { data, error } = await supabase.functions.invoke("evaluate", {
        body: {
          interviewType,
          company,
          role,
          question,
          answer,
          dimensionWeights: companyData?.dimensionWeights,
        },
      });
      if (error) throw error;
      const result = data as EvaluationResult;
      if (!result?.scores) throw new Error("Evaluator returned no scores");
      setEvaluation(result);
      track("score_received", {
        mode: "calibrate",
        barAssessment: result.barAssessment,
      });
      setStep("probing");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not evaluate answer";
      toast.error(msg.includes("Rate limit") ? msg : "Could not evaluate your answer. Please try again.");
      setStep("answering");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSubmitProbe = (response: string) => {
    track("probe_answered", { char_count: response.length, mode: "calibrate" });

    // Save session to localStorage
    if (evaluation && company && role && interviewType && !sessionSaved) {
      saveSession({
        company,
        role,
        interviewType,
        mode: "calibrate",
        scores: evaluation.scores,
        barAssessment: evaluation.barAssessment ?? "borderline",
        probeCount: 1,
      });
      setSessionSaved(true);
    }
    setStep("done");
  };

  const sessionCount = getSessionCount();
  const avgs = getDimensionAverages();
  const weakest = getWeakestDimension();

  if (!supabaseConfigured) {
    return (
      <main className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-soft animate-fade-up">
            <h1 className="text-xl font-bold text-foreground">Backend not connected</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
              The Supabase Edge Functions are not wired up yet. Check back soon or explore the{" "}
              <Link to="/method" className="font-semibold text-primary underline-offset-4 hover:underline">Method</Link> page.
            </p>
          </section>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader
        rightSlot={
          step !== "setup" ? (
            <button type="button" onClick={reset} className="ml-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Restart
            </button>
          ) : null
        }
      />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Back to hub */}
        {step === "setup" && (
          <Link to="/practice" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> All modes
          </Link>
        )}

        {(step === "answering" || step === "scoring" || step === "probing") && (
          <div className="mb-12"><StepIndicator step={step} /></div>
        )}

        {step === "setup" && (
          <div className="space-y-10 animate-fade-up">
            <div className="text-center">
              <BrandIcon className="mx-auto mb-4" animate />
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Quick <span className="text-gradient-primary">Calibration</span>
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                One question, scored on five dimensions. See where you stand for your target company.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">1. Interview Type</h2>
              <TypeSelector selected={interviewType} onSelect={setInterviewType} />
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">2. Target Company</h2>
              <CompanySelectorGrouped selected={company} onSelect={setCompany} />
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">3. Role Level</h2>
              <RoleSelector selectedRole={role} onSelect={setRole} />
            </section>

            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!interviewType || !company || !role || generating}
                className="min-w-[260px] h-12 text-[15px] font-semibold shadow-soft transition-shadow hover:shadow-soft-md"
              >
                {generating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating question…</>
                ) : "Generate Question"}
              </Button>
            </div>
          </div>
        )}

        {step === "answering" && interviewType && company && role && (
          <div className="space-y-8 animate-fade-up">
            <QuestionCard interviewType={interviewType} company={company} question={question} role={role} />
            <AnswerInput onSubmit={handleSubmitAnswer} disabled={submittingAnswer} />
          </div>
        )}

        {step === "scoring" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center animate-fade-up" aria-live="polite">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-soft-sm">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Evaluating your answer…</p>
              <p className="mt-1 text-sm text-muted-foreground">Scoring across 5 PM dimensions</p>
            </div>
          </div>
        )}

        {step === "probing" && interviewType && company && role && evaluation && (
          <div className="space-y-8 animate-fade-up">
            <QuestionCard interviewType={interviewType} company={company} question={question} role={role} />
            <ScoreCard interviewType={interviewType} scores={evaluation.scores} />

            {/* Bar assessment */}
            {evaluation.barAssessment && (
              <div className={`rounded-xl border p-4 ${
                evaluation.barAssessment === "above" ? "border-green-200 bg-green-50" :
                evaluation.barAssessment === "at" ? "border-blue-200 bg-blue-50" :
                evaluation.barAssessment === "borderline" ? "border-amber-200 bg-amber-50" :
                "border-red-200 bg-red-50"
              }`}>
                <p className="text-sm font-semibold text-foreground">
                  Company bar: <span className="capitalize">{evaluation.barAssessment}</span> the hiring bar
                </p>
                {evaluation.barReason && (
                  <p className="mt-1 text-xs text-foreground/70">{evaluation.barReason}</p>
                )}
              </div>
            )}

            <ProbeCard probe={evaluation.probe} onSubmit={handleSubmitProbe} />
          </div>
        )}

        {step === "done" && (
          <div className="space-y-8 animate-fade-up">
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft-sm">
              <h2 className="text-xl font-bold text-foreground">Session saved</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {sessionCount >= 3
                  ? "You have enough sessions for a calibration report."
                  : `${3 - sessionCount} more session${3 - sessionCount === 1 ? "" : "s"} until your calibration report.`}
              </p>

              {avgs && weakest && (
                <div className="mx-auto mt-4 max-w-xs rounded-xl bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your weakest dimension</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{dimensionShortLabel(weakest)}</p>
                  <p className="text-sm text-muted-foreground">{avgs[weakest]}/5 avg across sessions</p>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button onClick={reset} className="min-w-[200px]">New calibration</Button>
                <Button variant="outline" asChild>
                  <Link to="/practice">Back to modes</Link>
                </Button>
                {sessionCount >= 3 && (
                  <Button variant="outline" asChild>
                    <Link to="/profile">View profile</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
};

export default Calibrate;
