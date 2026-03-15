import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Alavancas (L1-L6) ───
const LEVERS = [
  { id: "L1", name: "Diálogo", instruction: "Reescreva usando diálogo entre duas pessoas reais. Inclua falas curtas, reações e uma conclusão que sintetize a lição." },
  { id: "L2", name: "Visual", instruction: "Reescreva usando descrições visuais vívidas. Pinte cenas, cores, ambientes e sensações sensoriais que ilustrem o conceito." },
  { id: "L3", name: "Humor", instruction: "Reescreva com humor inteligente. Use analogias engraçadas, exageros controlados e um tom leve que facilite a memorização." },
  { id: "L4", name: "Direto", instruction: "Reescreva de forma ultra-direta. Frases curtas, imperativas, sem rodeios. Estilo manual de campo: faça X, depois Y, resultado Z." },
  { id: "L5", name: "Reflexão", instruction: "Reescreva provocando reflexão. Comece com uma pergunta incômoda, desenvolva com uma descoberta contra-intuitiva e termine com um insight prático." },
  { id: "L6", name: "Cinematográfico", instruction: "Reescreva como uma cena de filme. Crie tensão narrativa, um protagonista com um problema real e uma resolução que ensine o conceito." },
];

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Basic anchor sanitization
function sanitizeAnchors(anchors: string[]): string[] {
  return anchors
    .map((a) => a.replace(/^(SYSTEM|IGNORE|---).*/gi, "").trim())
    .filter((a) => a.length > 0 && a.length < 200);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseText, anchors: rawAnchors } = await req.json();

    if (!baseText || typeof baseText !== "string" || baseText.trim().length < 20) {
      return new Response(JSON.stringify({ error: "baseText é obrigatório (mín. 20 caracteres)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anchors = sanitizeAnchors(Array.isArray(rawAnchors) ? rawAnchors : []);
    const selectedLevers = shuffle(LEVERS).slice(0, 3);

    const anchorBlock = anchors.length > 0
      ? `\n\nÂNCORAS OBRIGATÓRIAS (devem aparecer em TODAS as variações):\n${anchors.map((a, i) => `A${i + 1}: ${a}`).join("\n")}`
      : "";

    const leverDescriptions = selectedLevers
      .map((l, i) => `Variação ${i + 1} — ${l.id} (${l.name}): ${l.instruction}`)
      .join("\n\n");

    const systemPrompt = `Você é um redator pedagógico especialista em educação sobre I.A. para leigos brasileiros.

TAREFA: Gerar exatamente 3 variações estilísticas do texto base abaixo, cada uma aplicando uma alavanca narrativa diferente.

TEXTO BASE:
"""
${baseText.trim()}
"""
${anchorBlock}

ALAVANCAS A APLICAR:
${leverDescriptions}

REGRAS:
1. Cada variação DEVE manter o mesmo significado e informação do texto base
2. Cada variação DEVE ter entre 3-8 linhas
3. ${anchors.length > 0 ? "Todas as âncoras devem aparecer (adaptadas ao estilo) em cada variação" : "Sem âncoras obrigatórias nesta geração"}
4. Linguagem: português brasileiro, tom acessível, sem jargão técnico desnecessário
5. NÃO adicione títulos, headers ou formatação markdown — apenas o texto narrativo`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const anchorChecklistProperties: Record<string, any> = {};
    anchors.forEach((_, i) => {
      anchorChecklistProperties[`A${i + 1}`] = { type: "boolean", description: `Âncora A${i + 1} presente` };
    });

    const toolParams: any = {
      type: "object",
      properties: {
        variations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lever: { type: "string", description: "ID da alavanca (ex: L1, L3, L5)" },
              leverName: { type: "string", description: "Nome da alavanca (ex: Diálogo, Humor)" },
              text: { type: "string", description: "Texto da variação (3-8 linhas)" },
              ...(anchors.length > 0
                ? {
                    anchorChecklist: {
                      type: "object",
                      properties: anchorChecklistProperties,
                      required: anchors.map((_, i) => `A${i + 1}`),
                      additionalProperties: false,
                    },
                  }
                : {}),
            },
            required: ["lever", "leverName", "text", ...(anchors.length > 0 ? ["anchorChecklist"] : [])],
            additionalProperties: false,
          },
          minItems: 3,
          maxItems: 3,
        },
      },
      required: ["variations"],
      additionalProperties: false,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Gere as 3 variações agora." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_variations",
              description: "Retorna exatamente 3 variações estilísticas do texto base.",
              parameters: toolParams,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_variations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI não retornou tool call válido");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    let variations = parsed.variations || [];

    // Defensive padding: ensure exactly 3 variations
    while (variations.length < 3) {
      const padLever = selectedLevers[variations.length] || selectedLevers[0];
      variations.push({
        lever: padLever.id,
        leverName: padLever.name,
        text: `[Variação não gerada — tente novamente]`,
        ...(anchors.length > 0 ? { anchorChecklist: Object.fromEntries(anchors.map((_, i) => [`A${i + 1}`, false])) } : {}),
      });
    }

    // Trim to 3
    variations = variations.slice(0, 3);

    // Attach lever metadata from our selection (don't trust AI labels)
    variations = variations.map((v: any, i: number) => ({
      ...v,
      lever: selectedLevers[i].id,
      leverName: selectedLevers[i].name,
    }));

    return new Response(JSON.stringify({ variations, leversUsed: selectedLevers.map((l) => l.id) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("v8-generate-variations error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
