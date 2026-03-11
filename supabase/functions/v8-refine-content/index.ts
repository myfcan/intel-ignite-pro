import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REFINE_SYSTEM_PROMPT = `Você é um editor didático especializado em educação sobre Inteligência Artificial para público brasileiro leigo.

Sua tarefa é refinar o texto de seções de aula, melhorando a FORMA sem alterar o CONTEÚDO conceitual.

REGRAS OBRIGATÓRIAS:

1. **Clareza**: O conteúdo deve ser didático e fácil de entender para qualquer pessoa, inclusive leigos completos.

2. **Vocabulário acessível**: Elimine gírias ambíguas, expressões com duplo sentido ou frases coloquiais que confundem. Exemplos:
   - "responde no seguro" → "responde de forma genérica e cautelosa"
   - "o que ele faz por trás" → "como ele funciona internamente"
   - "dar um tapa" em algo → "melhorar" ou "refinar"
   - "jogar no colo" → "entregar diretamente"
   - "meter a mão na massa" → "começar a praticar"

3. **Coerência narrativa**: Mantenha o fio condutor da história, garantindo que cada seção conecte logicamente com a anterior.

4. **Fluência**: Vocabulário natural, ritmo de leitura agradável, sem frases truncadas ou transições abruptas.

5. **Tom conversacional mas preciso**: Mantenha o tom amigável e acessível do original, mas sem sacrificar clareza.

6. **Preservar estrutura**: NÃO altere marcadores como [QUIZ], [PLAYGROUND], [EXERCISE:tipo], tags de emoção/prosódia como [excited], [pause], [warm], [laughs], [whispers], [calm], [encouraging], [thoughtful], títulos ##, nem a organização das seções. Copie-os EXATAMENTE como estão.

7. **Preservar intenção**: Melhore a FORMA, não mude o CONTEÚDO conceitual. Exemplos, metáforas e analogias devem ser mantidos ou melhorados, nunca removidos.

8. **Eliminar redundâncias**: Se uma seção repete a mesma ideia da anterior com outras palavras, condense.

9. **Brevidade**: Seções de narração devem ser objetivas — entre 100 e 300 palavras por seção (15-30s de áudio).

10. **Evitar jargão técnico não explicado**: Se um termo técnico é necessário (ex: "token", "modelo de linguagem"), deve ser explicado na primeira ocorrência.

11. **Transições explícitas**: Cada seção deve começar com uma frase que conecte ao que veio antes ("Agora que você entendeu X, vamos ver Y...").

12. **Exemplos concretos**: Se o texto fala de algo abstrato, deve ter pelo menos um exemplo do mundo real na mesma seção.

13. **Detecção de texto pré-quiz/playground**: Se a seção termina com uma frase que é literalmente a pergunta do quiz seguinte (como "Responde rápido pra mim: quando o GPT parece genérico..."), REMOVA essa frase redundante da seção, pois o quiz já vai narrá-la.

IMPORTANTE:
- NUNCA gere rótulos meta-narrativos como "Segmento vida real desta atividade:", "Atividade prática:" ou "Contexto real:".
- NUNCA use frases anti-pedagógicas como "Responda rapidamente" ou "Confie nos seus instintos".
- Retorne EXATAMENTE o mesmo número de seções recebidas.
- Cada seção deve manter o mesmo título (pode melhorar levemente se necessário).
- O conteúdo deve estar em Português Brasileiro (pt-BR).

CONGRUÊNCIA GRAMATICAL OBRIGATÓRIA:
- Todos os textos DEVEM ter concordância sujeito-verbo e gênero-número correta.
- ERRO CLÁSSICO: "Sou um casal" → CORRETO: "Somos um casal". Sujeito coletivo/plural exige verbo concordante.
- Outros erros proibidos: "Nós é" → "Nós somos", "A gente vamos" → "A gente vai", "Eu e minha esposa vai" → "Eu e minha esposa vamos".
- Revise CADA frase para garantir concordância antes de retornar.

14. **Sem caracteres não-latinos**: NUNCA insira caracteres de outros alfabetos (Devanagari, Cirílico, Árabe, CJK, Tailandês, Coreano). Todo o texto deve usar exclusivamente o alfabeto latino com acentos portugueses (á, é, í, ó, ú, ã, õ, ç, etc.). Se encontrar palavras em outros scripts no texto original, substitua pelo equivalente em português.`;

const REFINE_TOOLS = [
  {
    type: "function",
    function: {
      name: "refine_sections",
      description: "Return the refined sections with improved didactic quality. Must return exactly the same number of sections as input.",
      parameters: {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Section title (keep or slightly improve)" },
                content: { type: "string", description: "Refined section content in pt-BR" },
              },
              required: ["title", "content"],
            },
          },
        },
        required: ["sections"],
      },
    },
  },
];

// ElevenLabs v3 — COMPLETE official audio tags whitelist (from docs + blog 2026-03-06)
const ELEVENLABS_EMOTION_TAGS = new Set([
  'happy', 'sad', 'excited', 'angry', 'whisper', 'annoyed', 'appalled',
  'thoughtful', 'surprised', 'sarcastic', 'curious', 'crying', 'mischievously',
  'impressed', 'delighted', 'amazed', 'warmly', 'excitedly', 'curiously',
  'dramatically', 'happily', 'sorrowful',
  'calm', 'nervous', 'frustrated', 'serious', 'cheerful', 'empathetic',
  'assertive', 'dramatic tone', 'reflective', 'hopeful', 'energetic',
  'warm', 'encouraging',
  'laughs', 'laughing', 'chuckles', 'sighs', 'sigh', 'clears throat',
  'exhales', 'exhales sharply', 'inhales deeply', 'snorts', 'gulps',
  'swallows', 'gasps', 'wheezing', 'giggles', 'giggling', 'muttering',
  'stammers', 'whispers',
  'pause', 'short pause', 'long pause', 'rushed', 'slows down',
  'hesitates', 'drawn out', 'deliberate', 'rapid-fire', 'timidly',
  'emphasized', 'understated',
  'interrupting', 'overlapping', 'singing', 'sings', 'woo',
  'happy gasp', 'frustrated sigh', 'laughs softly', 'starts laughing',
  'with genuine belly laugh',
]);

function sanitizePedagogicalText(text: string): string {
  return text
    .replace(/(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi, '$1')
    .replace(/(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi, '$1')
    // Strip bracket tags EXCEPT ElevenLabs emotion tags and structural markers
    .replace(/\[([^\]]{1,40})\]/gi, (match, inner) => {
      const normalized = inner.toLowerCase().trim();
      // Preserve ElevenLabs emotion/prosody tags
      if (ELEVENLABS_EMOTION_TAGS.has(normalized)) return match;
      // Preserve structural markers (QUIZ, PLAYGROUND, EXERCISE:*)
      if (/^(quiz|playground|exercise:[a-z_-]+)$/i.test(inner.trim())) return match;
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sections } = await req.json();

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return new Response(JSON.stringify({ error: "sections[] is required and must be non-empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log(`[v8-refine-content] Refining ${sections.length} sections...`);

    // Build user prompt with all sections
    const sectionsText = sections.map((s: any, i: number) =>
      `### Seção ${i + 1}: ${s.title}\n${s.content}`
    ).join("\n\n---\n\n");

    const userPrompt = `Refine as ${sections.length} seções abaixo. Retorne EXATAMENTE ${sections.length} seções refinadas.

REGRAS ESTRITAS DE ORDENAÇÃO:
- Retorne as seções NA MESMA ORDEM em que foram recebidas.
- NÃO renomeie a primeira seção se ela se chamar "Abertura".
- NÃO funda, elimine ou reordene seções.
- A Seção 1 da entrada DEVE ser a Seção 1 da saída, e assim por diante.

${sectionsText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: REFINE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: REFINE_TOOLS,
        tool_choice: { type: "function", function: { name: "refine_sections" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[v8-refine-content] AI error: ${response.status}`, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a few seconds." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("[v8-refine-content] No tool call in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("AI did not return structured output");
    }

    const result = JSON.parse(toolCall.function.arguments);
    const refinedSections = result.sections || [];

    // Validate count matches
    if (refinedSections.length !== sections.length) {
      console.warn(`[v8-refine-content] Count mismatch: got ${refinedSections.length}, expected ${sections.length}. Padding/truncating.`);
      while (refinedSections.length < sections.length) {
        refinedSections.push(sections[refinedSections.length]);
      }
      refinedSections.length = sections.length;
    }

    // === Correção E: Validação de integridade — proteger Abertura ===
    const originalIsAbertura = sections[0]?.title?.toLowerCase().includes("abertura");
    const refinedIsAbertura = refinedSections[0]?.title?.toLowerCase().includes("abertura");
    if (originalIsAbertura && !refinedIsAbertura) {
      console.warn(`[v8-refine-content] AI displaced Abertura — restoring original Section 0`);
      refinedSections[0] = sections[0];
    }

    const sanitizedSections = refinedSections.map((s: any, i: number) => ({
      title: sanitizePedagogicalText(String(s?.title || sections[i]?.title || '')),
      content: sanitizePedagogicalText(String(s?.content || sections[i]?.content || '')),
    }));

    console.log(`[v8-refine-content] Successfully refined ${sanitizedSections.length} sections`);

    return new Response(JSON.stringify({ sections: sanitizedSections }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[v8-refine-content] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
