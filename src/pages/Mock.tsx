import { useState } from "react";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
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
import { track } from "@/lib/track";
import { getCompanyById } from "@/lib/companies";
import { saveSession } from "@/lib/profile";
import { dimensionShortLabel, DIMENSION_KEYS } from "@/types/interview";
import { scoreColorClass, scoreLabel } from "@/lib/scoring";
import type { EvaluationResult, InterviewType, Role, Scores } from "@/types/interview";

type MockStep = "setup" | "answering" | "evaluating" | "probe1" | "probe2" | "probe3" | "debrief";

interface ProbeExchange {
  probe: string;
  response: string;
}

const MAX_PROBES = 3;

const Mock = () => {
  const [step, setStep] = useState<MockStep>("setup");
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [question, setQuestion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [probeExchanges, setProbeExchanges] = useState<ProbeExchange[]>([]);
  const [currentProbe, setCurrentProbe] = useState("");
  const [loadingProbe, setLoadingProbe] = useState(false);

  const reset = () => {
    setStep("setup");
    setInterviewType(null);
    setCompany(null);
    setRole(null);
    setQuestion("");
    setEvaluation(null);
    setProbeExchanges([]);
    setCurrentProbe("");
  };

  const handleGenerate = async () => {
    if (!interviewType || !company || !role) return;
    setGenerating(true);
    try {
      const companyData = getCompanyById(company);
      if (!companyData) throw new Error("Company not found");
      const { data, error } = await supabase.functions.invoke("generate-question", {
        body: {
          interviewType, company: companyData.name, role,
          companyContext: companyData.context, interviewCulture: companyData.interviewCulture,
          roleContext: companyData.roleContext[role], sampleQuestions: companyData.sampleQuestions[interviewType],
        },
      });
      if (error) throw error;
      const q = (data as { question?: string })?.question;
      if (!q) throw new Error("No question returned");
      setQuestion(q);
      setStep("answering");
      track("session_start", { interview_type: interviewType, company, role, mode: "mock" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not generate question.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeToAnswerSec: number) => {
    if (!interviewType || !company || !role) return;
    setSubmitting(true);
    setStep("evaluating");
    track("answer_submitted", { char_count: answer.length, time_to_answer_sec: timeToAnswerSec, mode: "mock" });
    try {
      const companyData = getCompanyById(company);
      const { data, error } = await supabase.functions.invoke("evaluate", {
        body: { interviewType, company, role, question, answer, dimensionWeights: companyData?.dimensionWeights },
      });
      if (error) throw error;
      const result = data as EvaluationResult;
      if (!result?.scores) throw new Error("No scores returned");
      setEvaluation(result);
      setCurrentProbe(result.probe);
      setStep("probe1");
      track("score_received", { mode: "mock", barAssessment: result.barAssessment });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed.");
      setStep("answering");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProbeResponse = async (response: string) => {
    const exchange: ProbeExchange = { probe: currentProbe, response };
    const newExchanges = [...probeExchanges, exchange];
    setProbeExchanges(newExchanges);

    const probeNum = newExchanges.length;
    track("probe_answered", { probe_number: probeNum, char_count: response.length, mode: "mock" });

    if (probeNum >= MAX_PROBES) {
      finishSession(newExchanges);
      return;
    }

    // Generate next probe
    setLoadingProbe(true);
    try {
      const companyData = getCompanyById(company!);
      const { data, error } = await supabase.functions.invoke("generate-question", {
        body: {
          interviewType, company: companyData?.name, role,
          companyContext: companyData?.context,
          interviewCulture: companyData?.interviewCulture,
          roleContext: companyData?.roleContext[role!],
          sampleQuestions: [],
          isFollowUp: true,
          originalQuestion: question,
          previousProbes: newExchanges,
        },
      });
      if (error) throw error;
      const nextProbe = (data as { question?: string })?.question;
      if (!nextProbe) {
        finishSession(newExchanges);
        return;
      }
      setCurrentProbe(nextProbe);
      setStep(`probe${probeNum + 1}` as MockStep);
    } catch {
      // If follow-up generation fails, end gracefully
      finishSession(newExchanges);
    } finally {
      setLoadingProbe(false);
    }
  };

  const finishSession = (exchanges: ProbeExchange[]) => {
    if (evaluation && company && role && interviewType) {
      saveSession({
        company, role, interviewType, mode: "mock",
        scores: evaluation.scores,
        barAssessment: evaluation.barAssessment ?? "borderline",
        probeCount: exchanges.length,
      });
    }
    setStep("debrief");
  };

  const skipToDebrief = () => finishSession(probeExchanges);

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

  const companyData = company ? getCompanyById(company) : null;
  const avgScore = evaluation
    ? Math.round((DIMENSION_KEYS.reduce((s, k) => s + evaluation.scores[k].score, 0) / 5) * 10) / 10
    : 0;

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader
        rightSlot={step !== "setup" ? (
          <button type="button" onClick={reset} className="ml-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            Exit mock
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
                  Mock <span className="text-gradient-primary">Interview</span>
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Full simulation: answer → score → 2-3 follow-up probes → detailed debrief with hiring bar assessment.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">1. Interview Type</h2>
                <TypeSelector selected={interviewType} onSelect={setInterviewType} />
              </section>
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">2. Company</h2>
                <CompanySelectorGrouped selected={company} onSelect={setCompany} />
              </section>
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">3. Role Level</h2>
                <RoleSelector selectedRole={role} onSelect={setRole} />
              </section>

              <div className="flex justify-center pt-2">
                <Button size="lg" onClick={handleGenerate}
                  disabled={!interviewType || !company || !role || generating}
                  className="min-w-[260px] h-12 text-[15px] font-semibold shadow-soft hover:shadow-soft-md">
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting mock…</> : "Start Mock Interview"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "answering" && interviewType && company && role && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">MOCK INTERVIEW</span>
              <span className="text-xs text-muted-foreground">{companyData?.name} · {role} · {interviewType}</span>
            </div>
            <QuestionCard interviewType={interviewType} company={company} question={question} role={role} />
            <AnswerInput onSubmit={handleSubmitAnswer} disabled={submitting} />
          </div>
        )}

        {step === "evaluating" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-soft-sm">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
            </div>
            <p className="text-base font-medium">Evaluating your answer…</p>
            <p className="text-sm text-muted-foreground">Preparing follow-up probes</p>
          </div>
        )}

        {/* Probe steps */}
        {(step === "probe1" || step === "probe2" || step === "probe3") && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  PROBE {probeExchanges.length + 1}/{MAX_PROBES}
                </span>
              </div>
              <button type="button" onClick={skipToDebrief}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Skip to debrief →
              </button>
            </div>

            {/* Previous exchanges */}
            {probeExchanges.length > 0 && (
              <div className="space-y-3">
                {probeExchanges.map((ex, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex gap-3">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <p className="text-sm font-medium text-foreground">{ex.probe}</p>
                    </div>
                    <div className="ml-7 rounded-lg bg-secondary/60 p-3">
                      <p className="text-sm text-foreground/80">{ex.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loadingProbe ? (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                <p className="text-sm text-muted-foreground">Generating next probe…</p>
              </div>
            ) : (
              <>
                {/* Current probe */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex gap-3">
                    <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm font-medium leading-relaxed text-foreground">{currentProbe}</p>
                  </div>
                </div>

                {/* Response input */}
                <ProbeResponseInput onSubmit={handleProbeResponse} />
              </>
            )}
          </div>
        )}

        {/* Debrief */}
        {step === "debrief" && evaluation && interviewType && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Mock Debrief</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {companyData?.name} · {role} · {interviewType} · {probeExchanges.length} probe{probeExchanges.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* Bar assessment */}
            <div className={`rounded-2xl border p-6 text-center ${
              evaluation.barAssessment === "above" ? "border-green-200 bg-green-50" :
              evaluation.barAssessment === "at" ? "border-blue-200 bg-blue-50" :
              evaluation.barAssessment === "borderline" ? "border-amber-200 bg-amber-50" :
              "border-red-200 bg-red-50"
            }`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {companyData?.name} · {role} Hiring Bar
              </p>
              <p className={`mt-2 text-3xl font-bold capitalize ${
                evaluation.barAssessment === "above" ? "text-score-high" :
                evaluation.barAssessment === "at" ? "text-primary" :
                evaluation.barAssessment === "borderline" ? "text-score-mid" :
                "text-score-low"
              }`}>
                {evaluation.barAssessment}
              </p>
              <p className={`mt-1 text-lg font-semibold ${scoreColorClass(Math.round(avgScore))}`}>
                {avgScore}/5 avg
              </p>
              {evaluation.barReason && (
                <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">{evaluation.barReason}</p>
              )}
            </div>

            <ScoreCard interviewType={interviewType} scores={evaluation.scores} />

            {/* Probe conversation review */}
            {probeExchanges.length > 0 && (
              <section className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Probe Conversation</h3>
                <div className="space-y-4">
                  {probeExchanges.map((ex, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex gap-3">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-sm font-medium text-foreground">{ex.probe}</p>
                      </div>
                      <div className="ml-7 rounded-lg bg-secondary/60 p-3">
                        <p className="text-sm text-foreground/80">{ex.response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button onClick={reset} className="min-w-[200px]">New mock interview</Button>
              <Button variant="outline" asChild><Link to="/practice">Switch mode</Link></Button>
              <Button variant="outline" asChild><Link to="/profile">View profile</Link></Button>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
};

// Simple probe response textarea
function ProbeResponseInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  const handleSubmit = () => {
    if (text.trim().length < 50) {
      toast.error("Please provide a more detailed response (at least 50 characters).");
      return;
    }
    onSubmit(text.trim());
    setText("");
  };
  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Respond to the probe..."
        rows={4}
        className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{text.length} chars (min 50)</p>
        <Button size="sm" onClick={handleSubmit} disabled={text.trim().length < 50}>
          Submit response
        </Button>
      </div>
    </div>
  );
}

export default Mock;
