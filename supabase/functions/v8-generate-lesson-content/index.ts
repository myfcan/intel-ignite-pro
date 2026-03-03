import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Phase 1 (Gap 1): Encoding sanitization for AI-generated Portuguese text ───
function sanitizeEncoding(text: string): string {
  if (!text || typeof text !== 'string') return text;
  const fixes: [RegExp, string][] = [
    [/\bn o\b/gi, "não é"], [/\bausncia\b/gi, "ausência"], [/\bespecfico\b/gi, "específico"],
    [/\binformaes\b/gi, "informações"], [/\bdefinio\b/gi, "definição"], [/\bcompreenso\b/gi, "compreensão"],
    [/\bprtico\b/gi, "prático"], [/\bexplicao\b/gi, "explicação"], [/\bcontedo\b/gi, "conteúdo"],
    [/\bpossvel\b/gi, "possível"], [/\binteligncia\b/gi, "inteligência"], [/\bexperincia\b/gi, "experiência"],
    [/\bverdadeiro\b/gi, "verdadeiro"], [/\binterao\b/gi, "interação"],
    [/(?<!\w)til(?=\s|[.,;:!?]|$)/gi, "útil"],
  ];
  let r = text;
  for (const [p, rep] of fixes) { r = r.replace(p, rep); }
  r = r.replace(/\s{2,}/g, ' ').trim();
  if (r !== text) console.warn(`[sanitizeEncoding] Fixed: "${text.slice(0, 60)}..."`);
  return r;
}

function sanitizeFields(obj: any, fields: string[]): any {
  const r = { ...obj };
  for (const f of fields) {
    if (typeof r[f] === 'string') r[f] = sanitizeEncoding(r[f]);
  }
  return r;
}

// ─── Exercise type schemas for tool calling ───
const EXERCISE_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_exercises",
      description: "Generate 2-4 final exercises for the lesson, choosing the best types based on content context. Vary types - don't repeat. Prioritize interactive types (drag-drop, flipcard, platform-match) over text-only.",
      parameters: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["drag-drop", "fill-in-blanks", "scenario-selection", "true-false", "platform-match", "data-collection", "complete-sentence", "multiple-choice", "flipcard-quiz", "timed-quiz"],
                },
                title: { type: "string" },
                instruction: { type: "string" },
                data: {
                  type: "object",
                  description: "Exercise-specific data. MUST contain the required fields for the chosen type. true-false requires 'statements' array. drag-drop requires 'items' and 'categories' arrays. flipcard-quiz requires 'cards' array. timed-quiz requires 'questions' array. multiple-choice requires 'question' string and 'options' array. fill-in-blanks/complete-sentence requires 'sentences' array. scenario-selection requires 'scenarios' array. platform-match requires 'scenarios' and 'platforms' arrays. data-collection requires 'scenario' object. An EMPTY data object {} is INVALID and will be rejected.",
                },
              },
              required: ["type", "title", "instruction", "data"],
            },
          },
        },
        required: ["exercises"],
      },
    },
  },
];

const QUIZ_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_inline_quizzes",
      description: "Generate inline quizzes for sections that lack interactions. Each quiz tests comprehension of the section content. Vary quiz types — do NOT repeat the same type consecutively.",
      parameters: {
        type: "object",
        properties: {
          quizzes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                afterSectionIndex: { type: "number", description: "0-based index of the section this quiz follows" },
                quizType: { type: "string", enum: ["multiple-choice", "true-false", "fill-blank"], description: "Type of quiz. Vary types across the lesson." },
                question: { type: "string", description: "Context question or prompt for the quiz" },
                explanation: { type: "string" },
                reinforcement: { type: "string" },
                // multiple-choice fields
                options: {
                  type: "array",
                  minItems: 3,
                  maxItems: 4,
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      isCorrect: { type: "boolean" },
                    },
                    required: ["text", "isCorrect"],
                  },
                  description: "Required for multiple-choice. Omit for other types.",
                },
                // true-false fields
                statement: { type: "string", description: "Statement to judge as true or false. Required for true-false." },
                isTrue: { type: "boolean", description: "Whether the statement is true. Required for true-false." },
                // fill-blank fields
                sentenceWithBlank: { type: "string", description: "Sentence with _______ as placeholder. Required for fill-blank." },
                correctAnswer: { type: "string", description: "The correct word/phrase. Required for fill-blank." },
                acceptableAnswers: { type: "array", items: { type: "string" }, description: "Alternative accepted answers for fill-blank." },
                // Phase 7 (Gap 5): chip options for fill-blank
                chipOptions: { type: "array", items: { type: "string" }, description: "4-6 chip options for fill-blank (correct + distractors). Required for fill-blank." },
              },
              required: ["afterSectionIndex", "quizType", "question", "explanation"],
            },
          },
        },
        required: ["quizzes"],
      },
    },
  },
];

const PLAYGROUND_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_inline_playgrounds",
      description: "Generate inline playgrounds for sections where practical prompt exercise makes sense. Compare amateur vs professional prompts.",
      parameters: {
        type: "object",
        properties: {
          playgrounds: {
            type: "array",
            items: {
              type: "object",
              properties: {
                afterSectionIndex: { type: "number" },
                title: { type: "string" },
                instruction: { type: "string", minLength: 40 },
                amateurPrompt: { type: "string" },
                professionalPrompt: { type: "string" },
                successMessage: { type: "string" },
                tryAgainMessage: { type: "string" },
                amateurResult: { type: "string", description: "Short, vague, weak result from the amateur prompt — MAX 2 lines" },
                professionalResult: { type: "string", description: "Detailed, specific, strong result from the professional prompt — 3-5 lines" },
                userChallenge: {
                  type: "object",
                  properties: {
                    instruction: { type: "string" },
                    challengePrompt: { type: "string" },
                    hints: { type: "array", items: { type: "string" }, maxItems: 3 },
                    evaluationCriteria: { type: "array", items: { type: "string" } },
                  },
                  required: ["instruction", "challengePrompt", "hints", "evaluationCriteria"],
                },
              },
              required: ["afterSectionIndex", "title", "instruction", "amateurPrompt", "professionalPrompt", "amateurResult", "professionalResult", "successMessage", "tryAgainMessage"],
            },
          },
        },
        required: ["playgrounds"],
      },
    },
  },
];

// ─── System prompt for exercise selection ───
const EXERCISE_SYSTEM_PROMPT = `Você é um designer instrucional especializado em educação sobre Inteligência Artificial e renda extra.

Sua tarefa é analisar o conteúdo das seções de uma aula e gerar exercícios finais que testem o conhecimento de forma interativa.

REGRAS:
1. Gere entre 2 e 4 exercícios
2. VARIE os tipos — não repita o mesmo tipo
3. Priorize tipos interativos (drag-drop, flipcard-quiz, platform-match, timed-quiz) sobre texto puro (multiple-choice)
4. O conteúdo deve ser em Português Brasileiro (pt-BR)
5. Cada exercício deve testar conhecimento real da aula, não perguntas genéricas

MAPEAMENTO CONTEXTO → TIPO:
- Categorias, classificações → drag-drop
- Plataformas, ferramentas para combinar → platform-match
- Afirmações para validar → true-false
- Conceitos-chave para memorizar → flipcard-quiz
- Definições com lacunas → fill-in-blanks ou complete-sentence
- Cenários de decisão → scenario-selection
- Dados para analisar → data-collection
- Perguntas diretas → multiple-choice
- Revisão rápida com pressão → timed-quiz

SCHEMAS POR TIPO:

drag-drop: { items: [{ id, text, category }], categories: [{ id, title }], feedback: { correct, incorrect } }
fill-in-blanks: { sentences: [{ id, text (use _______ como placeholder), correctAnswers: [], hint }], feedback: { allCorrect, someCorrect, needsReview } }
scenario-selection: { scenarios: [{ id, situation, options: [], correctAnswer, explanation }] }
true-false: { statements: [{ id, text, correct: boolean, explanation }], feedback: { perfect, good, needsReview } }
platform-match: { scenarios: [{ id, text, correctPlatform, emoji }], platforms: [{ id, name, icon, color }] }
data-collection: { scenario: { id, emoji, platform, situation, dataPoints: [{ id, label, isCorrect, explanation }], context } }
complete-sentence: { sentences: [{ id, text (use _______ como placeholder), correctAnswers: [], options: [] }] }
multiple-choice: { question, options: [], correctAnswer, explanation }
flipcard-quiz: { cards: [{ id, front: { label, color }, back: { text }, options: [{ id, text, isCorrect }], explanation }] }
timed-quiz: { timePerQuestion: 15, bonusPerSecondLeft: 2, timeoutPenalty: "skip", visualTheme: "cyber", questions: [{ id, question, options: [{ id, text, isCorrect }], explanation }] }

Gere IDs únicos para todos os elementos (ex: "item-1", "cat-1", "stmt-1").`;

const QUIZ_SYSTEM_PROMPT = `Você é um designer instrucional. Gere quizzes inline para seções de aula que NÃO possuem interações.
Cada quiz deve:
- Ter explicação clara
- Ter reinforcement (texto extra mostrado ao errar)
- Estar em Português Brasileiro (pt-BR)
- NUNCA referencie números de seção na pergunta (ex: "De acordo com a Seção 0", "conforme a Seção 1", "na Seção 3"). A pergunta deve ser autocontida e compreensível sem contexto de numeração.
- A pergunta NÃO deve mencionar "seção", "seções", "de acordo com", "conforme" seguido de referência numérica.

VARIEDADE DE TIPOS (OBRIGATÓRIO):
- VARIE os tipos de quiz. NÃO repita o mesmo tipo consecutivamente.
- Use "true-false" quando o conteúdo tem afirmações que podem ser validadas como verdadeiras ou falsas. Preencha "statement" e "isTrue".
- Use "fill-blank" quando o conteúdo tem definições ou frases-chave que o aluno deve completar. Preencha "sentenceWithBlank" (com _______), "correctAnswer", "acceptableAnswers" e "chipOptions".
- Use "multiple-choice" como padrão para perguntas de compreensão geral. Preencha "options" com 3-4 opções (exatamente 1 correta).
- Em uma aula com 3+ quizzes, use pelo menos 2 tipos diferentes.

REGRAS POR TIPO:
- multiple-choice: "options" é obrigatório (3-4 opções, 1 correta)
- true-false: "statement" e "isTrue" são obrigatórios. NÃO preencha "options".
- fill-blank: "sentenceWithBlank", "correctAnswer", "acceptableAnswers" e "chipOptions" são obrigatórios. NÃO preencha "options". O campo "question" deve conter apenas uma instrução de engajamento como "Complete a frase abaixo", NUNCA a frase com lacuna. Gere "chipOptions" com 4-6 opções incluindo a correta e distratoras plausíveis.`;

const PLAYGROUND_SYSTEM_PROMPT = `Você é um designer instrucional especializado em prompts de IA.
Gere playgrounds inline para seções onde faz sentido praticar prompts.
Cada playground deve:
- Comparar um prompt amador vs profissional
- O resultado amador (amateurResult) DEVE ser curto, vago, genérico e visivelmente fraco — máximo 2 linhas. Exemplo: "A natureza é bonita e importante." NÃO gere resultados amadores elaborados com poemas, listas ou parágrafos longos.
- O resultado profissional (professionalResult) deve ser detalhado, específico e visivelmente superior ao amador — 3-5 linhas com exemplos concretos.
- Ter instrução com pelo menos 40 caracteres
- Ter desafio para o usuário escrever seu próprio prompt
- Estar em Português Brasileiro (pt-BR)
- Ter hints e critérios de avaliação`;

async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  tools: any[],
  toolName: string,
): Promise<any> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice: { type: "function", function: { name: toolName } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw new Error("RATE_LIMIT: Too many requests. Try again later.");
    if (response.status === 402) throw new Error("CREDITS_EXHAUSTED: Add funds in Settings → Workspace → Usage.");
    throw new Error(`AI Gateway error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return tool call");
  
  return JSON.parse(toolCall.function.arguments);
}

async function generateImages(
  sections: Array<{ title: string; content: string }>,
  lessonId: string,
  supabaseUrl: string,
  authHeader: string,
  apiKey: string,
): Promise<Array<{ index: number; imageUrl?: string; error?: string }>> {
  const results: Array<{ index: number; imageUrl?: string; error?: string }> = [];
  
  // Generate images sequentially to avoid rate limits
  for (let i = 0; i < sections.length; i++) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/v8-generate-section-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          apikey: apiKey,
        },
        body: JSON.stringify({
          mode: "auto",
          content: sections[i].content,
          lessonId,
          sectionIndex: i,
          sectionTitle: sections[i].title,
          allowText: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        results.push({ index: i, error: `HTTP ${response.status}: ${errText}` });
        continue;
      }

      const data = await response.json();
      results.push({ index: i, imageUrl: data.imageUrl });
    } catch (err) {
      results.push({ index: i, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sections,
      manualQuizzes = [],
      manualPlaygrounds = [],
      manualExercises = [],
      generateImages: shouldGenerateImages = false,
      lessonTitle = "Aula",
    } = await req.json();

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return new Response(JSON.stringify({ error: "sections[] is required and must be non-empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("authorization") || `Bearer ${supabaseAnonKey}`;

    const progress: string[] = [];
    const errors: string[] = [];

    // Build content summary for AI
    const contentSummary = sections.map((s: any, i: number) => 
      `### Seção ${i + 1}: ${s.title}\n${s.content?.slice(0, 500) || ""}`
    ).join("\n\n");

    // ── 1. Determine which sections need quizzes/playgrounds ──
    const sectionsWithQuiz = new Set(manualQuizzes.map((q: any) => q.afterSectionIndex));
    const sectionsWithPlayground = new Set(manualPlaygrounds.map((p: any) => p.afterSectionIndex));
    // Seções 0 e 1 são introdutórias — NUNCA recebem quiz ou playground gerado
    const sectionsNeedingInteraction = sections
      .map((_: any, i: number) => i)
      .filter((i: number) => i >= 2 && !sectionsWithQuiz.has(i) && !sectionsWithPlayground.has(i));

    console.log(`[v8-generate-lesson-content] Sections needing interaction: ${sectionsNeedingInteraction.join(", ")}`);

    // ── 2. Generate inline quizzes for sections without interactions ──
    let generatedQuizzes: any[] = [];
    if (sectionsNeedingInteraction.length > 0) {
      progress.push("Gerando quizzes inline...");
      try {
        const quizSectionsContent = sectionsNeedingInteraction.map((i: number) => 
          `Seção ${i} (index ${i}): ${sections[i].title}\n${sections[i].content?.slice(0, 400) || ""}`
        ).join("\n\n");

        const quizResult = await callAI(
          LOVABLE_API_KEY,
          QUIZ_SYSTEM_PROMPT,
          `Gere quizzes para estas seções que NÃO possuem interações:\n\n${quizSectionsContent}\n\nÍndices válidos para afterSectionIndex: ${sectionsNeedingInteraction.join(", ")}`,
          QUIZ_TOOLS,
          "generate_inline_quizzes",
        );

        generatedQuizzes = (quizResult.quizzes || []).map((q: any, idx: number) => ({
          ...q,
          id: `quiz-gen-${String(idx + 1).padStart(2, "0")}`,
          // Only map options for multiple-choice quizzes (true-false and fill-blank don't have options)
          ...(q.quizType === 'multiple-choice' && Array.isArray(q.options) ? {
            options: q.options.map((o: any, oi: number) => ({
              ...o,
              id: `opt-${String(oi + 1).padStart(2, "0")}`,
            })),
          } : {}),
        }));

        // ── Phase 1 (Gap 1): Sanitize encoding on all quiz text fields ──
        generatedQuizzes = generatedQuizzes.map((q: any) => {
          const sanitized = sanitizeFields(q, ['question', 'explanation', 'reinforcement', 'statement', 'sentenceWithBlank', 'correctAnswer']);
          // Also sanitize option texts for multiple-choice
          if (Array.isArray(sanitized.options)) {
            sanitized.options = sanitized.options.map((o: any) => ({ ...o, text: sanitizeEncoding(o.text || '') }));
          }
          if (Array.isArray(sanitized.acceptableAnswers)) {
            sanitized.acceptableAnswers = sanitized.acceptableAnswers.map((a: string) => sanitizeEncoding(a));
          }
          if (Array.isArray(sanitized.chipOptions)) {
            sanitized.chipOptions = sanitized.chipOptions.map((c: string) => sanitizeEncoding(c));
          }
          return sanitized;
        });

        // ── Phase 2 (Gap 7): Sort by afterSectionIndex + rotate consecutive same types ──
        generatedQuizzes.sort((a: any, b: any) => a.afterSectionIndex - b.afterSectionIndex);
        const typeRotation = ['multiple-choice', 'true-false', 'fill-blank'];
        for (let i = 1; i < generatedQuizzes.length; i++) {
          if (generatedQuizzes[i].quizType === generatedQuizzes[i - 1].quizType) {
            const currentType = generatedQuizzes[i].quizType;
            const nextType = typeRotation.find(t => t !== currentType && t !== (generatedQuizzes[i - 1]?.quizType)) || typeRotation.find(t => t !== currentType) || 'true-false';
            console.warn(`[v8-generate] Rotating duplicate quiz type at index ${i}: ${currentType} → ${nextType}`);
            generatedQuizzes[i] = { ...generatedQuizzes[i], quizType: nextType };
          }
        }

        progress.push(`${generatedQuizzes.length} quizzes gerados (tipos: ${generatedQuizzes.map((q: any) => q.quizType).join(', ')})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Quiz generation failed";
        errors.push(`Quizzes: ${msg}`);
        console.error("[v8-generate-lesson-content] Quiz generation error:", msg);
      }
    }

    // ── 3. Generate inline playgrounds (for ~30% of remaining sections) ──
    let generatedPlaygrounds: any[] = [];
    const sectionsForPlayground = sectionsNeedingInteraction.filter((_: number, i: number) => i % 3 === 1);
    if (sectionsForPlayground.length > 0) {
      progress.push("Gerando playgrounds inline...");
      try {
        const pgSectionsContent = sectionsForPlayground.map((i: number) => 
          `Seção ${i} (index ${i}): ${sections[i].title}\n${sections[i].content?.slice(0, 400) || ""}`
        ).join("\n\n");

        const pgResult = await callAI(
          LOVABLE_API_KEY,
          PLAYGROUND_SYSTEM_PROMPT,
          `Gere playgrounds para estas seções:\n\n${pgSectionsContent}\n\nÍndices válidos: ${sectionsForPlayground.join(", ")}`,
          PLAYGROUND_TOOLS,
          "generate_inline_playgrounds",
        );

        generatedPlaygrounds = (pgResult.playgrounds || []).map((p: any, idx: number) => ({
          ...p,
          id: `playground-gen-${String(idx + 1).padStart(2, "0")}`,
        }));

        // Phase 1: Sanitize encoding on playground text fields
        generatedPlaygrounds = generatedPlaygrounds.map((p: any) =>
          sanitizeFields(p, ['title', 'instruction', 'narration', 'amateurPrompt', 'professionalPrompt', 'amateurResult', 'professionalResult', 'successMessage', 'tryAgainMessage'])
        );

        progress.push(`${generatedPlaygrounds.length} playgrounds gerados`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Playground generation failed";
        errors.push(`Playgrounds: ${msg}`);
        console.error("[v8-generate-lesson-content] Playground generation error:", msg);
      }
    }

    // ── 3.1 Phase 3 (Gap 2): Force ONE playground at last section ──
    {
      const lastIdx = sections.length - 1;
      const allPg = [...manualPlaygrounds, ...generatedPlaygrounds];
      const hasPlaygroundAtLast = allPg.some((p: any) => p.afterSectionIndex === lastIdx);

      if (!hasPlaygroundAtLast && generatedPlaygrounds.length > 0) {
        // Move the playground with highest afterSectionIndex to lastIdx
        const sorted = [...generatedPlaygrounds].sort((a: any, b: any) => b.afterSectionIndex - a.afterSectionIndex);
        const moved = sorted[0];
        console.log(`[v8-generate] Phase 3: Moving playground ${moved.id} from section ${moved.afterSectionIndex} → ${lastIdx}`);
        moved.afterSectionIndex = lastIdx;
        // If there's a generated quiz at lastIdx, move it to previous free section
        const quizAtLast = generatedQuizzes.find((q: any) => q.afterSectionIndex === lastIdx);
        if (quizAtLast) {
          const freeSection = Array.from({ length: lastIdx }, (_, i) => lastIdx - 1 - i)
            .find(i => i >= 2
              && !generatedQuizzes.some((q: any) => q !== quizAtLast && q.afterSectionIndex === i)
              && !allPg.some((p: any) => p.afterSectionIndex === i));
          if (freeSection !== undefined) {
            console.log(`[v8-generate] Phase 3: Moving quiz ${quizAtLast.id} from section ${lastIdx} → ${freeSection}`);
            quizAtLast.afterSectionIndex = freeSection;
          }
        }
      } else if (!hasPlaygroundAtLast && allPg.length === 0 && sections.length >= 4) {
        // No playgrounds at all — create a minimal placeholder for the final section
        console.warn(`[v8-generate] Phase 3: No playgrounds generated. Adding placeholder at last section ${lastIdx}`);
        generatedPlaygrounds.push({
          id: `playground-gen-final`,
          afterSectionIndex: lastIdx,
          title: "Sua Vez — Prompt Real",
          instruction: "Agora é com você! Aplique tudo o que aprendeu nesta aula escrevendo um prompt profissional.",
          amateurPrompt: "Me ajuda com isso",
          professionalPrompt: "Preciso de uma análise detalhada sobre X, considerando Y e Z, formatada como lista com prós e contras",
          amateurResult: "Resultado genérico e vago.",
          professionalResult: "Análise estruturada com pontos específicos, prós e contras organizados, e recomendação final baseada nos critérios solicitados.",
          successMessage: "Excelente! Seu prompt demonstra domínio das técnicas aprendidas.",
          tryAgainMessage: "Quase lá! Tente adicionar mais contexto e especificidade ao seu prompt.",
          userChallenge: {
            instruction: "Escreva um prompt profissional aplicando as técnicas desta aula.",
            challengePrompt: "Crie um prompt que seja específico, contextualizado e com formato definido.",
            hints: ["Inclua um objetivo claro", "Adicione contexto real", "Defina o formato esperado"],
            evaluationCriteria: ["Tem objetivo claro", "Inclui contexto", "Define formato"],
          },
        });
      }
    }

    // ── 3.5. Generate inline insights (1 per playground) ──
    let generatedInsights: any[] = [];
    const allPlaygroundsForInsights = [...manualPlaygrounds, ...generatedPlaygrounds];
    if (allPlaygroundsForInsights.length > 0) {
      progress.push("Gerando insights inline...");
      try {
        const INSIGHT_TOOLS = [
          {
            type: "function",
            function: {
              name: "generate_inline_insights",
              description: "Generate insight reward blocks for sections with playgrounds. Each insight has 3 sentences: (1) highlight the skill shift, (2) before vs after contrast, (3) practical application today.",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        afterSectionIndex: { type: "number", description: "0-based section index this insight follows (same as the playground)" },
                        title: { type: "string", description: "Short title like '💡 Aprender e Crescer'" },
                        insightText: { type: "string", description: "3 sentences: (1) Percebeu a virada? (2) Antes X, agora Y. (3) Aplica hoje em..." },
                        creditsReward: { type: "number", description: "Credits reward, typically 10" },
                      },
                      required: ["afterSectionIndex", "title", "insightText", "creditsReward"],
                    },
                  },
                },
                required: ["insights"],
              },
            },
          },
        ];

        const INSIGHT_SYSTEM_PROMPT = `Você é um designer instrucional. Gere blocos de insight de recompensa para seções que possuem playgrounds.
Cada insight deve ter exatamente 3 frases:
1. "Percebeu a virada?" — destaque a mudança de habilidade
2. "Antes X, agora Y" — contraste antes/depois
3. "Aplica hoje em..." — aplicação prática imediata

O título deve ser curto e começar com 💡. creditsReward deve ser 10. Português Brasileiro (pt-BR).`;

        const insightSectionsContent = allPlaygroundsForInsights.map((p: any) =>
          `Playground após seção ${p.afterSectionIndex}: ${sections[p.afterSectionIndex]?.title || "?"}\nInstrução: ${p.instruction?.slice(0, 200) || ""}`
        ).join("\n\n");

        const insightResult = await callAI(
          LOVABLE_API_KEY,
          INSIGHT_SYSTEM_PROMPT,
          `Gere insights para estes playgrounds:\n\n${insightSectionsContent}\n\nÍndices válidos: ${allPlaygroundsForInsights.map((p: any) => p.afterSectionIndex).join(", ")}`,
          INSIGHT_TOOLS,
          "generate_inline_insights",
        );

        generatedInsights = (insightResult.insights || [])
          .filter((ins: any) => ins.afterSectionIndex >= 0 && ins.afterSectionIndex < sections.length)
          .map((ins: any) => ({
            ...ins,
            id: crypto.randomUUID(),
            // Phase 1: Sanitize encoding
            title: sanitizeEncoding(ins.title || ''),
            insightText: sanitizeEncoding(ins.insightText || ''),
          }));
        progress.push(`${generatedInsights.length} insights gerados`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Insight generation failed";
        errors.push(`Insights: ${msg}`);
        console.error("[v8-generate-lesson-content] Insight generation error:", msg);
        generatedInsights = [];
      }
    }

    // ── 4. Generate final exercises (2-4 from 10 types) ──
    let generatedExercises: any[] = [];
    if (manualExercises.length === 0) {
      progress.push("Gerando exercícios finais...");
      try {
        const exerciseResult = await callAI(
          LOVABLE_API_KEY,
          EXERCISE_SYSTEM_PROMPT,
          `Analise o conteúdo completo desta aula "${lessonTitle}" e gere 2-4 exercícios finais variados:\n\n${contentSummary}`,
          EXERCISE_TOOLS,
          "generate_exercises",
        );

        const rawExercises = (exerciseResult.exercises || []).map((ex: any, idx: number) => ({
          ...ex,
          id: `exercise-${String(idx + 1).padStart(2, "0")}`,
          passingScore: 70,
          maxAttempts: 3,
        }));

        // ── VALIDATION: Reject exercises with empty data objects ──
        const REQUIRED_DATA_KEYS: Record<string, string[]> = {
          'true-false': ['statements'],
          'drag-drop': ['items', 'categories'],
          'fill-in-blanks': ['sentences'],
          'complete-sentence': ['sentences'],
          'multiple-choice': ['question', 'options'],
          'flipcard-quiz': ['cards'],
          'timed-quiz': ['questions'],
          'scenario-selection': ['scenarios'],
          'platform-match': ['scenarios', 'platforms'],
          'data-collection': ['scenario'],
        };

        generatedExercises = rawExercises.filter((ex: any) => {
          const requiredKeys = REQUIRED_DATA_KEYS[ex.type];
          if (!requiredKeys) {
            console.warn(`[v8-generate-lesson-content] Unknown exercise type: ${ex.type}, keeping as-is`);
            return true;
          }
          const dataKeys = Object.keys(ex.data || {});
          const hasRequired = requiredKeys.some((k: string) => dataKeys.includes(k));
          if (!hasRequired) {
            console.error(`[v8-generate-lesson-content] REJECTED exercise ${ex.id} (${ex.type}): data is empty or missing required keys [${requiredKeys.join(', ')}]. Got: [${dataKeys.join(', ')}]`);
            errors.push(`Exercício ${ex.id} (${ex.type}) rejeitado: data vazio`);
            return false;
          }
          return true;
        });

        progress.push(`${generatedExercises.length} exercícios válidos de ${rawExercises.length} gerados (tipos: ${generatedExercises.map((e: any) => e.type).join(", ")})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Exercise generation failed";
        errors.push(`Exercícios: ${msg}`);
        console.error("[v8-generate-lesson-content] Exercise generation error:", msg);
      }
    } else {
      generatedExercises = manualExercises;
      progress.push(`${manualExercises.length} exercícios manuais mantidos`);
    }

    // ── 5. Generate images (optional) ──
    let imageResults: Array<{ index: number; imageUrl?: string; error?: string }> = [];
    if (shouldGenerateImages) {
      progress.push("Gerando imagens por seção...");
      imageResults = await generateImages(
        sections,
        `draft-${Date.now()}`,
        supabaseUrl,
        authHeader,
        supabaseAnonKey,
      );
      const successCount = imageResults.filter(r => r.imageUrl).length;
      progress.push(`${successCount}/${sections.length} imagens geradas`);
      imageResults.filter(r => r.error).forEach(r => errors.push(`Imagem seção ${r.index}: ${r.error}`));
    }

    // ── 6. Build final response ──
    const updatedSections = sections.map((s: any, i: number) => {
      const imageResult = imageResults.find(r => r.index === i);
      return {
        ...s,
        ...(imageResult?.imageUrl ? { imageUrl: imageResult.imageUrl } : {}),
      };
    });

    // Merge manual + generated
    const allQuizzes = [...manualQuizzes, ...generatedQuizzes];
    const allPlaygrounds = [...manualPlaygrounds, ...generatedPlaygrounds];

    const response = {
      sections: updatedSections,
      inlineQuizzes: allQuizzes,
      inlinePlaygrounds: allPlaygrounds,
      inlineInsights: generatedInsights,
      inlineCompleteSentences: [],
      exercises: generatedExercises,
      progress,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`[v8-generate-lesson-content] Done: ${allQuizzes.length} quizzes, ${allPlaygrounds.length} playgrounds, ${generatedExercises.length} exercises, ${imageResults.filter(r => r.imageUrl).length} images`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[v8-generate-lesson-content] Error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    const status = errorMessage.includes("RATE_LIMIT") ? 429 : errorMessage.includes("CREDITS_EXHAUSTED") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
