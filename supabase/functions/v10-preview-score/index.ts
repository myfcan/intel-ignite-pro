import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const { title, tool_name } = await req.json();

    if (!title || title.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "title is required (min 3 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // 1. Call AI for scoring (4 dimensions — Refero removed: requires OAuth browser flow incompatible with server-side)
    const systemPrompt = `Você é um especialista sênior em design instrucional para aulas de tecnologia.

TAREFA: Analise o tema proposto e retorne um JSON com 4 scores (0-100 cada):

1. **score_docs** (0-100): Qualidade da documentação oficial e recursos de aprendizado
2. **score_pedagogy** (0-100): Valor pedagógico e aplicabilidade prática para renda extra
3. **score_difficulty** (0-100): Facilidade de ensino (fácil = mais pontos)
4. **score_relevance** (0-100): Relevância mercado 2024-2025

REGRAS:
- Avalie pelo TEMA em si, não penalize por falta de notas
- Retorne APENAS JSON puro: { "score_docs": N, "score_pedagogy": N, "score_difficulty": N, "score_relevance": N, "justificativa": { "docs": "...", "pedagogy": "...", "difficulty": "...", "relevance": "..." } }`;

    const userMessage = `Tema: ${title.trim()}
${tool_name ? `Ferramenta: ${tool_name.trim()}` : ""}`;

    console.log("Preview score for:", title);

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) throw new Error("No content in AI response");

    const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const scores = JSON.parse(cleaned);

    // 3. Calculate weighted average (4 dimensions, no Refero)
    // Weights: Docs 30%, Pedagogy 30%, Difficulty 20%, Relevance 20%
    const score_total = Math.round(
      (scores.score_docs ?? 0) * 0.30 +
      (scores.score_pedagogy ?? 0) * 0.30 +
      (scores.score_difficulty ?? 0) * 0.20 +
      (scores.score_relevance ?? 0) * 0.20
    );

    const score_semaphore =
      score_total >= 70 ? "green" : score_total >= 40 ? "yellow" : "red";

    return new Response(
      JSON.stringify({
        score_total,
        score_semaphore,
        score_docs: scores.score_docs,
        score_pedagogy: scores.score_pedagogy,
        score_difficulty: scores.score_difficulty,
        score_relevance: scores.score_relevance,
        justificativa: scores.justificativa,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("v10-preview-score error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
