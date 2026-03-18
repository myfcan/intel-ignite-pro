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

    const { tool_name } = await req.json();

    if (!tool_name || tool_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "tool_name is required (min 2 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const systemPrompt = `Você é um especialista em design instrucional para aulas de tecnologia voltadas a renda extra digital.

TAREFA: Dado o nome de uma ferramenta digital, gere exatamente 5 sugestões de títulos de aulas práticas.

REGRAS:
- Formato do título: "Como [verbo no infinitivo] [resultado prático] com [ferramenta]"
- Cada aula deve ensinar algo monetizável (freelance, automação, criação de conteúdo, produtividade)
- Variar os verbos: criar, automatizar, vender, organizar, otimizar, monetizar, configurar, integrar
- Variar a dificuldade: 2 fáceis, 2 médias, 1 difícil
- description: 1 frase curta (max 15 palavras) sobre o que o aluno aprende
- difficulty: "fácil", "médio" ou "difícil"

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{ "suggestions": [
  { "title": "...", "description": "...", "difficulty": "fácil" },
  { "title": "...", "description": "...", "difficulty": "fácil" },
  { "title": "...", "description": "...", "difficulty": "médio" },
  { "title": "...", "description": "...", "difficulty": "médio" },
  { "title": "...", "description": "...", "difficulty": "difícil" }
]}`;

    const userMessage = `Ferramenta: ${tool_name.trim()}`;

    console.log("Suggesting topics for tool:", tool_name);

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

    if (!rawContent) {
      throw new Error("No content in AI response");
    }

    const cleaned = rawContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("v10-suggest-topics error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
