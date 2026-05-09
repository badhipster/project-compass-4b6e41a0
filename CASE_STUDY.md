# Case Study: PM Interview Prep Coach

A portfolio project that argues its own case. Every design decision is documented because the decisions are the product.

---

## TL;DR

**Problem.** PM candidates have no async tool that scores them on PM cognitive skills, calibrates questions to specific companies, and probes follow-ups like a real interviewer. They get human coaching ($200/hr), generic AI ("clarity, confidence"), or DIY prompting (no rubric).

**Solution.** A free, no-signup web tool featuring three distinct prep modes (Calibrate, Drill, Mock). Users pick an interview type, target company, and role. They answer questions, get scored against a calibrated 5-dimension PM rubric, face adaptive follow-up probes, and track their skill progression over time via local storage.

**Wedge.** The adaptive follow-up probe and longitudinal session memory are the sharpest differentiators. No competitor delivers this async, structured flow for free without a signup wall. The PM-specific rubric and curated company list form the supporting moat.

**Status.** Built as a portfolio project. No monetization. The "What Pro would be" thinking is documented inside [/method](src/pages/Method.tsx) and in this case study.

---

## The problem

PM interview prep is a market failure across three dimensions.

### Cost-quality tension

Human coaching from ex-FAANG PMs (IGotAnOffer) is $100–250/hour. That's high enough that candidates can afford 2–3 sessions total — far below what habit formation requires. Peer mock platforms (Exponent) lower the cost but introduce three-day scheduling windows. Both options force candidates to ration their practice.

### Generic AI fails on rubric

Tools like Huru and Interview Sidekick are async and free at the entry tier, but they score on "clarity, confidence, filler-word count" — a public-speaking rubric that has nothing to do with PM cognition. Worse, they're encouragement-biased by default ("Great structure! Consider adding more detail."). A candidate using them learns nothing about whether their thinking meets bar.

### DIY with ChatGPT is unstructured

The most flexible option is also the worst for repeat practice. The candidate has to build the prompt themselves every session, has no rubric, and gets feedback that's calibrated against the model's general training rather than PM interview standards. ChatGPT-direct is explicitly biased toward agreement and praise, which is the opposite of what useful interview feedback looks like.

### The unmet need

A candidate who knows their target company (say, Razorpay), wants a question calibrated to it, wants feedback on PM-specific cognitive dimensions, and wants targeted, adaptive follow-up probes — has no tool that does this in a single session without paying for human coaching.

---

## Users

Two primary personas. Every design decision was triaged against these two.

### Riya — the Repeat Practitioner

24, APM at a Series B startup. Actively interviewing at 6–8 companies. Wants 2–3 short evening sessions a week, on mobile, calibrated to her targets. **Habit formation is everything for Riya.** Any friction at session start (signup, paywall) loses her to ChatGPT.

**Her #1 ask:** target-practice. If "Razorpay" generates a generic product-sense question, the tool fails her.

### Karan — the Calibration Seeker

27, SWE transitioning to PM. Three months of self-study. Wants one honest read on whether his thinking meets PM bar. Every other AI tool gives him 4/5 with generic feedback, which is useless because he can't tell if he's actually weak or actually fine.

**His #1 ask:** honest, dimension-specific scoring. A 2/5 on Prioritization Rationale with a specific reason is more valuable to Karan than a 4/5 with a generic compliment.

### Portfolio audience (not a persona)

A senior PM on a hiring panel, finding the live URL via the GitHub README. **They are not a user of the tool.** Their signal comes from the case study and the architecture document. The product exists to demonstrate PM judgment to them, not to serve their job. Design tradeoffs were never made to "look more impressive" at the cost of Riya/Karan's experience.

---

## Solution

A three-page web app:

1. **Landing (`/`)** — pitches the wedge, shows the comparison table inline, explains the 5 dimensions. Built for the first-time visitor (Karan, recruiters).
2. **Practice (`/practice`)** — the tool itself. Choose from three modes (Calibrate, Drill, Mock). Pick company → role → question → answer → score → adaptive probes. Powered entirely by localStorage for session memory.
3. **Method (`/method`)** — the PM reasoning behind every design choice, written for someone who is using the product right now. The case study lives inside the product.

### Core flow: The Three Modes

User testing revealed that a single 15-minute flow was too inflexible. The architecture is built around three modes that serve different prep moments:

- **Calibrate (~5 min).** One question, scored on all five dimensions, plus one probe. The diagnostic baseline.
- **Drill (~3 min/rep).** Rapid-fire repetition targeting the user's weakest dimension specifically.
- **Mock (~15 min).** Full interview simulation with 2-3 adaptive follow-up probes and a detailed debrief with company-calibrated bar assessment.

### Why these 5 dimensions

Triangulated from public PM rubrics (Meta, Google, Amazon) and frameworks (CIRCLES, Rocketblocks):

| Dimension | What it measures | Why it matters |
|---|---|---|
| Problem Framing | Did you define the problem before solving? | Junior tell: jumping straight to features |
| User Empathy | Did you anchor on a specific user segment? | Generic users = generic answers |
| Prioritization Rationale | Did you justify your choices? | Lists without rationale = junior PM |
| Metric Definition | Did you name how success is measured? | PMs are accountable to numbers |
| Trade-off Awareness | Did you say what you gave up? | The 4 vs 5 line |

For Behavioral interviews, "Metric Definition" becomes "Outcome Clarity" — same dimension, different vocabulary.

### Why curated companies, not free text

Two reasons: hallucination control and quality bar. An LLM given "make me a question for a fintech startup" will invent generic prompts. Given "Razorpay APM, Product Sense, here is the company's actual context and three real past questions," it produces something usable.

Each company has structured context: market positioning, current strategic tensions, interview culture, role-level expectations, and 3 sample questions per interview type. Adding the 16th company means writing all of that. **Quantity is a noise signal; curation is a quality signal.**

### The Adaptive Probe System

Real PM interviews have probes. The interviewer hears your answer and pokes at the weakest part. The probe generator detects two patterns:

1. **Isolated weakness.** One dimension is clearly the lowest. The probe targets that specific weakness.
2. **Thematic pattern.** Multiple weaknesses cluster into a behavioral pattern (e.g. "solution-first" or "vague-goal-setter").

---

## Session Memory without Auth

**The single most important technical tradeoff:** The profile system tracks dimension averages, score trends, and automatically suggests Drill targets. This provides longitudinal value across sessions. 

However, all of this is done via browser `localStorage`.
- **Zero friction:** No signup wall means it beats ChatGPT on speed to first practice.
- **Privacy by default:** Session data never leaves the browser.
- **Scalability:** If the product scales, the migration path to a database (via optional auth) is fully structured.

---

## Competitive landscape

| Competitor | Wins on | Loses on |
|---|---|---|
| Exponent | Peer mocks closest to real interviews; community | No AI feedback loop; scheduling friction |
| IGotAnOffer | Insider company knowledge; real probing | $100-250/hr; no async |
| RocketBlocks | Drilling structure (sizing, math) | Consulting-primary; static; no AI |
| Huru / Interview Sidekick | AI-native, instant, accessible | Generic rubric; encouragement-biased |
| ChatGPT / Claude direct | Free, flexible | No rubric; no cadence; user does all the work |

**The wedge:** PM-specific rubric + company calibration + adaptive probes + session tracking in one async, signup-free loop. No competitor at any price point combines all of these.

---

## What 'Pro' would be (Monetization Strategy)

This is a portfolio project with no paywall. But the right question is "how would you monetize this?" Pure B2C freemium fails for interview prep because churn is the goal (they get hired) and lifetime is short (4-12 weeks). 

The actual monetization paths:
1. **One-time ₹799 calibration report.** Five sessions yielding a detailed diagnostic report with dimension trends and company-specific bar assessment. Matches Karan's persona.
2. **B2B to bootcamps and MBA career services.** Per-seat licensing. They already have rubrics and want async tools for cohorts. Higher ACV, longer LTV.
3. **White-label to existing coaching firms.** The moat is the company intelligence layer and scoring calibration, not the audience.

---

## Repo layout

- [/README.md](README.md) — quick intro, stack, run locally
- [/CASE_STUDY.md](CASE_STUDY.md) — this document
- [/ARCHITECTURE.md](ARCHITECTURE.md) — one-page tech tradeoffs
- [/src/pages/Method.tsx](src/pages/Method.tsx) — the in-app version of this reasoning, written for users mid-session
