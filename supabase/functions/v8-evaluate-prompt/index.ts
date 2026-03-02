import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TIMEOUT_MS = 10_000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ─── AUTH: verify JWT ───
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResp({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const token = authHeader.replace('Bearer ', '');
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!userRes.ok) {
      await userRes.text();
      return jsonResp({ error: 'Invalid token' }, 401);
    }

    // User is authenticated — proceed
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { mode } = body;

    let messages: Array<{ role: string; content: string }>;

    if (mode === "generate-result") {
      const { prompt } = body;
      if (!prompt?.trim()) return jsonResp({ error: "prompt is required" }, 400);

      messages = [
        {
          role: "system",
          content: "Você é um assistente de IA. Responda ao prompt do usuário de forma concisa (máximo 150 palavras). Responda em português brasileiro.",
        },
        { role: "user", content: prompt },
      ];
    } else if (mode === "evaluate") {
      const { userPrompt, evaluationCriteria, rubric, maxScore } = body;
      if (!userPrompt?.trim()) return jsonResp({ error: "userPrompt is required" }, 400);

      const criteriaText = (evaluationCriteria || []).map((c: string, i: number) => `${i + 1}. ${c}`).join("\n");
      const rubricText = rubric
        ? rubric.map((r: { criterion: string; points: number }) => `- ${r.criterion}: ${r.points}pts`).join("\n")
        : "";

      messages = [
        {
          role: "system",
          content: `Você é um professor de prompts de IA — didático, encorajador e exigente. Avalie o prompt do usuário usando os critérios abaixo.

Critérios de avaliação:
${criteriaText}

${rubricText ? `Rubrica:\n${rubricText}` : ""}

Pontuação máxima: ${maxScore || 100}

Responda EXATAMENTE neste formato JSON (sem markdown, sem backticks):
{
  "score": <número de 0 a ${maxScore || 100}>,
  "verdict": "<frase curta motivacional, ex: 'Você está quase lá!' ou 'Excelente trabalho!'>",
  "feedback": "<resumo de 1-2 frases: o que funcionou e o que faltou>",
  "criteriaBreakdown": [
    {"criterion": "<nome do critério>", "met": <true|false>, "detail": "<explicação clara do que o usuário fez certo OU o que faltou, com exemplo concreto>"}
  ],
  "suggestions": [
    "<ação concreta com texto exato que o usuário pode copiar e adicionar ao prompt>"
  ],
  "improvedExample": "<versão melhorada do prompt DO USUÁRIO (não genérico), aplicando todas as correções>"
}

REGRAS OBRIGATÓRIAS:
1. criteriaBreakdown DEVE ter um item para CADA critério listado acima
2. Para critérios NÃO atendidos: explique O QUE faltou, POR QUE é importante, e dê EXEMPLO do que adicionar
3. Para critérios atendidos: elogie especificamente O QUE o usuário fez bem
4. suggestions deve conter frases EXATAS que o usuário pode copiar e colar no prompt dele
5. improvedExample deve ser o prompt DO USUÁRIO reescrito com as melhorias aplicadas (não invente um prompt diferente)
6. verdict deve ser encorajador — nunca seco ou genérico
7. Responda em português brasileiro
8. O JSON deve ser válido, sem trailing commas`,
        },
        { role: "user", content: `Prompt para avaliar: "${userPrompt}"` },
      ];
    } else {
      return jsonResp({ error: "Invalid mode. Use 'generate-result' or 'evaluate'" }, 400);
    }

    // ─── Call AI with timeout ───
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.error("[v8-evaluate-prompt] Timeout after", TIMEOUT_MS, "ms");
        return jsonResp({ error: "AI request timed out. Try again.", score: 0, feedback: "Timeout — tente novamente." }, 504);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResp({ error: "Rate limit exceeded. Try again later." }, 429);
      }
      if (response.status === 402) {
        return jsonResp({ error: "Payment required." }, 402);
      }
      const errText = await response.text();
      throw new Error(`AI gateway error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    if (mode === "generate-result") {
      return jsonResp({ result: content });
    }

    // Parse structured evaluation response — balanced brace parser
    try {
      const startIdx = content.indexOf('{');
      if (startIdx !== -1) {
        let depth = 0;
        let endIdx = -1;
        for (let i = startIdx; i < content.length; i++) {
          if (content[i] === '{') depth++;
          else if (content[i] === '}') {
            depth--;
            if (depth === 0) { endIdx = i; break; }
          }
        }
        if (endIdx !== -1) {
          const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
          return jsonResp({
            score: parsed.score ?? 50,
            verdict: parsed.verdict || "",
            feedback: parsed.feedback || "",
            criteriaBreakdown: parsed.criteriaBreakdown || [],
            suggestions: parsed.suggestions || [],
            improvedExample: parsed.improvedExample || "",
          });
        }
      }
    } catch {
      // Fallback below
    }

    return jsonResp({ score: 50, feedback: "Avaliação indisponível. Tente novamente.", verdict: "Tente novamente", criteriaBreakdown: [], suggestions: [], improvedExample: "" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[v8-evaluate-prompt] Error:", msg);
    return jsonResp({ error: msg }, 500);
  }
});

function jsonResp(body: Record<string, unknown>, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
