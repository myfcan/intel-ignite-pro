import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ENRICHMENT_SYSTEM_PROMPT = `Você é um especialista em UI/UX que enriquece frames JSON de tutoriais interativos.

Cada frame representa uma tela de um app real (Make.com, Google Sheets, Calendly, Bland AI, etc).
Seu trabalho é enriquecer o JSON adicionando elements que simulem a interface REAL do app.

REGRAS:
1. Use APENAS os 15 types disponíveis: chrome_header, text, input, select, button, warning, nav_breadcrumb, dependency, celebration, tooltip_term, image, table, code_block, divider, shimmer
2. Use as cores REAIS do app no bar_color (ex: Make.com = #6366F1, Google Sheets = #0F9D58, Calendly = #006BFF)
3. Use nomes de campos, botões e URLs REAIS do app
4. Máximo 12 elements por frame
5. Preserve TODOS os campos existentes (bar_text, bar_sub, bar_color, tip, action, check)
6. Retorne APENAS o JSON do frame enriquecido, sem explicação, sem markdown, sem code fences

EXEMPLOS DE FRAMES ENRIQUECIDOS:

Exemplo 1 — Google Sheets:
{"bar_text":"sheets.google.com","bar_sub":"SDR Leads","bar_color":"#0F9D58","elements":[{"type":"chrome_header","url":"sheets.google.com/spreadsheets/d/abc123"},{"type":"table","headers":["Timestamp","Nome","Telefone","Email","Interesse","Consentimento"],"rows":[["13/03 14:30","Maria Teste","27999887766","teste@email.com","Saber mais","Aceito receber uma ligação"]]},{"type":"celebration","text":"Formulário → Planilha funcionando!","next":"Agora vamos criar a automação no Make."}]}

Exemplo 2 — Google Forms:
{"bar_text":"docs.google.com","bar_sub":"Novo formulário","bar_color":"#7C3AED","elements":[{"type":"chrome_header","url":"docs.google.com/forms/d/new"},{"type":"text","content":"Captação de Leads — SDR IA"},{"type":"input","label":"Nome completo","placeholder":"Resposta curta","highlight":false},{"type":"input","label":"Telefone com DDD","placeholder":"Ex: 27999887766","highlight":false},{"type":"input","label":"Email","placeholder":"Resposta curta","highlight":false},{"type":"warning","text":"⚠️ Obrigatório: Adicione um campo de consentimento (checkbox)"}]}

Exemplo 3 — Make.com (editor de cenário):
{"bar_text":"make.com","bar_sub":"Editor de cenário","bar_color":"#6366F1","elements":[{"type":"chrome_header","url":"make.com/scenarios/1/edit"},{"type":"dependency","text":"Usando o cenário que você criou no passo 8."},{"type":"text","content":"Adicionar módulo Google Sheets"},{"type":"nav_breadcrumb","from":"Cenário vazio","to":"Buscar módulo","how":"Clique no + no centro → Digite 'Google Sheets' na busca"},{"type":"button","label":"+ Adicionar módulo","primary":true,"icon":"➕"}]}

Exemplo 4 — Bland AI:
{"bar_text":"app.bland.ai","bar_sub":"Settings → API Keys","bar_color":"#1E293B","elements":[{"type":"chrome_header","url":"app.bland.ai/dashboard/settings"},{"type":"tooltip_term","term":"API Key","tip":"Senha de acesso entre apps — como a senha do Wi-Fi: sem ela, ninguém conecta"},{"type":"nav_breadcrumb","from":"Dashboard","to":"Settings → API Keys","how":"Menu lateral esquerdo → clique em Settings → aba API Keys no topo"},{"type":"table","headers":["Name","Key"],"rows":[["Default","org_e6b9...435 ← truncada!"]]},{"type":"warning","text":"A key na tabela aparece CORTADA. Você precisa criar uma nova pra conseguir copiar."},{"type":"button","label":"+ New API Key","primary":true,"icon":"🔑"}]}

Exemplo 5 — Make.com (HTTP com JSON):
{"bar_text":"make.com","bar_sub":"Módulo HTTP","bar_color":"#6366F1","elements":[{"type":"chrome_header","url":"make.com/scenarios/1/edit"},{"type":"dependency","text":"A URL é do Bland AI (conta do passo 2). POST = enviar pedido de ligação."},{"type":"input","label":"URL","value":"https://api.bland.ai/v1/calls","highlight":true},{"type":"select","label":"Method","options":["GET","POST","PUT"],"selected":1,"highlight":true},{"type":"select","label":"Body type","options":["Raw","Form data","Multipart"],"selected":0},{"type":"code_block","language":"json","content":"{\\n  \\"phone_number\\": \\"+5527999887766\\",\\n  \\"task\\": \\"Ligar para o lead...\\",\\n  \\"language\\": \\"pt\\"\\n}"}]}

Exemplo 6 — Make.com (filtro):
{"bar_text":"make.com","bar_sub":"Filtro","bar_color":"#6366F1","elements":[{"type":"chrome_header","url":"make.com/scenarios/1/edit"},{"type":"dependency","text":"O valor do filtro vem do checkbox de consentimento do passo 4."},{"type":"input","label":"Label","value":"Consentimento OK","highlight":true},{"type":"select","label":"Campo","options":["-- Select --","Consentimento para contato"],"selected":1,"highlight":true},{"type":"select","label":"Operador","options":["Equal to","Contains","Starts with"],"selected":1,"highlight":true},{"type":"input","label":"Valor","value":"Aceito","highlight":true},{"type":"warning","text":"Use Contains (não Equal to). O Forms retorna o texto como array."}]}`;

function needsEnrichment(frame: any): boolean {
  if (frame.enriched === true) return false;
  const contentTypes = ['input', 'select', 'button', 'table', 'code_block', 'image'];
  const contentElements = (frame.elements || []).filter((e: any) => contentTypes.includes(e.type));
  return contentElements.length < 2;
}

async function enrichFrame(
  frame: any,
  stepTitle: string,
  stepDescription: string,
  appName: string
): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const userPrompt = `Enriqueça este frame JSON de um passo de tutorial:

Passo: "${stepTitle}"
Descrição: "${stepDescription || 'N/A'}"
Ferramenta/App: "${appName || frame.bar_text || 'app'}"
Tela: "${frame.bar_sub || 'tela principal'}"

Frame atual:
${JSON.stringify(frame, null, 2)}

Enriqueça com elements que representem a tela REAL do app "${appName || frame.bar_text}".
Retorne APENAS o JSON do frame enriquecido.`;

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: ENRICHMENT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[v10-generate-mockups] AI error: ${response.status}`, errText);

      if (response.status === 429) {
        if (attempt < MAX_RETRIES - 1) {
          console.log(`[v10-generate-mockups] Rate limited, waiting 5s...`);
          await delay(5000);
          continue;
        }
        throw new Error("Rate limit exceeded. Try again in a few seconds.");
      }
      if (response.status === 402) {
        throw new Error("Credits exhausted. Add funds in Settings → Workspace → Usage.");
      }
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      lastError = "AI returned empty content";
      if (attempt < MAX_RETRIES - 1) {
        await delay(2000);
        continue;
      }
      throw new Error(lastError);
    }

    // Clean markdown fences if present
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    try {
      const enrichedFrame = JSON.parse(jsonStr);

      // Validate it has elements array
      if (!enrichedFrame.elements || !Array.isArray(enrichedFrame.elements)) {
        throw new Error("Enriched frame missing elements array");
      }

      // Preserve critical fields from original
      enrichedFrame.tip = enrichedFrame.tip ?? frame.tip;
      enrichedFrame.action = enrichedFrame.action ?? frame.action;
      enrichedFrame.check = enrichedFrame.check ?? frame.check;
      enrichedFrame.enriched = true;

      return enrichedFrame;
    } catch (parseErr) {
      lastError = `JSON parse failed: ${(parseErr as Error).message}`;
      console.warn(`[v10-generate-mockups] Attempt ${attempt + 1}: ${lastError}`);
      if (attempt < MAX_RETRIES - 1) {
        await delay(2000);
        continue;
      }
    }
  }

  throw new Error(`Enrichment failed after ${MAX_RETRIES} attempts. Last: ${lastError}`);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      pipeline_id,
      batch_size = 5,
      batch_index = 0,
    } = await req.json();

    if (!pipeline_id) {
      return new Response(
        JSON.stringify({ error: "pipeline_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from("v10_bpa_pipeline")
      .select("*")
      .eq("id", pipeline_id)
      .single();

    if (pipelineError || !pipeline) {
      return new Response(
        JSON.stringify({ error: "Pipeline not found", details: pipelineError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonId = (pipeline as any).lesson_id;
    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: "Pipeline has no lesson_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch lesson steps
    const { data: steps, error: stepsError } = await supabase
      .from("v10_lesson_steps")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("step_number", { ascending: true });

    if (stepsError || !steps) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch steps", details: stepsError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Collect frames needing enrichment (NOT mockup_url — elements check)
    const framesToProcess: Array<{
      step: any;
      stepIdx: number;
      frameIdx: number;
      frame: any;
    }> = [];

    for (let si = 0; si < steps.length; si++) {
      const step = steps[si] as any;
      const frames = step.frames || [];
      for (let fi = 0; fi < frames.length; fi++) {
        if (needsEnrichment(frames[fi])) {
          framesToProcess.push({ step, stepIdx: si, frameIdx: fi, frame: frames[fi] });
        }
      }
    }

    const total = framesToProcess.length;
    console.log(`[v10-generate-mockups] ${total} frames need enrichment out of ${steps.length} steps`);

    // 4. Apply batching
    const startIdx = batch_index * batch_size;
    const batchFrames = framesToProcess.slice(startIdx, startIdx + batch_size);
    const hasMoreBatches = startIdx + batch_size < total;

    console.log(`[v10-generate-mockups] Batch ${batch_index}: enriching ${batchFrames.length} frames`);

    let success = 0;
    let failed = 0;

    // 5. Process each frame — enrich JSON, NO image generation
    for (const { step, frameIdx } of batchFrames) {
      try {
        const frame = step.frames[frameIdx];
        console.log(`[v10-generate-mockups] Enriching step ${step.step_number}, frame ${frameIdx}...`);

        const enrichedFrame = await enrichFrame(
          frame,
          step.title,
          step.description || "",
          step.app_name || frame.bar_text || ""
        );

        // Update frame in step's frames array
        const updatedFrames = [...(step.frames || [])];
        updatedFrames[frameIdx] = enrichedFrame;

        const { error: updateError } = await supabase
          .from("v10_lesson_steps")
          .update({ frames: updatedFrames })
          .eq("id", step.id);

        if (updateError) {
          console.error(`[v10-generate-mockups] Failed to update step:`, updateError);
        }

        // Update local reference for subsequent frames of same step
        step.frames = updatedFrames;
        success++;

        await delay(1500);
      } catch (err) {
        console.error(`[v10-generate-mockups] Failed step ${step.step_number}, frame ${frameIdx}:`, err);
        failed++;

        await supabase.from("v10_bpa_pipeline_log").insert({
          pipeline_id,
          stage: 3,
          action: "enrich-frames:error",
          details: { message: `Step ${step.step_number}, frame ${frameIdx}: ${(err as Error).message}` },
        });

        await delay(1000);
      }
    }

    // 6. Update pipeline counters
    const totalFramesAll = (steps as any[]).reduce((sum, s) => {
      return sum + ((s.frames || []) as any[]).length;
    }, 0);

    const totalEnriched = (steps as any[]).reduce((sum, s) => {
      return sum + ((s.frames || []) as any[]).filter(
        (f: any) => f.enriched === true || (f.elements && f.elements.length >= 3)
      ).length;
    }, 0);

    await supabase
      .from("v10_bpa_pipeline")
      .update({ mockups_total: totalFramesAll })
      .eq("id", pipeline_id);

    // 7. Log completion
    await supabase.from("v10_bpa_pipeline_log").insert({
      pipeline_id,
      stage: 3,
      action: "enrich-frames:completed",
      details: {
        message: `Batch ${batch_index}: ${success} enriched, ${failed} failed out of ${batchFrames.length} frames (total needing enrichment: ${total})`,
        total_frames: totalFramesAll,
        total_enriched: totalEnriched,
      },
    });

    const stats = {
      total,
      processed: batchFrames.length,
      success,
      failed,
      hasMoreBatches,
    };

    console.log(`[v10-generate-mockups] Done: ${JSON.stringify(stats)}`);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[v10-generate-mockups] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
