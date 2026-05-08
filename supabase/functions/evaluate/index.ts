const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_TYPES = new Set(["Product Sense", "Execution", "Behavioral", "Design"]);

const evaluationTool = {
  type: "function",
  function: {
    name: "submit_evaluation",
    description: "Submit structured scoring of the candidate's PM interview answer.",
    parameters: {
      type: "object",
      properties: {
        scores: {
          type: "object",
          properties: {
            problemFraming: scoreSchema("Problem Framing"),
            userEmpathy: scoreSchema("User Empathy"),
            prioritizationRationale: scoreSchema("Prioritization Rationale"),
            metricDefinition: scoreSchema("Metric Definition / Outcome Clarity"),
            tradeoffAwareness: scoreSchema("Trade-off Awareness"),
          },
          required: [
            "problemFraming",
            "userEmpathy",
            "prioritizationRationale",
            "metricDefinition",
            "tradeoffAwareness",
          ],
          additionalProperties: false,
        },
        probe: { type: "string", description: "One follow-up interviewer question." },
        probeType: { type: "string", enum: ["isolated", "thematic"] },
        probeArchetype: {
          type: ["string", "null"],
          enum: ["solution-first", "list-maker", "vague-goal-setter", null],
        },
        barAssessment: {
          type: "string",
          enum: ["below", "borderline", "at", "above"],
          description: "How the candidate's answer compares to this company's hiring bar for this role.",
        },
        barReason: {
          type: "string",
          description: "One sentence explaining the bar assessment, referencing specific dimension gaps or strengths.",
        },
      },
      required: ["scores", "probe", "probeType", "probeArchetype", "barAssessment", "barReason"],
      additionalProperties: false,
    },
  },
};

function scoreSchema(label: string) {
  return {
    type: "object",
    properties: {
      score: { type: "integer", minimum: 1, maximum: 5, description: `${label} score 1-5` },
      reason: { type: "string", description: "One concise sentence justifying the score." },
    },
    required: ["score", "reason"],
    additionalProperties: false,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const interviewType = String(body?.interviewType ?? "");
    const companyRaw = body?.company;
    const companyName =
      typeof companyRaw === "string" ? companyRaw : String(companyRaw?.name ?? "");
    const role = String(body?.role ?? "PM");
    const question = String(body?.question ?? "");
    const answer = String(body?.answer ?? "");
    const dimensionWeights = body?.dimensionWeights ?? null;

    if (!VALID_TYPES.has(interviewType)) {
      return json({ error: "Invalid interviewType" }, 400);
    }
    if (!companyName) return json({ error: "Missing company" }, 400);
    if (!question) return json({ error: "Missing question" }, 400);
    if (answer.length < 150) return json({ error: "Answer too short" }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const metricLabel = interviewType === "Behavioral" ? "Outcome Clarity" : "Metric Definition";

    const roleCalibration = {
      APM: "APM Level: Score generously on strategic vision (they don't need much), but strictly on basic structured thinking and user empathy.",
      PM: "PM Level: Standard expectations. Must show strong execution, clear metrics, and solid product sense.",
      SPM: "SPM Level: Score strictly. They must demonstrate strategic thinking, organizational leadership, and deep tradeoff awareness. Average answers should get a 2."
    }[role] || "";

    // Build company-calibrated weight instructions
    const weightLabels: Record<string, string> = {
      problemFraming: "Problem Framing",
      userEmpathy: "User Empathy",
      prioritizationRationale: "Prioritization Rationale",
      metricDefinition: metricLabel,
      tradeoffAwareness: "Trade-off Awareness",
    };
    let weightBlock = "";
    if (dimensionWeights && typeof dimensionWeights === "object") {
      const lines = Object.entries(weightLabels).map(([key, label]) => {
        const w = (dimensionWeights as Record<string, number>)[key] ?? 3;
        const tag = w >= 5 ? "CRITICAL" : w >= 4 ? "HIGH" : w >= 3 ? "MODERATE" : "LOW";
        return `- ${label}: importance ${w}/5 (${tag})`;
      });
      weightBlock = `\nCOMPANY-SPECIFIC CALIBRATION for ${companyName}:\nThis company weights dimensions differently in real interviews:\n${lines.join("\n")}\nWhen a highly-weighted dimension scores low, flag it prominently in barReason.\nWhen a low-weight dimension scores low, note it but don't penalize as harshly.\n`;
    }

    const systemPrompt = `You are a brutally honest senior PM interviewer at ${companyName} evaluating a ${role}-level candidate's ${interviewType} answer.

Score 1-5 on each dimension. Be HONEST — most real PM answers score 2-3. A 5 is exceptional and rare. A 1 is missing entirely. Do not be generous.

ROLE CALIBRATION:
${roleCalibration}
${weightBlock}
Dimensions:
- Problem Framing: Did they restate, scope, clarify the problem before solutioning?
- User Empathy: Did they identify a specific user/segment with real pain?
- Prioritization Rationale: Did they explain WHY this over alternatives, with criteria?
- ${metricLabel}: ${interviewType === "Behavioral" ? "Did they describe a concrete, measurable outcome?" : "Did they propose a clear primary metric and guardrails?"}
- Trade-off Awareness: Did they acknowledge what they're giving up or what could go wrong?

Then craft ONE follow-up probe:
- If ONE dimension is clearly the lowest (>=1 point below the next), set probeType="isolated", probeArchetype=null, and probe that specific weakness.
- If multiple weaknesses cluster into a behavioral pattern, set probeType="thematic" and pick probeArchetype:
  - "solution-first": jumped to features without framing problem/user
  - "list-maker": listed many options without prioritizing or justifying
  - "vague-goal-setter": talked outcomes without concrete metrics
The probe must be one short interviewer-style question. No preamble.

Finally, assess the candidate against ${companyName}'s hiring bar for ${role}:
- "below": would not pass this round
- "borderline": weak pass or on the fence
- "at": solid pass, meets expectations
- "above": strong performance, exceeds the bar
Provide a one-sentence barReason referencing specific dimension gaps or strengths.

Call submit_evaluation with the result.`;

    const userPrompt = `Question: ${question}\n\nCandidate answer:\n${answer}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [evaluationTool],
        tool_choice: { type: "function", function: { name: "submit_evaluation" } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const text = await aiResp.text();
      console.error("AI gateway error", status, text);
      if (status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
      if (status === 402) return json({ error: "AI credits exhausted. Add funds to your Lovable workspace." }, 402);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      console.error("No tool call returned", JSON.stringify(data));
      return json({ error: "Evaluator did not return structured output" }, 500);
    }
    let parsed: unknown;
    try {
      parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    } catch (e) {
      console.error("Bad JSON in tool call", argsRaw);
      return json({ error: "Evaluator returned malformed JSON" }, 500);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}