import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VARIATION_PROMPTS: Record<string, string> = {
  everyday: `ARCO NARRATIVO: COTIDIANO
Abra cada seção com situações do dia a dia que qualquer pessoa reconhece.
Exemplos de aberturas:
- "Imagine que você está pedindo um café..."
- "Sabe quando você manda uma mensagem para um amigo e ele entende tudo errado?"
- "Pense naquela última vez que você tentou explicar algo para alguém..."
Use analogias com cozinha, transporte, compras, conversas familiares.
Tom: amigável, próximo, como um amigo explicando.`,

  professional: `ARCO NARRATIVO: PROFISSIONAL
Abra cada seção com cenários de trabalho e produtividade.
Exemplos de aberturas:
- "Imagine que seu chefe pediu um relatório para ontem..."
- "Você precisa criar uma apresentação em 30 minutos..."
- "Um cliente acabou de enviar um e-mail confuso e você precisa responder..."
Use analogias com reuniões, e-mails, planilhas, atendimento ao cliente.
Tom: objetivo, prático, focado em resultado.`,

  curiosity: `ARCO NARRATIVO: CURIOSIDADE TÉCNICA
Abra cada seção revelando como a tecnologia funciona "por dentro".
Exemplos de aberturas:
- "Você sabia que quando digita uma pergunta, a IA não 'pensa' como nós?"
- "Por trás de cada resposta existe um processo fascinante..."
- "A maioria das pessoas não faz ideia de que..."
Use analogias com engenharia, ciência, bastidores de tecnologia.
Tom: revelador, instigante, como um documentário.`,
};

// ─── STANDARD PROMPT (9 seções) ───
const SYSTEM_PROMPT_STANDARD = `Você é um autor didático especializado em criar conteúdo educacional sobre Inteligência Artificial para público brasileiro leigo.

Sua tarefa é gerar o conteúdo bruto de uma aula com EXATAMENTE 9 seções, seguindo a estrutura pedagógica abaixo.

## ESTRUTURA OBRIGATÓRIA (9 seções)

| Índice | Função | Interação após |
|--------|--------|---------------|
| 0 | Abertura: boas-vindas + gancho + lista do que será aprendido | Nenhuma |
| 1 | Explicação conceitual: o mecanismo central do tema | Nenhuma |
| 2 | Contextualização: conectar teoria à prática com exemplo concreto | ✅ Exercício (multiple-choice ou true-false) |
| 3 | Aprofundamento: expandir o conceito com nuance ou caso de uso | ✅ Exercício (fill-in-blanks ou scenario-selection) |
| 4 | Demonstração: mostrar o conceito em ação com antes/depois | ✅ Exercício (platform-match ou flipcard-quiz) |
| 5 | Aplicação prática: como usar no dia a dia | Nenhuma |
| 6 | Técnica avançada: dica de nível intermediário | ✅ Exercício (multiple-choice ou true-false) |
| 7 | Síntese: consolidar aprendizado com framework ou checklist | ✅ Exercício (complete-sentence) |
| 8 | Encerramento: recapitular + motivar próximo passo | Nenhuma |

## REGRAS OBRIGATÓRIAS

1. **EXATAMENTE 9 seções** — nem mais, nem menos.
2. **Seção 0 DEVE ter título "Abertura"** — isso é obrigatório para o pipeline.
3. **Mínimo 100 palavras por seção** — seções curtas de 1-2 linhas são PROIBIDAS.
4. **Seção 0 (Abertura) deve ter mínimo 150 palavras** — deve ser rica e envolvente.
5. **NUNCA termine uma seção com uma pergunta interrogativa** — seções devem terminar com afirmações, insights ou transições declarativas.
6. **PROIBIDO criar frases que funcionem como enunciado de exercício** — ex: "Teste rápido:", "Vamos testar:", "Qual dos seguintes...", "Responda:". Exercícios são gerados separadamente pelo pipeline.
7. **PROIBIDO usar transições genéricas repetitivas** — ex: "Agora vamos ver", "Vamos aplicar", "Na prática". Cada transição deve ser única e contextual.
8. **Conteúdo em Português Brasileiro (pt-BR)**.
9. **Use formatação Markdown**:
   - **Negrito** para termos-chave (2-4 por seção)
   - > Blockquotes para insights ou reflexões (1 por seção quando apropriado)
   - Listas com bullet points para enumerações (3+ itens)
   - *Itálico* para exemplos práticos ou analogias
10. **Sem caracteres não-latinos** — apenas alfabeto latino com acentos portugueses.
11. **Sem emojis no corpo** do texto.
12. **Sem tags de prosódia** como [excited], [pause], [warm].
13. **Concordância gramatical obrigatória** — revisar sujeito-verbo e gênero-número.
14. **Cada seção deve ser autocontida** — um leitor deve entender a seção mesmo lendo isoladamente, mas deve haver fio condutor narrativo.

## VARIAÇÃO NARRATIVA ATIVA
{VARIATION_PROMPT}

Gere conteúdo ORIGINAL e DIVERSO. NÃO copie exemplos do prompt. Cada aula gerada deve ter analogias, exemplos e aberturas DIFERENTES.`;

// ─── COMPACT PROMPT (7 seções — V8-B*) ───
const SYSTEM_PROMPT_COMPACT = `Você é um autor didático com estilo CONVERSACIONAL e DIRETO, especializado em criar conteúdo educacional sobre Inteligência Artificial para público brasileiro leigo.

Sua tarefa é gerar o conteúdo bruto de uma aula COMPACTA com EXATAMENTE 7 seções, seguindo a estrutura pedagógica abaixo.

## ESTRUTURA OBRIGATÓRIA (7 seções)

| Índice | Função | Interação após |
|--------|--------|---------------|
| 0 | Abertura: gancho provocativo + o que o aluno vai dominar | Nenhuma |
| 1 | Conceito-chave: o mecanismo central, direto ao ponto | Nenhuma |
| 2 | Contraste prático: exemplo real mostrando certo vs errado | ✅ Exercício |
| 3 | Aprofundamento denso: nuance ou técnica intermediária com exemplo | ✅ Exercício |
| 4 | Aplicação imediata: "faça isso agora" com resultado tangível | ✅ Exercício |
| 5 | Síntese: framework/checklist de bolso + Coursiv | ✅ Coursiv |
| 6 | Encerramento: insight final + provocação para a próxima aula | ✅ Playground |

## TOM OBRIGATÓRIO: CONVERSACIONAL-DIRETO

- Fale como se estivesse numa conversa 1-a-1 com o aluno.
- Frases curtas e ritmadas. Parágrafos de 2-3 frases no máximo.
- Use provocações: "E se eu te dissesse que...", "A maioria erra aqui...", "Parece óbvio, mas..."
- Use contrastes: "Antes era X. Agora é Y."
- Proibido tom acadêmico ou formal. Proibido parágrafos longos.
- Cada seção deve ser DENSA: muita informação em pouco espaço.

## REGRAS OBRIGATÓRIAS

1. **EXATAMENTE 7 seções** — nem mais, nem menos.
2. **Seção 0 DEVE ter título "Abertura"** — isso é obrigatório para o pipeline.
3. **Mínimo 100 palavras por seção** — seções curtas de 1-2 linhas são PROIBIDAS.
4. **Seção 0 (Abertura) deve ter mínimo 120 palavras** — envolvente mas compacta.
5. **NUNCA termine uma seção com uma pergunta interrogativa.**
6. **PROIBIDO criar frases que funcionem como enunciado de exercício.**
7. **PROIBIDO usar transições genéricas repetitivas.**
8. **Conteúdo em Português Brasileiro (pt-BR)**.
9. **Use formatação Markdown**: **negrito** para termos-chave, > blockquotes para insights, listas com bullets, *itálico* para exemplos.
10. **Sem emojis, sem tags de prosódia, sem caracteres não-latinos.**
11. **Concordância gramatical obrigatória.**
12. **Cada seção deve ser autocontida** mas com fio condutor narrativo.

## VARIAÇÃO NARRATIVA ATIVA
{VARIATION_PROMPT}

Gere conteúdo ORIGINAL e DIVERSO. NÃO copie exemplos do prompt.`;

// ─── Tool schemas ───
function buildGenerateTools(sectionCount: number) {
  return [
    {
      type: "function",
      function: {
        name: "generate_lesson_sections",
        description: `Return exactly ${sectionCount} lesson sections with title and content in pt-BR. Section 0 must have title 'Abertura'. Each section must have at least 100 words (150+ for section 0).`,
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Lesson title" },
            description: { type: "string", description: "Short lesson description (1-2 sentences)" },
            sections: {
              type: "array",
              minItems: sectionCount,
              maxItems: sectionCount,
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Section title. Section 0 MUST be 'Abertura'" },
                  content: { type: "string", description: "Section content in markdown, minimum 100 words (150+ for section 0)" },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["title", "description", "sections"],
        },
      },
    },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, objectives, variationStyle, structureVariant } = await req.json();

    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ error: "title is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isCompact = structureVariant === "compact";
    const targetSections = isCompact ? 7 : 9;
    const variation = variationStyle || "everyday";
    const variationPrompt = VARIATION_PROMPTS[variation] || VARIATION_PROMPTS.everyday;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log(`[v8-generate-raw-content] Generating for "${title}", variation="${variation}", structure="${isCompact ? 'compact' : 'standard'}" (${targetSections} sections)`);

    const objectivesList = Array.isArray(objectives) && objectives.length > 0
      ? `\n\nOBJETIVOS DA AULA:\n${objectives.map((o: string, i: number) => `${i + 1}. ${o}`).join("\n")}`
      : "";

    const basePrompt = isCompact ? SYSTEM_PROMPT_COMPACT : SYSTEM_PROMPT_STANDARD;
    const systemPrompt = basePrompt.replace("{VARIATION_PROMPT}", variationPrompt);

    const userPrompt = `Gere o conteúdo bruto completo para a seguinte aula:

TÍTULO: ${title}${objectivesList}

Lembre-se: EXATAMENTE ${targetSections} seções, Section 0 com título "Abertura", mínimo 100 palavras por seção (${isCompact ? '120' : '150'}+ na Abertura). NUNCA termine seções com perguntas.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: buildGenerateTools(targetSections),
        tool_choice: { type: "function", function: { name: "generate_lesson_sections" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[v8-generate-raw-content] AI error: ${response.status}`, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a few seconds." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("[v8-generate-raw-content] No tool call in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("AI did not return structured output");
    }

    const result = JSON.parse(toolCall.function.arguments);
    const sections = result.sections || [];

    // Validation: must have exactly targetSections sections
    if (sections.length !== targetSections) {
      console.warn(`[v8-generate-raw-content] Got ${sections.length} sections, expected ${targetSections}. Padding/truncating.`);
      while (sections.length < targetSections) {
        sections.push({
          title: `Seção ${sections.length + 1}`,
          content: "Conteúdo pendente — seção gerada como placeholder pelo pipeline.",
        });
      }
      sections.length = targetSections;
    }

    // Validation: Section 0 must be "Abertura"
    if (sections[0] && !sections[0].title.toLowerCase().includes("abertura")) {
      console.warn(`[v8-generate-raw-content] Section 0 is "${sections[0].title}", forcing "Abertura"`);
      sections[0].title = "Abertura";
    }

    // Validation: minimum word count
    sections.forEach((s: any, i: number) => {
      const wordCount = (s.content || "").split(/\s+/).filter(Boolean).length;
      const minWords = i === 0 ? (isCompact ? 120 : 150) : 100;
      if (wordCount < minWords) {
        console.warn(`[v8-generate-raw-content] Section ${i} has ${wordCount} words (min ${minWords})`);
      }
    });

    // Strip trailing questions from sections (safety net)
    const sanitizedSections = sections.map((s: any) => ({
      title: String(s.title || ""),
      content: String(s.content || "").replace(/\n[^\n]*\?\s*$/, "").trim(),
    }));

    console.log(`[v8-generate-raw-content] Generated ${sanitizedSections.length} sections for "${result.title || title}" (${isCompact ? 'compact' : 'standard'})`);

    return new Response(JSON.stringify({
      title: result.title || title,
      description: result.description || "",
      sections: sanitizedSections,
      variationStyle: variation,
      structureVariant: isCompact ? "compact" : "standard",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[v8-generate-raw-content] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
