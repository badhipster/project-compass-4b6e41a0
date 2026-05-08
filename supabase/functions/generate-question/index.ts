const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_TYPES = new Set(["Product Sense", "Execution", "Behavioral", "Design"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const interviewType = String(body?.interviewType ?? "");
    const companyName = String(body?.company ?? "");
    const role = String(body?.role ?? "PM");
    const companyContext = String(body?.companyContext ?? "");
    const interviewCulture = String(body?.interviewCulture ?? "");
    const roleContext = String(body?.roleContext ?? "");
    const sampleQuestions = Array.isArray(body?.sampleQuestions) ? body.sampleQuestions : [];
    const drillDimension = body?.drillDimension ?? null;
    const isFollowUp = body?.isFollowUp === true;
    const originalQuestion = String(body?.originalQuestion ?? "");
    const previousProbes = Array.isArray(body?.previousProbes) ? body.previousProbes : [];

    if (!VALID_TYPES.has(interviewType)) {
      return new Response(JSON.stringify({ error: "Invalid interviewType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt: string;

    if (isFollowUp && originalQuestion) {
      // Follow-up probe mode for mock interviews
      const probeHistory = previousProbes
        .map((p: { probe: string; response: string }, i: number) =>
          `Probe ${i + 1}: ${p.probe}\nCandidate response: ${p.response}`)
        .join("\n\n");

      systemPrompt = `You are continuing a PM interview at ${companyName} for a ${role}-level candidate.
The candidate has already answered the main question and been probed ${previousProbes.length} time(s).

Original question: ${originalQuestion}

Previous probes and responses:
${probeHistory}

Rules:
- Ask ONE follow-up probe that pushes deeper into a weakness or explores a new angle.
- Do NOT repeat the same angle as a previous probe.
- If the candidate improved on the probed dimension, acknowledge briefly then shift to a new weakness.
- If they didn't improve, push harder with a concrete scenario.
- Return only the probe question text. Nothing else.`;

    } else {
      // Standard question generation (calibrate, drill, mock initial)
      const sampleQsText = sampleQuestions.length > 0
        ? `REFERENCE QUESTIONS (for style/depth calibration — do NOT copy these):\n${sampleQuestions.join('\n')}`
        : "";

      const drillBlock = drillDimension
        ? `\nDRILL MODE: This question must specifically test the candidate's "${drillDimension}" ability. Design the question so that a strong answer REQUIRES demonstrating this dimension clearly.\n`
        : "";

      systemPrompt = `You are a senior PM interviewer at ${companyName}.
Your job is to ask one ${interviewType} interview question calibrated for a ${role}-level candidate.

COMPANY CONTEXT:
${companyContext}

INTERVIEW CULTURE:
${interviewCulture}

ROLE EXPECTATIONS (${role}):
${roleContext}

${sampleQsText}
${drillBlock}
Rules:
- Ask exactly one question. No preamble, no explanation.
- The question must be answerable in 5-10 minutes verbally.
- Calibrate complexity to ${role} level.
  - APM: Focus on structured thinking and user empathy. Simpler scope.
  - PM: Full product sense + execution depth. Expect metrics and trade-offs.
  - SPM: Strategic, multi-product, P&L-level thinking. Expect vision.
- Do not copy the reference questions. Generate a new one in the same style.
- Return only the question text. Nothing else.`;
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a ${interviewType} interview question.` },
        ],
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const text = await aiResp.text();
      console.error("AI gateway error", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds to your Lovable workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const question = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!question) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ question }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-question error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
