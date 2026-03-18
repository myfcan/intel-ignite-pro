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

    // 1. Query Refero for real screen data
    let referoContext = "";
    let referoScreenCount = 0;

    try {
      const { searchScreens } = await import("../_shared/refero.ts");
      const screensResult = await searchScreens(title.trim(), 5);
      referoScreenCount = screensResult.total;

      if (referoScreenCount > 0) {
        const screenNames = screensResult.screens
          .map((s: any) => s.screen_name || s.app_name || "screen")
          .join(", ");
        referoContext = `\n\nDADOS DO REFERO (banco real de 126.000+ telas):
- Telas encontradas para "${title}": ${referoScreenCount}
${screensResult.screens.length > 0 ? `- Exemplos: ${screenNames}` : ""}
USE esses dados reais para calibrar o score_refero.`;
      } else {
        referoContext = `\n\nDADOS DO REFERO: Nenhuma tela encontrada para "${title}". score_refero provavelmente 10-40.`;
      }
    } catch (err) {
      console.warn("Refero query failed (non-fatal):", err);
      referoContext = "\n\nDADOS DO REFERO: Consulta indisponível.";
    }

    // 2. Call AI for scoring (same prompt as v10-score-bpa)
    const systemPrompt = `Você é um especialista sênior em design instrucional para aulas de tecnologia.

TAREFA: Analise o tema proposto e retorne um JSON com 5 scores (0-100 cada):

1. **score_refero** (0-100): Disponibilidade de screenshots/referências visuais
2. **score_docs** (0-100): Qualidade da documentação oficial
3. **score_pedagogy** (0-100): Valor pedagógico para renda extra
4. **score_difficulty** (0-100): Facilidade de ensino (fácil = mais pontos)
5. **score_relevance** (0-100): Relevância mercado 2024-2025

REGRAS:
- Avalie pelo TEMA em si, não penalize por falta de notas
- Retorne APENAS JSON puro: { "score_refero": N, "score_docs": N, "score_pedagogy": N, "score_difficulty": N, "score_relevance": N, "justificativa": { "refero": "...", "docs": "...", "pedagogy": "...", "difficulty": "...", "relevance": "..." } }`;

    const userMessage = `Tema: ${title.trim()}
${tool_name ? `Ferramenta: ${tool_name.trim()}` : ""}${referoContext}`;

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

    // 3. Calculate weighted average
    const score_total = Math.round(
      (scores.score_refero ?? 0) * 0.2 +
      (scores.score_docs ?? 0) * 0.25 +
      (scores.score_pedagogy ?? 0) * 0.25 +
      (scores.score_difficulty ?? 0) * 0.15 +
      (scores.score_relevance ?? 0) * 0.15
    );

    const score_semaphore =
      score_total >= 70 ? "green" : score_total >= 40 ? "yellow" : "red";

    return new Response(
      JSON.stringify({
        score_total,
        score_semaphore,
        score_refero: scores.score_refero,
        score_docs: scores.score_docs,
        score_pedagogy: scores.score_pedagogy,
        score_difficulty: scores.score_difficulty,
        score_relevance: scores.score_relevance,
        refero_screens: referoScreenCount,
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
