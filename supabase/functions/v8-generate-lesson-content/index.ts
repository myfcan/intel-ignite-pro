import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Phase 1 (Gap 1): Encoding + pedagogical sanitization for AI-generated Portuguese text ───
function sanitizeEncoding(text: string): string {
  if (!text || typeof text !== 'string') return text;
  const fixes: [RegExp, string][] = [
    [/\bn o\b/gi, "não é"], [/\bausncia\b/gi, "ausência"], [/\bespecfico\b/gi, "específico"],
    [/\binformaes\b/gi, "informações"], [/\bdefinio\b/gi, "definição"], [/\bcompreenso\b/gi, "compreensão"],
    [/\bprtico\b/gi, "prático"], [/\bexplicao\b/gi, "explicação"], [/\bcontedo\b/gi, "conteúdo"],
    [/\bpossvel\b/gi, "possível"], [/\binteligncia\b/gi, "inteligência"], [/\bexperincia\b/gi, "experiência"],
    [/\bverdadeiro\b/gi, "verdadeiro"], [/\binterao\b/gi, "interação"],
    [/(?<![a-záéíóúâêôãõçà])til(?=\s|[.,;:!?]|$)/gi, "útil"],
  ];
  let r = text;
  for (const [p, rep] of fixes) { r = r.replace(p, rep); }
  r = r.replace(/\s{2,}/g, ' ').trim();
  if (r !== text) console.warn(`[sanitizeEncoding] Fixed: "${text.slice(0, 60)}..."`);
  return r;
}

function sanitizePedagogicalText(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi, '$1')
    .replace(/(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi, '$1')
    .replace(/\[(?![^\]]*\]\()[^\]]{1,40}\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeV8Text(text: string): string {
  return sanitizePedagogicalText(sanitizeEncoding(text));
}

function sanitizeFields(obj: any, fields: string[]): any {
  const r = { ...obj };
  for (const f of fields) {
    if (typeof r[f] === 'string') r[f] = sanitizeV8Text(r[f]);
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

const INLINE_EXERCISE_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_inline_exercises",
      description: "Generate inline exercises for sections between content sections. Choose from 8 types per V8-C01 contract.",
      parameters: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                afterSectionIndex: { type: "number", description: "0-based section index this exercise follows" },
                type: { type: "string", enum: ["true-false", "multiple-choice", "complete-sentence", "fill-in-blanks", "flipcard-quiz", "scenario-selection", "platform-match", "timed-quiz"] },
                title: { type: "string" },
                instruction: { type: "string" },
                data: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    statements: {
                      type: "array",
                      description: "For true-false and multiple-choice: [{ id, text, correct: boolean, explanation }]",
                      items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" }, correct: { type: "boolean" }, explanation: { type: "string" } }, required: ["id", "text", "correct", "explanation"] }
                    },
                    sentences: {
                      type: "array",
                      description: "For fill-in-blanks and complete-sentence: [{ id, text (use _______ as placeholder), correctAnswers: [], options?: [], hint? }]",
                      items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" }, correctAnswers: { type: "array", items: { type: "string" } }, options: { type: "array", items: { type: "string" } }, hint: { type: "string" } }, required: ["id", "text", "correctAnswers"] }
                    },
                    cards: {
                      type: "array",
                      description: "For flipcard-quiz: [{ id, front: { label, color }, back: { text }, options: [{ id, text, isCorrect }], explanation }]",
                      items: { type: "object", properties: { id: { type: "string" }, front: { type: "object", properties: { label: { type: "string" }, color: { type: "string" } } }, back: { type: "object", properties: { text: { type: "string" } } }, options: { type: "array", items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" }, isCorrect: { type: "boolean" } } } }, explanation: { type: "string" } }, required: ["id", "front", "back", "options", "explanation"] }
                    },
                    scenarios: {
                      type: "array",
                      description: "For scenario-selection: MUST include situation, options (3-4 strings), correctAnswer, explanation. For platform-match: MUST include text, correctPlatform, emoji. Items with ONLY an id are INVALID.",
                      items: { type: "object", additionalProperties: true, properties: { id: { type: "string" }, situation: { type: "string" }, options: { type: "array", items: { type: "string" } }, correctAnswer: { type: "string" }, explanation: { type: "string" }, text: { type: "string" }, correctPlatform: { type: "string" }, emoji: { type: "string" } }, required: ["id"] }
                    },
                    platforms: {
                      type: "array",
                      description: "For platform-match only: [{ id, name, icon, color }]",
                      items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, icon: { type: "string" }, color: { type: "string" } }, required: ["id", "name", "icon", "color"] }
                    },
                    questions: {
                      type: "array",
                      description: "For timed-quiz: [{ id, question, options: [{ id, text, isCorrect }], explanation }]",
                      items: { type: "object", properties: { id: { type: "string" }, question: { type: "string" }, options: { type: "array", items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" }, isCorrect: { type: "boolean" } } } }, explanation: { type: "string" } }, required: ["id", "question", "options", "explanation"] }
                    },
                    feedback: {
                      type: "object",
                      description: "Feedback messages: { perfect, good, needsReview }",
                      properties: { perfect: { type: "string" }, good: { type: "string" }, needsReview: { type: "string" } }
                    },
                    timePerQuestion: { type: "number", description: "For timed-quiz: seconds per question (default 15)" },
                    bonusPerSecondLeft: { type: "number", description: "For timed-quiz: bonus points per second remaining" },
                    timeoutPenalty: { type: "string", description: "For timed-quiz: what happens on timeout (default 'skip')" },
                    visualTheme: { type: "string", description: "For timed-quiz: visual theme (default 'cyber')" }
                  },
                  description: "Exercise-specific data. MUST contain the required fields for the chosen type. true-false/multiple-choice → 'statements'. fill-in-blanks/complete-sentence → 'sentences'. flipcard-quiz → 'cards'. scenario-selection → 'scenarios'. platform-match → 'scenarios' AND 'platforms'. timed-quiz → 'questions'. An EMPTY data object {} is INVALID.",
                },
              },
              required: ["afterSectionIndex", "type", "title", "instruction", "data"],
            },
          },
        },
        required: ["exercises"],
      },
    },
  },
];

const PLAYGROUND_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_inline_playgrounds",
      description: "Generate inline playgrounds for sections where practical prompt exercise makes sense.",
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

PROIBIÇÕES:
- NUNCA gere subtítulos, labels ou metadados como "Segmento vida real desta atividade: X", "Atividade prática:", "Contexto real:" ou qualquer rótulo meta-narrativo. O quiz deve ir DIRETO ao conteúdo sem labels de categorização.

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
Gere UM playground para a ÚLTIMA seção da aula onde o aluno pratica escrevendo prompts.
O playground deve:
- Comparar um prompt amador vs profissional
- O resultado amador (amateurResult) DEVE ser curto, vago, genérico e visivelmente fraco — máximo 2 linhas. Exemplo: "A natureza é bonita e importante." NÃO gere resultados amadores elaborados com poemas, listas ou parágrafos longos.
- O resultado profissional (professionalResult) deve ser detalhado, específico e visivelmente superior ao amador — 3-5 linhas com exemplos concretos.
- Ter instrução com pelo menos 40 caracteres
- Ter desafio para o usuário escrever seu próprio prompt
- Estar em Português Brasileiro (pt-BR)
- Ter hints e critérios de avaliação

PROIBIÇÕES:
- NUNCA gere subtítulos, labels ou metadados como "Segmento vida real desta atividade: X", "Atividade prática:", "Contexto real:" ou qualquer rótulo meta-narrativo.
- NUNCA use tom apressado no enunciado. Proibido: "Responda rapidamente", "confie no seu instinto", "você tem pouco tempo", "sem pensar muito", "responda agora". Essas frases são anti-pedagógicas.

TOM OBRIGATÓRIO:
- O enunciado deve guiar o aluno a PENSAR e ANALISAR antes de agir.
- Use frases como: "Analise o cenário abaixo", "Observe como...", "Teste sua habilidade aplicando as técnicas desta aula", "Compare os dois prompts e identifique...".
- O playground é um exercício de reflexão aplicada, não uma prova relâmpago.`;

const INLINE_EXERCISE_SYSTEM_PROMPT = `Você é um designer instrucional especializado em educação sobre I.A.
Gere exercícios interativos inline para seções intermediárias de uma aula.

REGRAS:
1. Gere EXATAMENTE o tipo solicitado para cada seção — o tipo é obrigatório e definido pelo contrato V8-C01.
2. Use Português Brasileiro (pt-BR)
3. Cada exercício deve testar conhecimento real da seção correspondente
4. NÃO referencie números de seção na pergunta

PROIBIÇÕES:
- NUNCA gere subtítulos, labels ou metadados como "Segmento vida real desta atividade: X", "Atividade prática:", "Contexto real:" ou qualquer rótulo meta-narrativo. Vá DIRETO ao exercício.

TIPOS DISPONÍVEIS E SCHEMAS:
- true-false: { statements: [{ id: "stmt-1", text: "afirmação", correct: true/false, explanation: "..." }], feedback: { perfect: "...", good: "...", needsReview: "..." } }
- fill-in-blanks: { sentences: [{ id: "sent-1", text: "Frase com _______ placeholder", correctAnswers: ["resposta"], hint: "dica" }], feedback: { allCorrect: "...", someCorrect: "...", needsReview: "..." } }
- complete-sentence: { sentences: [{ id: "sent-1", text: "Frase com _______ placeholder", correctAnswers: ["resposta"], options: ["opção1", "opção2", "opção3", "resposta"] }] }
- multiple-choice: Use o formato true-false (statements) para compatibilidade do player. { statements: [{ id, text, correct, explanation }], feedback: { perfect, good, needsReview } }
- flipcard-quiz: { cards: [{ id: "card-1", front: { label: "Conceito X", color: "#6366f1" }, back: { text: "explicação" }, options: [{ id: "opt-1", text: "opção", isCorrect: true/false }], explanation: "..." }] }
- scenario-selection: { scenarios: [{ id: "sc-1", situation: "descrição do cenário", options: ["opção A", "opção B", "opção C"], correctAnswer: "opção A", explanation: "..." }] }
- platform-match: { scenarios: [{ id: "pm-1", text: "caso de uso", correctPlatform: "ChatGPT", emoji: "🤖" }], platforms: [{ id: "plat-1", name: "ChatGPT", icon: "🤖", color: "#10a37f" }, { id: "plat-2", name: "Midjourney", icon: "🎨", color: "#5865f2" }] }
- timed-quiz: { timePerQuestion: 15, bonusPerSecondLeft: 2, timeoutPenalty: "skip", visualTheme: "cyber", questions: [{ id: "tq-1", question: "pergunta", options: [{ id: "tqo-1", text: "opção", isCorrect: true/false }], explanation: "..." }] }

Gere IDs únicos para todos os elementos.
Gere 2 statements/sentences/cards/questions por exercício (máximo 2 para timed-quiz).`;

// ─── Coursiv Prompt Builder: tool schema + system prompt ───
const COURSIV_BUILDER_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_coursiv_exercise",
      description: "Generate ONE Coursiv exercise: a SINGLE sentence/prompt with EXACTLY 4 inline blanks (max 14 words). Chips = only the 4 correct answers (NO distractors).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short title like 'Monte o Prompt Profissional'" },
          instruction: { type: "string", description: "Instruction like 'Complete o prompt organizando as palavras que faltam no seu contexto.'" },
          sentences: {
            type: "array",
            minItems: 1,
            maxItems: 1,
            description: "EXACTLY 1 sentence object with EXACTLY 4 blanks and max 14 words total.",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                text: { type: "string", description: "ONE prompt sentence with EXACTLY 4 _______ placeholders and NO MORE than 14 words total (each _______ counts as 1 word). Example: 'Crie um _______ para _______ no formato _______ com tom _______'" },
                correctAnswers: {
                  type: "array",
                  minItems: 4,
                  maxItems: 4,
                  items: { type: "string" },
                  description: "EXACTLY 4 ordered correct words/phrases for each blank. Example: ['roteiro', 'empresas', 'lista', 'persuasivo']"
                },
              },
              required: ["id", "text", "correctAnswers"],
            },
          },
        },
        required: ["title", "instruction", "sentences"],
      },
    },
  },
];

const COURSIV_SYSTEM_PROMPT = `Você é um designer instrucional especializado em construção de prompts de IA.

Sua tarefa é gerar UM único exercício Coursiv para a sessão 8.

FORMATO OBRIGATÓRIO:
- Gere EXATAMENTE 1 frase (um prompt completo) com EXATAMENTE 4 lacunas (_______) embutidas inline.
- A frase deve ter NO MÁXIMO 14 palavras no total (cada _______ conta como 1 palavra).
- A frase deve parecer um prompt real que o aluno usaria com ChatGPT, Gemini ou outra IA.
- Cada lacuna representa um componente estrutural: objetivo, público-alvo, contexto, formato, tom, restrição, etc.

EXEMPLO DE FORMATO:
text: "Crie um _______ para _______ no formato _______ com tom _______"
correctAnswers: ["roteiro", "empresas", "lista", "persuasivo"]

REGRAS:
1. sentences deve ter EXATAMENTE 1 item.
2. O campo text deve conter EXATAMENTE 4 placeholders _______ (use exatamente 7 underscores). NÃO gere 3, 5 ou 6 lacunas.
3. A frase deve ter NO MÁXIMO 14 palavras (incluindo os placeholders como palavras). Conte: "Crie um _______ para _______ no formato _______ com tom _______" = 10 palavras. OK.
4. correctAnswers: array com EXATAMENTE 4 palavras/frases corretas, na mesma ordem das lacunas no texto.
5. NÃO gere o campo options. Os chips exibidos serão APENAS as 4 respostas corretas em ordem embaralhada.
6. As respostas corretas devem ser curtas (1-2 palavras cada).
7. Use Português Brasileiro (pt-BR).

REGRA CRÍTICA — PALAVRAS PROIBIDAS:
- PROIBIDO usar conceitos fora de domínio como: café, bolo, receita, árvores, carros, poeta, clima, fonte tipográfica, imagens decorativas, planetas, exercícios físicos, filmes, música, esportes, animais, comida, viagem, moda.`;

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
    let {
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

    sections = sections.map((s: any) => ({
      ...s,
      title: sanitizeV8Text(String(s?.title || '')),
      content: sanitizeV8Text(String(s?.content || '')),
    }));

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

    // ── 1. V8-C01 Contract: Deterministic section-interaction map ──
    const sectionsWithQuiz = new Set(manualQuizzes.map((q: any) => q.afterSectionIndex));
    const sectionsWithPlayground = new Set(manualPlaygrounds.map((p: any) => p.afterSectionIndex));
    const lastIdx = sections.length - 1;
    const coursivTargetIdx = lastIdx >= 4 ? lastIdx - 1 : -1;

    // V8-C01 contract: fixed interaction types per section index (0-based)
    // Sections 0-1: no interaction (introductory)
    // Sections 2-6: mapped types (random pick from pool)
    // lastIdx-1: Coursiv (handled separately)
    // lastIdx: Playground (handled separately)
    const V8_C01_MAP: Record<number, string[]> = {
      2: ['multiple-choice', 'flipcard-quiz'],
      3: ['complete-sentence', 'scenario-selection'],
      4: ['true-false'],
      // Section 5 (Sessão 6): no exercise — removed per V8-C01 update
      6: ['timed-quiz', 'fill-in-blanks'],
    };

    // Build interaction assignments for this lesson
    const interactionAssignments: Array<{ sectionIndex: number; type: string }> = [];
    for (let i = 2; i < sections.length; i++) {
      // Skip if section has manual quiz/playground, or is reserved for Coursiv/Playground
      if (sectionsWithQuiz.has(i) || sectionsWithPlayground.has(i)) continue;
      if (i === coursivTargetIdx || i === lastIdx) continue;

      const pool = V8_C01_MAP[i];
      if (!pool) continue; // No mapping for this index (sections 7+ beyond coursiv/playground)

      const selectedType = pool[Math.floor(Math.random() * pool.length)];
      interactionAssignments.push({ sectionIndex: i, type: selectedType });
    }

    console.log(`[v8-generate-lesson-content] V8-C01 map: ${interactionAssignments.map(a => `S${a.sectionIndex}→${a.type}`).join(', ')}${coursivTargetIdx >= 0 ? ` | Coursiv→S${coursivTargetIdx}` : ''} | Playground→S${lastIdx}`);

    // ── 2. Generate inline exercises via unified pipeline (V8-C01) ──
    let generatedQuizzes: any[] = []; // Empty — quizzes are now unified into inlineExercises
    let generatedInlineExercises: any[] = [];
    if (interactionAssignments.length > 0) {
      progress.push("Gerando exercícios inline (V8-C01)...");
      try {
        const assignmentPrompt = interactionAssignments.map(a => {
          const section = sections[a.sectionIndex];
          return `Seção ${a.sectionIndex} (index ${a.sectionIndex}): "${section.title}"\nConteúdo: ${section.content?.slice(0, 400) || ""}\n→ TIPO OBRIGATÓRIO: ${a.type}`;
        }).join("\n\n---\n\n");

        const exResult = await callAI(
          LOVABLE_API_KEY,
          INLINE_EXERCISE_SYSTEM_PROMPT,
          `Gere exercícios inline para estas seções. CADA EXERCÍCIO DEVE SER DO TIPO ESPECIFICADO:\n\n${assignmentPrompt}\n\nÍndices válidos para afterSectionIndex: ${interactionAssignments.map(a => a.sectionIndex).join(", ")}`,
          INLINE_EXERCISE_TOOLS,
          "generate_inline_exercises",
        );

        // Log AI exercise structure for diagnostics
        console.log(`[v8-generate] AI exercises: ${JSON.stringify((exResult.exercises || []).map((ex: any) => ({ type: ex.type, s: ex.afterSectionIndex, dk: Object.keys(ex.data || {}) })))}`);

        const INLINE_REQUIRED_DATA_KEYS: Record<string, string[]> = {
          'true-false': ['statements'],
          'fill-in-blanks': ['sentences'],
          'complete-sentence': ['sentences'],
          'multiple-choice': ['statements'],
          'flipcard-quiz': ['cards'],
          'scenario-selection': ['scenarios'],
          'platform-match': ['scenarios', 'platforms'],
          'timed-quiz': ['questions'],
        };

        // ── DATA NORMALIZATION: Rescue exercise data from root level into data object ──
        const normalizeExerciseData = (ex: any): any => {
          const dataKeysByType: Record<string, string[]> = {
            'true-false': ['statements', 'feedback'],
            'fill-in-blanks': ['sentences', 'feedback'],
            'complete-sentence': ['sentences'],
            'multiple-choice': ['statements', 'feedback', 'question', 'options', 'correctAnswer', 'explanation'],
            'flipcard-quiz': ['cards'],
            'scenario-selection': ['scenarios'],
            'platform-match': ['scenarios', 'platforms'],
            'timed-quiz': ['questions', 'timePerQuestion', 'bonusPerSecondLeft', 'timeoutPenalty', 'visualTheme'],
          };
          const keysToMove = dataKeysByType[ex.type] || [];
          const currentData = ex.data && typeof ex.data === 'object' ? { ...ex.data } : {};
          let rescued = false;
          for (const key of keysToMove) {
            if (!(key in currentData) && key in ex) {
              currentData[key] = ex[key];
              rescued = true;
            }
          }
          if (rescued) {
            console.warn(`[v8-generate] DATA RESCUE for ${ex.type}: moved keys from root into data`);
          }
          return { ...ex, data: currentData };
        };

        generatedInlineExercises = (exResult.exercises || [])
          .map((ex: any, idx: number) => normalizeExerciseData({
            ...ex,
            id: `inline-ex-${String(idx + 1).padStart(2, "0")}`,
            title: sanitizeV8Text(ex.title || ''),
            instruction: sanitizeV8Text(ex.instruction || ''),
          }))
          .filter((ex: any) => {
            const requiredKeys = INLINE_REQUIRED_DATA_KEYS[ex.type];
            if (!requiredKeys) {
              console.warn(`[v8-generate] Unknown inline exercise type: ${ex.type}, rejecting`);
              return false;
            }
            const dataKeys = Object.keys(ex.data || {});
            const hasRequired = requiredKeys.every((k: string) => dataKeys.includes(k));
            if (!hasRequired) {
              console.error(`[v8-generate] REJECTED inline exercise ${ex.id} (${ex.type}): missing required keys [${requiredKeys.join(', ')}]`);
              return false;
            }
            // ── CONTENT DEPTH VALIDATION: Reject arrays of empty/id-only objects ──
            const CONTENT_DEPTH_RULES: Record<string, { key: string; minFields: number; requiredFields?: string[] }> = {
              'scenario-selection': { key: 'scenarios', minFields: 3, requiredFields: ['situation', 'options', 'correctAnswer'] },
              'platform-match': { key: 'scenarios', minFields: 2, requiredFields: ['text', 'correctPlatform'] },
              'flipcard-quiz': { key: 'cards', minFields: 3, requiredFields: ['front', 'back', 'options'] },
              'timed-quiz': { key: 'questions', minFields: 2, requiredFields: ['question', 'options'] },
            };
            const depthRule = CONTENT_DEPTH_RULES[ex.type];
            if (depthRule) {
              const items = ex.data[depthRule.key];
              if (Array.isArray(items)) {
                for (const item of items) {
                  const itemKeys = Object.keys(item || {});
                  if (itemKeys.length < depthRule.minFields) {
                    console.error(`[v8-generate] REJECTED ${ex.id} (${ex.type}): item has only ${itemKeys.length} fields (min ${depthRule.minFields}): ${JSON.stringify(item).slice(0, 100)}`);
                    return false;
                  }
                  if (depthRule.requiredFields) {
                    const missing = depthRule.requiredFields.filter(f => !(f in item));
                    if (missing.length > 0) {
                      console.error(`[v8-generate] REJECTED ${ex.id} (${ex.type}): item missing fields [${missing.join(', ')}]: ${JSON.stringify(item).slice(0, 100)}`);
                      return false;
                    }
                  }
                }
              }
            }
            return true;
          });

        // ── V8-C01 COUNTS: Detailed rejection logging ──
        const aiReturnedCount = (exResult.exercises || []).length;
        const acceptedCount = generatedInlineExercises.length;
        const rejectedCount = aiReturnedCount - acceptedCount;
        
        const rejectionReasons: Record<string, number> = {};
        (exResult.exercises || []).forEach((ex: any) => {
          const requiredKeys = INLINE_REQUIRED_DATA_KEYS[ex.type];
          if (!requiredKeys) {
            rejectionReasons[`unknown_type:${ex.type}`] = (rejectionReasons[`unknown_type:${ex.type}`] || 0) + 1;
          } else {
            const dataKeys = Object.keys(ex.data || {});
            const hasAll = requiredKeys.every((k: string) => dataKeys.includes(k));
            if (!hasAll) {
              const missing = requiredKeys.filter((k: string) => !dataKeys.includes(k));
              rejectionReasons[`missing_keys:${ex.type}(need:${missing.join('+')})`] = 
                (rejectionReasons[`missing_keys:${ex.type}(need:${missing.join('+')})`] || 0) + 1;
            }
          }
        });
        
        console.log(`[v8-generate] V8-C01 COUNTS: aiReturned=${aiReturnedCount}, accepted=${acceptedCount}, rejected=${rejectedCount}`);
        if (rejectedCount > 0) {
          console.error(`[v8-generate] V8-C01 REJECTION DETAILS: ${JSON.stringify(rejectionReasons)}`);
        }
        
        // ── V8-C01 GATE: Missing sections = HARD FAIL ──
        const coveredSections = new Set(generatedInlineExercises.map((e: any) => e.afterSectionIndex));
        const missingSections = interactionAssignments.filter(a => !coveredSections.has(a.sectionIndex));
        
        if (missingSections.length > 0) {
          const missingDesc = missingSections.map(m => `S${m.sectionIndex}(${m.type})`).join(', ');
          throw new Error(`V8-C01 HARD FAIL: Missing exercises for sections: ${missingDesc}. AI returned ${aiReturnedCount}, accepted ${acceptedCount}, rejected ${rejectedCount}. Details: ${JSON.stringify(rejectionReasons)}`);
        }

        // ── V8-C01 DUPLICATE GATE: Exactly 1 exercise per section ──
        const perSectionCounts: Record<number, number> = {};
        for (const ex of generatedInlineExercises) {
          perSectionCounts[ex.afterSectionIndex] = (perSectionCounts[ex.afterSectionIndex] || 0) + 1;
        }
        const dupSections = interactionAssignments
          .filter(a => (perSectionCounts[a.sectionIndex] || 0) !== 1)
          .map(a => `S${a.sectionIndex}(count=${perSectionCounts[a.sectionIndex] || 0})`);
        if (dupSections.length > 0) {
          throw new Error(`V8-C01 HARD FAIL: Expected exactly 1 inline exercise per section. Offenders: ${dupSections.join(', ')}`);
        }
        
        progress.push(`${generatedInlineExercises.length} exercícios inline gerados (V8-C01: ${generatedInlineExercises.map((e: any) => e.type).join(', ')})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Inline exercise generation failed";
        // V8-C01 HARD FAIL deve propagar (não capturar)
        if (msg.includes('V8-C01 HARD FAIL')) {
          throw err;
        }
        errors.push(`Inline exercises: ${msg}`);
        console.error("[v8-generate-lesson-content] Inline exercise generation error:", msg);
      }
    }

    // ── 3.05 Coursiv Prompt Builder (penultimate section) ──
    let generatedCoursivSentences: any[] = [];
    if (coursivTargetIdx >= 0) {
      progress.push("Gerando exercício Coursiv (montagem de prompt)...");
      try {
        const coursivSectionContent = `Seção ${coursivTargetIdx} (index ${coursivTargetIdx}): ${sections[coursivTargetIdx].title}\n${sections[coursivTargetIdx].content?.slice(0, 500) || ""}`;

        const coursivResult = await callAI(
          LOVABLE_API_KEY,
          COURSIV_SYSTEM_PROMPT,
          `Gere um exercício Coursiv de montagem de prompt para esta seção da aula "${lessonTitle}":\n\n${coursivSectionContent}\n\nafterSectionIndex obrigatório: ${coursivTargetIdx}`,
          COURSIV_BUILDER_TOOLS,
          "generate_coursiv_exercise",
        );

        if (coursivResult && coursivResult.sentences && coursivResult.sentences.length > 0) {
          const coursivExercise = {
            id: `coursiv-gen-01`,
            afterSectionIndex: coursivTargetIdx,
            title: sanitizeV8Text(coursivResult.title || 'Monte o Prompt Profissional'),
            instruction: sanitizeV8Text(coursivResult.instruction || 'Complete as frases escolhendo os chips corretos.'),
            sentences: coursivResult.sentences.map((s: any) => ({
              ...s,
              text: sanitizeV8Text(s.text || ''),
              correctAnswers: (s.correctAnswers || []).map((a: string) => sanitizeV8Text(a)),
              options: (s.options || []).map((o: string) => sanitizeV8Text(o)),
            })),
          };

          // ── COURSIV QUALITY GATE (HARD FAIL) ──
          const COURSIV_BANNED_WORDS = ['café', 'bolo', 'receita', 'árvore', 'carro', 'poeta', 'clima', 'fonte tipográfica', 'imagens decorativas', 'planeta', 'exercício físico', 'filme', 'música', 'esporte', 'animal', 'comida', 'viagem', 'moda'];
          const coursivErrors: string[] = [];

          // Must be exactly 1 sentence
          if (coursivExercise.sentences.length !== 1) {
            coursivErrors.push(`Expected exactly 1 sentence, got ${coursivExercise.sentences.length}`);
          }

          const sentence = coursivExercise.sentences[0];
          if (sentence) {
            const blankCount = (sentence.text?.match(/_______/g) || []).length;
            const answerCount = (sentence.correctAnswers || []).length;

            if (blankCount !== 4) {
              coursivErrors.push(`Text must contain EXACTLY 4 blanks, found ${blankCount}`);
            }

            // V8-C01: max 14 words per sentence
            const wordCount = sentence.text.trim().split(/\s+/).length;
            if (wordCount > 14) {
              coursivErrors.push(`Text must have max 14 words, found ${wordCount}`);
            }

            if (answerCount !== 4) {
              coursivErrors.push(`correctAnswers must have EXACTLY 4 items, got ${answerCount}`);
            }

            // V8-C01: Force options = correctAnswers only (no distractors)
            sentence.options = [...(sentence.correctAnswers || [])];

            // Check banned words in correct answers
            for (const ans of (sentence.correctAnswers || [])) {
              const ansLower = String(ans).toLowerCase();
              for (const banned of COURSIV_BANNED_WORDS) {
                if (ansLower.includes(banned)) {
                  coursivErrors.push(`Answer "${ans}" contains banned word "${banned}"`);
                }
              }
            }
          }

          if (coursivErrors.length > 0) {
            const errorMsg = `COURSIV QUALITY GATE HARD FAIL: ${coursivErrors.join('; ')}`;
            console.error(`[v8-generate] ${errorMsg}`);
            throw new Error(errorMsg);
          }

          generatedCoursivSentences.push(coursivExercise);
          const blanksFinal = (sentence?.text?.match(/_______/g) || []).length;
          progress.push(`1 exercício Coursiv gerado (afterSection: ${coursivTargetIdx}, ${blanksFinal} lacunas inline, quality: PASSED)`);
        } else {
          // Coursiv é OBRIGATÓRIO no V8-C01
          const errorMsg = `COURSIV HARD FAIL: AI returned empty or null coursiv result for section ${coursivTargetIdx}`;
          console.error(`[v8-generate] ${errorMsg}`);
          throw new Error(errorMsg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Coursiv generation failed";
        // HARD FAIL deve propagar
        if (msg.includes('HARD FAIL')) {
          throw err;
        }
        errors.push(`Coursiv: ${msg}`);
        console.error("[v8-generate-lesson-content] Coursiv generation error:", msg);
      }
    }

    // ── 3.1 Phase 9: Generate ONE playground at LAST section only (no intermediate playgrounds) ──
    let generatedPlaygrounds: any[] = [];
    {
      const hasManualAtLast = manualPlaygrounds.some((p: any) => p.afterSectionIndex === lastIdx);

      // Force all manual playgrounds to last section
      for (const mp of manualPlaygrounds) {
        if (mp.afterSectionIndex !== lastIdx) {
          console.log(`[v8-generate] Phase 9: Moving manual playground from section ${mp.afterSectionIndex} → ${lastIdx}`);
          mp.afterSectionIndex = lastIdx;
        }
      }

      if (!hasManualAtLast && manualPlaygrounds.length === 0 && sections.length >= 4) {
        // Generate ONE playground for the final section
        progress.push("Gerando playground final...");
        try {
          const lastSectionContent = `Seção ${lastIdx} (index ${lastIdx}): ${sections[lastIdx].title}\n${sections[lastIdx].content?.slice(0, 500) || ""}`;

          const pgResult = await callAI(
            LOVABLE_API_KEY,
            PLAYGROUND_SYSTEM_PROMPT,
            `Gere UM playground para a última seção desta aula "${lessonTitle}":\n\n${lastSectionContent}\n\nÍndice obrigatório para afterSectionIndex: ${lastIdx}`,
            PLAYGROUND_TOOLS,
            "generate_inline_playgrounds",
          );

          const rawPg = (pgResult.playgrounds || [])[0];
          if (rawPg) {
            rawPg.afterSectionIndex = lastIdx; // Force last section
            rawPg.id = `playground-gen-final`;
            const sanitized = sanitizeFields(rawPg, ['title', 'instruction', 'narration', 'amateurPrompt', 'professionalPrompt', 'amateurResult', 'professionalResult', 'successMessage', 'tryAgainMessage']);
            generatedPlaygrounds.push(sanitized);
            progress.push("1 playground final gerado");
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Playground generation failed";
          errors.push(`Playground: ${msg}`);
          console.error("[v8-generate-lesson-content] Playground generation error:", msg);
        }

        // Fallback placeholder if generation failed
        if (generatedPlaygrounds.length === 0) {
          console.warn(`[v8-generate] Phase 9: Playground generation failed. Adding placeholder at last section ${lastIdx}`);
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

      // Resolve quiz conflict at lastIdx
      const allPg = [...manualPlaygrounds, ...generatedPlaygrounds];
      const allQuizzesForConflict = [...(manualQuizzes || []), ...generatedQuizzes];
      const quizAtLast = allQuizzesForConflict.find((q: any) => q.afterSectionIndex === lastIdx);
      if (quizAtLast && allPg.some((p: any) => p.afterSectionIndex === lastIdx)) {
        const freeSection = Array.from({ length: lastIdx }, (_, i) => lastIdx - 1 - i)
          .find(i => i >= 2
            && !allQuizzesForConflict.some((q: any) => q !== quizAtLast && q.afterSectionIndex === i)
            && !allPg.some((p: any) => p.afterSectionIndex === i));
        if (freeSection !== undefined) {
          console.log(`[v8-generate] Phase 9: Moving quiz from section ${lastIdx} → ${freeSection}`);
          quizAtLast.afterSectionIndex = freeSection;
        }
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
            title: sanitizeV8Text(ins.title || ''),
            insightText: sanitizeV8Text(ins.insightText || ''),
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
      inlineCompleteSentences: generatedCoursivSentences,
      inlineExercises: generatedInlineExercises,
      exercises: generatedExercises,
      progress,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`[v8-generate-lesson-content] Done: ${allQuizzes.length} quizzes, ${allPlaygrounds.length} playgrounds, ${generatedInlineExercises.length} inline exercises, ${generatedExercises.length} final exercises, ${imageResults.filter(r => r.imageUrl).length} images`);

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
