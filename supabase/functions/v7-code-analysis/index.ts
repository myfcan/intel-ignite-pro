import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  userCode: string;
  expectedCode: string;
  context: string;
  language: string;
}

interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  line?: number;
  message: string;
  fix?: string;
}

interface AnalysisResponse {
  score: number;
  issues: CodeIssue[];
  summary: string;
  improvements: string[];
  isCorrect: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userCode, expectedCode, context, language } = await req.json() as AnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um analisador de código especializado em ensino. Analise o código do aluno comparando com o código esperado.

Contexto da lição: ${context}
Linguagem: ${language}

Retorne APENAS um JSON válido (sem markdown, sem código fence) com esta estrutura exata:
{
  "score": <número de 0 a 100>,
  "issues": [
    {
      "type": "error" | "warning" | "suggestion",
      "line": <número da linha ou null>,
      "message": "<descrição clara do problema>",
      "fix": "<sugestão de correção>"
    }
  ],
  "summary": "<resumo em 1-2 frases do que está certo e errado>",
  "improvements": ["<melhoria 1>", "<melhoria 2>"],
  "isCorrect": <true se o código está funcionalmente correto>
}

Seja encorajador mas honesto. Foque em aprendizado, não em crítica.`;

    const userPrompt = `CÓDIGO DO ALUNO:
\`\`\`${language}
${userCode}
\`\`\`

CÓDIGO ESPERADO:
\`\`\`${language}
${expectedCode}
\`\`\`

Analise o código do aluno e retorne o JSON de análise.`;

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let analysis: AnalysisResponse;
    try {
      // Remove any markdown code fences if present
      const cleanContent = content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback response
      analysis = {
        score: 50,
        issues: [{
          type: 'suggestion',
          message: 'Não foi possível analisar o código completamente. Continue praticando!'
        }],
        summary: 'Análise parcial disponível.',
        improvements: ['Continue praticando para melhorar'],
        isCorrect: false
      };
    }

    console.log("Code analysis completed:", { score: analysis.score, issueCount: analysis.issues.length });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in v7-code-analysis:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
