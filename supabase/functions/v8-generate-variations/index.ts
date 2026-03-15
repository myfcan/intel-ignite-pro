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

// Validate and pad a single variation's sections to exactly 9
function validateVariationSections(sections: any[], leverName: string): any[] {
  const result = [...sections];

  // Pad to 9 if needed
  while (result.length < 9) {
    result.push({
      title: `Seção ${result.length + 1}`,
      content: `[Seção placeholder — variação ${leverName} não gerou esta seção. Regere.]`,
    });
  }

  // Trim to 9
  result.length = 9;

  // Force section 0 to be "Abertura"
  if (result[0] && !result[0].title.toLowerCase().includes("abertura")) {
    result[0].title = "Abertura";
  }

  // Strip trailing questions from each section
  return result.map((s: any) => ({
    title: String(s.title || ""),
    content: String(s.content || "").replace(/\n[^\n]*\?\s*$/, "").trim(),
  }));
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
      ? `\n\nÂNCORAS OBRIGATÓRIAS (fatos imutáveis que devem aparecer em TODAS as variações):\n${anchors.map((a, i) => `A${i + 1}: ${a}`).join("\n")}`
      : "";

    const leverDescriptions = selectedLevers
      .map((l, i) => `Variação ${i + 1} — ${l.id} (${l.name}): ${l.instruction}`)
      .join("\n\n");

    const systemPrompt = `Você é um autor didático especializado em criar conteúdo educacional sobre Inteligência Artificial para público brasileiro leigo.

TAREFA: Gerar exatamente 3 LIÇÕES COMPLETAS, cada uma com EXATAMENTE 9 seções, baseadas no texto base abaixo. Cada lição aplica uma alavanca estilística diferente.

TEXTO BASE (referência de conteúdo e fatos — NUNCA altere os fatos):
"""
${baseText.trim()}
"""
${anchorBlock}

ALAVANCAS A APLICAR (uma por variação):
${leverDescriptions}

## ESTRUTURA OBRIGATÓRIA POR VARIAÇÃO (9 seções cada)

| Índice | Função |
|--------|--------|
| 0 | Abertura: boas-vindas + gancho + lista do que será aprendido |
| 1 | Explicação conceitual: o mecanismo central do tema |
| 2 | Contextualização: conectar teoria à prática com exemplo concreto |
| 3 | Aprofundamento: expandir o conceito com nuance ou caso de uso |
| 4 | Demonstração: mostrar o conceito em ação com antes/depois |
| 5 | Aplicação prática: como usar no dia a dia |
| 6 | Técnica avançada: dica de nível intermediário |
| 7 | Síntese: consolidar aprendizado com framework ou checklist |
| 8 | Encerramento: recapitular + motivar próximo passo |

## REGRAS DE FIDELIDADE (OBRIGATÓRIAS)

1. NÃO crie novos fatos. Não invente acidente, atraso, chuva, briga, obra, polícia, etc.
2. ${anchors.length > 0 ? "Mantenha as ÂNCORAS exatamente (conteúdo e causalidade) em cada variação." : "Sem âncoras obrigatórias nesta geração."}
3. Só pode variar: palavras, ordem de frases, ritmo, diálogo curto, detalhes sensoriais leves (sem novos fatos).
4. Cada variação deve usar APENAS 1 ALAVANCA de variação (indicada acima).
5. Se alguma âncora faltar ou mudar, você deve descartar e reescrever.

## REGRAS DE CONTEÚDO

1. **EXATAMENTE 9 seções por variação** — nem mais, nem menos.
2. **Seção 0 DEVE ter título "Abertura"** — obrigatório.
3. **Mínimo 100 palavras por seção** — seções curtas de 1-2 linhas são PROIBIDAS.
4. **Seção 0 (Abertura) deve ter mínimo 150 palavras** — deve ser rica e envolvente.
5. **NUNCA termine uma seção com uma pergunta interrogativa.**
6. **PROIBIDO criar frases que funcionem como enunciado de exercício.**
7. **Linguagem**: português brasileiro, tom acessível, sem jargão técnico desnecessário.
8. Use **negrito** para termos-chave (2-4 por seção).
9. Use > blockquotes para insights (1 por seção quando apropriado).
10. Cada variação deve ter título e descrição próprios.
11. **Sem emojis, sem tags de prosódia** como [excited], [pause].`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const anchorChecklistProperties: Record<string, any> = {};
    anchors.forEach((_, i) => {
      anchorChecklistProperties[`A${i + 1}`] = { type: "boolean", description: `Âncora A${i + 1} presente` };
    });

    const sectionSchema = {
      type: "object",
      properties: {
        title: { type: "string", description: "Título da seção. Seção 0 DEVE ser 'Abertura'" },
        content: { type: "string", description: "Conteúdo em markdown, mínimo 100 palavras (150+ para seção 0)" },
      },
      required: ["title", "content"],
      additionalProperties: false,
    };

    const variationSchema: any = {
      type: "object",
      properties: {
        lever: { type: "string", description: "ID da alavanca (ex: L1, L3, L5)" },
        leverName: { type: "string", description: "Nome da alavanca (ex: Diálogo, Humor)" },
        title: { type: "string", description: "Título da lição para esta variação" },
        description: { type: "string", description: "Descrição curta da lição (1-2 frases)" },
        sections: {
          type: "array",
          items: sectionSchema,
          minItems: 9,
          maxItems: 9,
          description: "Exatamente 9 seções da lição",
        },
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
      required: ["lever", "leverName", "title", "description", "sections", ...(anchors.length > 0 ? ["anchorChecklist"] : [])],
      additionalProperties: false,
    };

    const toolParams = {
      type: "object",
      properties: {
        variations: {
          type: "array",
          items: variationSchema,
          minItems: 3,
          maxItems: 3,
        },
      },
      required: ["variations"],
      additionalProperties: false,
    };

    console.log(`[v8-generate-variations] Generating 3 full lessons (9 sections each), levers: ${selectedLevers.map(l => l.id).join(",")}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Gere as 3 lições completas agora, cada uma com 9 seções." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_variations",
              description: "Retorna exatamente 3 lições completas (9 seções cada), cada uma aplicando uma alavanca estilística diferente ao texto base.",
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos no workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("[v8-generate-variations] AI Gateway error:", response.status, errText);
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
        title: `[Variação ${padLever.name} não gerada]`,
        description: "Tente novamente.",
        sections: Array.from({ length: 9 }, (_, i) => ({
          title: i === 0 ? "Abertura" : `Seção ${i + 1}`,
          content: `[Placeholder — variação ${padLever.name} não gerou esta seção]`,
        })),
        ...(anchors.length > 0 ? { anchorChecklist: Object.fromEntries(anchors.map((_, i) => [`A${i + 1}`, false])) } : {}),
      });
    }

    // Trim to 3 and validate each variation
    variations = variations.slice(0, 3).map((v: any, i: number) => {
      const validatedSections = validateVariationSections(v.sections || [], selectedLevers[i].name);

      // Log word counts per variation
      const wordCounts = validatedSections.map((s: any) => (s.content || "").split(/\s+/).filter(Boolean).length);
      const totalWords = wordCounts.reduce((a: number, b: number) => a + b, 0);
      console.log(`[v8-generate-variations] Variation ${i} (${selectedLevers[i].id}): ${totalWords} words, sections: [${wordCounts.join(",")}]`);

      return {
        lever: selectedLevers[i].id,
        leverName: selectedLevers[i].name,
        title: v.title || `Variação ${selectedLevers[i].name}`,
        description: v.description || "",
        sections: validatedSections,
        ...(v.anchorChecklist ? { anchorChecklist: v.anchorChecklist } : {}),
      };
    });

    console.log(`[v8-generate-variations] Success: 3 variations generated`);

    return new Response(JSON.stringify({ variations, leversUsed: selectedLevers.map((l) => l.id) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[v8-generate-variations] error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
