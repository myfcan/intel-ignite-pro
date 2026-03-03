import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
                  description: "Exercise-specific data following the schema for the chosen type",
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
      description: "Generate inline quizzes for sections that lack interactions. Each quiz tests comprehension of the section content.",
      parameters: {
        type: "object",
        properties: {
          quizzes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                afterSectionIndex: { type: "number", description: "0-based index of the section this quiz follows" },
                question: { type: "string" },
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
                },
                explanation: { type: "string" },
                reinforcement: { type: "string" },
              },
              required: ["afterSectionIndex", "question", "options", "explanation"],
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
- Ter 3-4 opções (exatamente 1 correta)
- Testar compreensão real do conteúdo da seção
- Ter explicação clara
- Ter reinforcement (texto extra mostrado ao errar)
- Estar em Português Brasileiro (pt-BR)
- NUNCA referencie números de seção na pergunta (ex: "De acordo com a Seção 0", "conforme a Seção 1", "na Seção 3"). A pergunta deve ser autocontida e compreensível sem contexto de numeração.
- A pergunta NÃO deve mencionar "seção", "seções", "de acordo com", "conforme" seguido de referência numérica.`;

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
      generateImages: shouldGenerateImages = true,
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
          options: q.options.map((o: any, oi: number) => ({
            ...o,
            id: `opt-${String(oi + 1).padStart(2, "0")}`,
          })),
        }));
        progress.push(`${generatedQuizzes.length} quizzes gerados`);
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
        progress.push(`${generatedPlaygrounds.length} playgrounds gerados`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Playground generation failed";
        errors.push(`Playgrounds: ${msg}`);
        console.error("[v8-generate-lesson-content] Playground generation error:", msg);
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

        generatedExercises = (exerciseResult.exercises || []).map((ex: any, idx: number) => ({
          ...ex,
          id: `exercise-${String(idx + 1).padStart(2, "0")}`,
          passingScore: 70,
          maxAttempts: 3,
        }));
        progress.push(`${generatedExercises.length} exercícios gerados (tipos: ${generatedExercises.map((e: any) => e.type).join(", ")})`);
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
