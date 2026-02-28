import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { mode } = body;

    let messages: Array<{ role: string; content: string }>;

    if (mode === "generate-result") {
      // Generate a simulated AI result for a given prompt
      const { prompt } = body;
      messages = [
        {
          role: "system",
          content: "Você é um assistente de IA. Responda ao prompt do usuário de forma concisa (máximo 150 palavras). Responda em português brasileiro.",
        },
        { role: "user", content: prompt },
      ];
    } else if (mode === "evaluate") {
      // Evaluate a user's prompt against criteria
      const { userPrompt, evaluationCriteria, rubric, maxScore } = body;

      const criteriaText = (evaluationCriteria || []).map((c: string, i: number) => `${i + 1}. ${c}`).join("\n");
      const rubricText = rubric
        ? rubric.map((r: { criterion: string; points: number }) => `- ${r.criterion}: ${r.points}pts`).join("\n")
        : "";

      messages = [
        {
          role: "system",
          content: `Você é um avaliador de prompts de IA. Avalie o prompt do usuário usando os critérios abaixo.

Critérios de avaliação:
${criteriaText}

${rubricText ? `Rubrica:\n${rubricText}` : ""}

Pontuação máxima: ${maxScore || 100}

Responda EXATAMENTE neste formato JSON (sem markdown):
{"score": <número>, "feedback": "<feedback em 1-2 frases, ação concreta, em português>"}

Seja justo mas exigente. Feedback deve ser acionável, nunca genérico.`,
        },
        { role: "user", content: `Prompt para avaliar: "${userPrompt}"` },
      ];
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use 'generate-result' or 'evaluate'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      throw new Error(`AI gateway error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    if (mode === "generate-result") {
      return new Response(
        JSON.stringify({ result: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse evaluation response
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*?"score"[\s\S]*?"feedback"[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({ score: parsed.score, feedback: parsed.feedback }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      // Fallback
    }

    return new Response(
      JSON.stringify({ score: 50, feedback: content.slice(0, 300) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[v8-evaluate-prompt] Error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
