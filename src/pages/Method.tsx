import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, CheckSquare, Target, Database, Layers, Network, Users, Code2, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const Section = ({
  number,
  title,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <section className="border-t border-border py-14 first:border-t-0 first:pt-0 sm:py-16 group">
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-[160px_1fr]">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {number}
          </p>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="space-y-5 text-[15px] leading-[1.75] text-muted-foreground">
        {children}
      </div>
    </div>
  </section>
);

const Method = () => {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      <article className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        {/* HEADER */}
        <header className="mb-16 max-w-2xl animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h1
            className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            A diagnostic engine, not a practice tool.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            This page is the case study. It explains the product architecture, the intelligence
            layer, and every deliberate design decision — written for someone evaluating this as
            a PM portfolio piece.
          </p>
        </header>

        {/* SECTIONS */}
        <Section number="01" title="The core thesis" icon={Lightbulb}>
          <p>
            Most PM interview prep tools treat sessions as{" "}
            <span className="font-medium text-foreground">disposable</span>. You answer a question,
            get a score, and that's it. No memory. No longitudinal insight. No connection between
            session 1 and session 10.
          </p>
          <p>
            This tool treats PM interview prep as a{" "}
            <span className="font-medium text-foreground">diagnostic arc</span>. Every session
            contributes to a persistent profile that reveals patterns — which dimensions are
            consistently weak, whether you're improving, and where you stand relative to a
            specific company's hiring bar.
          </p>
          
          <div className="mt-6 rounded-xl border border-border/40 bg-secondary/30 p-5 shadow-inner">
             <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
               <span className="text-xs font-semibold text-foreground uppercase tracking-wider">The Arc</span>
               <span className="text-[10px] text-muted-foreground uppercase">Data Flow</span>
             </div>
             <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-center">
               <div className="flex-1">
                 <div className="h-2 w-12 bg-primary/20 rounded mx-auto mb-2" />
                 <span className="text-xs font-medium text-foreground">Calibrate</span>
                 <p className="text-[10px] text-muted-foreground mt-1">Baseline measurement</p>
               </div>
               <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
               <div className="flex-1">
                 <div className="h-2 w-12 bg-amber-500/20 rounded mx-auto mb-2" />
                 <span className="text-xs font-medium text-foreground">Drill</span>
                 <p className="text-[10px] text-muted-foreground mt-1">Targeted repetition</p>
               </div>
               <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
               <div className="flex-1">
                 <div className="h-2 w-12 bg-emerald-500/20 rounded mx-auto mb-2" />
                 <span className="text-xs font-medium text-foreground">Mock</span>
                 <p className="text-[10px] text-muted-foreground mt-1">Full simulation</p>
               </div>
             </div>
          </div>
        </Section>

        <Section number="02" title="Why these five dimensions" icon={CheckSquare}>
          <p>
            Generic AI interview coaches grade you on{" "}
            <span className="font-medium text-foreground">clarity, confidence, and filler-word
            count</span>. That is a public-speaking rubric, not a PM rubric. Real PM interviewers do
            not penalize "ums". They penalize muddled thinking.
          </p>
          <p>
            The five dimensions used here are the ones senior PMs actually evaluate against,
            triangulated from public interview rubrics at Meta, Google, Amazon, and from frameworks
            like CIRCLES and the Rocketblocks scoring guide:
          </p>
          <ul className="mt-2 space-y-3 pl-1">
            <li>
              <span className="font-semibold text-foreground">Problem Framing.</span> Did you define
              the problem before designing the solution? Most candidates skip this. It is the
              single highest-signal dimension in the first 60 seconds of an answer.
            </li>
            <li>
              <span className="font-semibold text-foreground">User Empathy.</span> Did you anchor on
              a specific user segment with a real need, or stay at "all users want this"?
            </li>
            <li>
              <span className="font-semibold text-foreground">Prioritization Rationale.</span> Did
              you justify why one feature over another? Listing features without trade-off logic is
              a tell of a junior PM.
            </li>
            <li>
              <span className="font-semibold text-foreground">Metric Definition.</span> Did you name
              how success would be measured? PMs are accountable to numbers. If your answer ends
              without a metric, the interviewer assumes you would ship and not know if it worked.
            </li>
            <li>
              <span className="font-semibold text-foreground">Trade-off Awareness.</span> Did you
              acknowledge what you were giving up? This is what separates a 4 from a 5.
            </li>
          </ul>
        </Section>

        <Section number="03" title="The intelligence layer" icon={Target}>
          <p>
            <span className="font-semibold text-foreground">The key differentiator is not the
            questions — it's the scoring calibration.</span> Every company in the system has a set
            of proprietary metadata that influences how the AI evaluates your answer:
          </p>
          <ul className="mt-2 space-y-3 pl-1">
            <li>
              <span className="font-semibold text-foreground">Dimension Weights (1-5 per dimension).</span>{" "}
              CRED weights Trade-off Awareness at 5/5 (Critical) because their interviews are
              design-deep and expect you to articulate what you're sacrificing. Razorpay weights
              Metric Definition at 5/5 because they run a data-heavy infrastructure product.
            </li>
            <li>
              <span className="font-semibold text-foreground">Hiring Bar by Role.</span>{" "}
              The expected average score that constitutes "meeting the bar" at APM, PM, and SPM level.
              An SPM candidate at Google scoring 3/5 avg may be "borderline", while the same score at
              a Series B startup is "above".
            </li>
          </ul>
          <p>
            <span className="font-semibold text-foreground">Why a curated list of 15 and not free
            text input?</span> Hallucination control. An LLM
            given "make me a question for a fintech startup" will invent generic questions. Given
            "Razorpay APM, Product Sense, here is the company's actual context and three real
            past questions", it produces an actual, highly calibrated diagnostic output. Adding a 16th means writing all of that properly. This is a quality signal,
            not a quantity signal.
          </p>
        </Section>

        <Section number="04" title="Session memory & local storage" icon={Database}>
          <p>
            Every session is persisted in the browser's localStorage. The profile system tracks:
          </p>
          <ul className="mt-2 space-y-3 pl-1">
            <li>
              <span className="font-semibold text-foreground">Dimension averages.</span> Across
              all sessions, which dimensions are your weakest and strongest.
            </li>
            <li>
              <span className="font-semibold text-foreground">Score trends.</span> How your
              performance on each dimension is moving over time.
            </li>
            <li>
              <span className="font-semibold text-foreground">Drill suggestions.</span> Your
              weakest dimension is automatically suggested when entering Drill mode.
            </li>
          </ul>
          <p>
            <span className="font-semibold text-foreground">Why localStorage and not a database?</span>{" "}
            Zero friction. No signup wall.
            The competitor is ChatGPT — instant, no auth. Adding a login screen before the first
            session loses on the only axis where this tool beats ChatGPT. Secondly, privacy by default. Session
            data never leaves the browser.
          </p>
        </Section>

        <Section number="05" title="The three modes" icon={Layers}>
          <p>
            V1 had a single linear flow: pick type → pick company → answer → score → probe.
            User testing revealed three problems:
          </p>
          <ul className="mt-2 space-y-3 pl-1">
            <li>
              <span className="font-semibold text-foreground">The 15-minute commitment was too high
              for a quick check.</span> Candidates who just wanted to "see where I am" bounced
              because they felt locked into a full session.
            </li>
            <li>
              <span className="font-semibold text-foreground">No way to target a specific
              weakness.</span> If you know your Metric Definition is weak, you had to play through
              the full flow and hope the question tested that dimension.
            </li>
          </ul>
          <p>
            The three modes (Calibrate, Drill, Mock) solve these by offering different time commitments and learning
            objectives, while the shared session history creates the longitudinal arc.
          </p>
        </Section>

        <Section number="06" title="The adaptive probe system" icon={Network}>
          <p>
            Real PM interviews have probes. The interviewer hears your answer and pokes at the
            weakest part: "What about users who don't have smartphones?", "How would you measure
            that?", "What's the trade-off you're making?"
          </p>
          <p>
            <span className="font-semibold text-foreground">Calibrate mode</span> gives you one
            probe based on your weakest scoring dimension. <span className="font-semibold text-foreground">
            Mock mode</span> generates up to three adaptive probes, where each subsequent probe
            is informed by your response to the previous one.
          </p>
          <p>
            The probe generator detects two patterns:
          </p>
          <ul className="mt-2 space-y-3 pl-1">
            <li>
              <span className="font-semibold text-foreground">Isolated weakness.</span>{" "}
              One dimension is clearly the lowest. The probe targets that specific weakness.
            </li>
            <li>
              <span className="font-semibold text-foreground">Thematic pattern.</span>{" "}
              Multiple weaknesses cluster into a behavioral pattern. The system identifies three
              archetypes: "solution-first", "list-maker", or "vague-goal-setter".
            </li>
          </ul>
        </Section>

        <Section number="07" title="Who this is built for" icon={Users}>
          <p>
            Two primary personas drove every design decision:
          </p>
          <ul className="mt-2 space-y-4 pl-1">
            <li>
              <span className="font-semibold text-foreground">Riya — the Repeat Practitioner.</span>{" "}
              APM interviewing at 6-8 companies. Uses Calibrate for baseline, Drill for weakness
              targeting, and Mock before final-round prep. Wants short sessions on mobile.
            </li>
            <li>
              <span className="font-semibold text-foreground">Karan — the Calibration Seeker.</span>{" "}
              SWE transitioning to PM. Wants one honest read on whether his thinking meets bar.
              Uses Calibrate 3 times to get a calibration report.
            </li>
          </ul>
          <p>
            Both personas are India-based, which is why the company list skews India-first. The interview culture, hiring bars, and
            dimension weights reflect Indian PM interview patterns specifically.
          </p>
        </Section>

        <Section number="08" title="Stack and tradeoffs" icon={Code2}>
          <p>
            Vite + React + TypeScript on the frontend, Tailwind and shadcn/ui for the design system,
            Supabase Edge Functions for the LLM calls. Three functional endpoints: question generation,
            scoring + probe, and follow-up probe generation for Mock mode.
          </p>
          <p>
            <span className="font-semibold text-foreground">Why Edge Functions over a Node server?</span>{" "}
            Latency, cost, and zero infra to manage. The LLM call is the only server-side work
            needed.
          </p>
        </Section>

        <Section number="09" title="What 'Pro' would be" icon={Banknote}>
          <p>
            This is a portfolio project. There is no Pro tier and no paywall. But the right
            question for any product is{" "}
            <span className="italic text-foreground">"if you were going to monetize this, how would
            you cut it?"</span>
          </p>
          <ul className="mt-2 space-y-3 pl-1">
            <li>
              <span className="font-semibold text-foreground">One-time ₹799 calibration report.</span>{" "}
              Five sessions, detailed diagnostic report with dimension trends and company-specific
              bar assessment. Matches Karan's persona — willing to pay for an honest read once.
            </li>
            <li>
              <span className="font-semibold text-foreground">B2B to bootcamps and MBA career
              services.</span> Per-seat licensing. They already have rubrics and want async tools
              for their cohorts. Higher ACV, longer LTV, slower sales cycle.
            </li>
          </ul>
        </Section>
      </article>

      {/* CTA */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Try a session.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Reading the methodology helps. Trying it once helps more. Three sessions unlock
            your calibration report.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 h-12 min-w-[220px] text-[15px] font-semibold shadow-soft transition-shadow hover:shadow-soft-md"
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

export default Method;
