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

const SYSTEM_PROMPT = `Você é um autor didático especializado em criar conteúdo educacional sobre Inteligência Artificial para público brasileiro leigo.

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

const GENERATE_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_lesson_sections",
      description: "Return exactly 9 lesson sections with title and content in pt-BR. Section 0 must have title 'Abertura'. Each section must have at least 100 words (150+ for section 0).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Lesson title" },
          description: { type: "string", description: "Short lesson description (1-2 sentences)" },
          sections: {
            type: "array",
            minItems: 9,
            maxItems: 9,
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, objectives, variationStyle } = await req.json();

    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ error: "title is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const variation = variationStyle || "everyday";
    const variationPrompt = VARIATION_PROMPTS[variation] || VARIATION_PROMPTS.everyday;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log(`[v8-generate-raw-content] Generating for "${title}", variation="${variation}"`);

    const objectivesList = Array.isArray(objectives) && objectives.length > 0
      ? `\n\nOBJETIVOS DA AULA:\n${objectives.map((o: string, i: number) => `${i + 1}. ${o}`).join("\n")}`
      : "";

    const systemPrompt = SYSTEM_PROMPT.replace("{VARIATION_PROMPT}", variationPrompt);

    const userPrompt = `Gere o conteúdo bruto completo para a seguinte aula:

TÍTULO: ${title}${objectivesList}

Lembre-se: EXATAMENTE 9 seções, Section 0 com título "Abertura", mínimo 100 palavras por seção (150+ na Abertura). NUNCA termine seções com perguntas.`;

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
        tools: GENERATE_TOOLS,
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

    // Validation: must have exactly 9 sections
    if (sections.length !== 9) {
      console.warn(`[v8-generate-raw-content] Got ${sections.length} sections, expected 9. Padding/truncating.`);
      while (sections.length < 9) {
        sections.push({
          title: `Seção ${sections.length + 1}`,
          content: "Conteúdo pendente — seção gerada como placeholder pelo pipeline.",
        });
      }
      sections.length = 9;
    }

    // Validation: Section 0 must be "Abertura"
    if (sections[0] && !sections[0].title.toLowerCase().includes("abertura")) {
      console.warn(`[v8-generate-raw-content] Section 0 is "${sections[0].title}", forcing "Abertura"`);
      sections[0].title = "Abertura";
    }

    // Validation: minimum word count
    sections.forEach((s: any, i: number) => {
      const wordCount = (s.content || "").split(/\s+/).filter(Boolean).length;
      const minWords = i === 0 ? 150 : 100;
      if (wordCount < minWords) {
        console.warn(`[v8-generate-raw-content] Section ${i} has ${wordCount} words (min ${minWords})`);
      }
    });

    // Strip trailing questions from sections (safety net)
    const sanitizedSections = sections.map((s: any) => ({
      title: String(s.title || ""),
      content: String(s.content || "").replace(/\n[^\n]*\?\s*$/, "").trim(),
    }));

    console.log(`[v8-generate-raw-content] Generated ${sanitizedSections.length} sections for "${result.title || title}"`);

    return new Response(JSON.stringify({
      title: result.title || title,
      description: result.description || "",
      sections: sanitizedSections,
      variationStyle: variation,
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
