import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_TIMEOUT_MS = 110_000;
const DEFAULT_CHUNK_SIZE = 3;
const MAX_CHUNK_SIZE = 5;
const MAX_COMPLETION_RETRIES = 1;

type TimingMap = Record<string, number>;

const PHASE_MAP: Record<string, number> = {
  "setup": 1, "preparação": 1, "preparacao": 1, "início": 1, "inicio": 1,
  "conceitos": 1, "fundamentos": 1,
  "construção": 2, "construcao": 2, "desenvolvimento": 2, "execução": 2,
  "execucao": 2, "prática": 2, "pratica": 2,
  "teste": 3, "validação": 3, "validacao": 3, "verificação": 3,
  "verificacao": 3, "conclusão": 3, "conclusao": 3, "aplicação": 3, "aplicacao": 3,
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(numeric)));
}

function extractStepsArray(rawContent: string): any[] {
  const cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.steps)) return parsed.steps;
  } catch { /* fallback */ }
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    const parsed = JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
    if (Array.isArray(parsed)) return parsed;
  }
  throw new Error("AI response is not a JSON array");
}

function normalizePhase(phase: unknown): number {
  if (typeof phase === "number" && phase >= 1 && phase <= 3) return phase;
  if (typeof phase === "string") return PHASE_MAP[phase.toLowerCase().trim()] ?? 1;
  return 1;
}

async function timed<T>(timings: TimingMap, key: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try { return await fn(); }
  finally { timings[key] = (timings[key] ?? 0) + (Date.now() - start); }
}

// --- SEGMENTAÇÃO DE INSTRUÇÕES POR CHUNK ---
function extractInstructionsForChunk(fullInstructions: string, chunkStart: number, chunkEnd: number): string {
  if (!fullInstructions || fullInstructions.length < 200) return fullInstructions;

  const lines = fullInstructions.split("\n");
  const headerLines: string[] = [];
  const stepBlocks: Map<number, string[]> = new Map();
  let currentStepNum = -1;
  let inStepBlock = false;

  // Regex to match "Passo N:", "PASSO N:", "Passo N —", etc.
  const stepRegex = /^\s*(?:Passo|PASSO|Step)\s+(\d+)\s*[:\-—]/i;
  // Regex to match phase headers like "FASE 1 —" 
  const phaseRegex = /^\s*(?:FASE|PHASE|ETAPA)\s+\d+/i;

  for (const line of lines) {
    const stepMatch = line.match(stepRegex);
    if (stepMatch) {
      currentStepNum = parseInt(stepMatch[1]);
      inStepBlock = true;
      if (!stepBlocks.has(currentStepNum)) stepBlocks.set(currentStepNum, []);
      stepBlocks.get(currentStepNum)!.push(line);
    } else if (phaseRegex.test(line)) {
      // Phase headers — include if any step in this phase falls in our chunk
      // We'll include them as header context
      if (!inStepBlock) headerLines.push(line);
      else {
        // A new phase starts, reset step block tracking
        currentStepNum = -1;
        inStepBlock = false;
        headerLines.push(line);
      }
    } else if (inStepBlock && currentStepNum > 0) {
      stepBlocks.get(currentStepNum)!.push(line);
    } else {
      headerLines.push(line);
    }
  }

  // If we couldn't parse any step blocks, return truncated full instructions
  if (stepBlocks.size === 0) {
    // Hard cap: 3000 chars for non-parseable instructions
    return fullInstructions.length > 3000
      ? fullInstructions.slice(0, 3000) + "\n\n[...instruções truncadas para performance...]"
      : fullInstructions;
  }

  // Build segmented output: headers + only relevant step blocks
  const relevantSteps: string[] = [];
  for (let n = chunkStart; n <= chunkEnd; n++) {
    if (stepBlocks.has(n)) {
      relevantSteps.push(...stepBlocks.get(n)!);
    }
  }

  // Include surrounding context: 1 step before and after for continuity
  if (chunkStart > 1 && stepBlocks.has(chunkStart - 1)) {
    relevantSteps.unshift(`[Contexto do passo anterior para continuidade:]`, ...stepBlocks.get(chunkStart - 1)!);
  }

  // Compact headers: limit to 800 chars
  const headerText = headerLines.join("\n");
  const compactHeader = headerText.length > 800
    ? headerText.slice(0, 800) + "\n[...cabeçalho truncado...]"
    : headerText;

  return `${compactHeader}\n\n${relevantSteps.join("\n")}`;
}

async function callAiGateway(args: {
  apiKey: string;
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  timings: TimingMap;
  timingKey: string;
}): Promise<string> {
  const { apiKey, model, messages, timings, timingKey } = args;

  return await timed(timings, timingKey, async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
      });
      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`AI Gateway error (${aiResponse.status}): ${errorText}`);
      }
      const aiData = await aiResponse.json();
      const rawContent = aiData?.choices?.[0]?.message?.content;
      if (!rawContent || typeof rawContent !== "string") {
        throw new Error("No content returned from AI Gateway");
      }
      return rawContent;
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new Error(`AI timeout after ${AI_TIMEOUT_MS}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  });
}

function buildIntroSlides(args: {
  lessonId: string; pipelineTitle: string; stepsCount: number;
  estimatedMinutes: number; tools: string[];
}) {
  const { lessonId, pipelineTitle, stepsCount, estimatedMinutes, tools } = args;
  const introSlides: Array<Record<string, unknown>> = [];
  introSlides.push({
    lesson_id: lessonId, slide_order: 1, icon: "BookOpen", tool_name: null,
    tool_color: "#6366f1", title: pipelineTitle,
    subtitle: `${stepsCount} passos | ${estimatedMinutes} min`,
    description: `Bem-vindo! Nesta aula você vai aprender ${pipelineTitle.toLowerCase()}.`,
    label: "Introdução", appear_at_seconds: 0,
  });
  const toolColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  tools.forEach((tool, idx) => {
    introSlides.push({
      lesson_id: lessonId, slide_order: idx + 2, icon: "Wrench", tool_name: tool,
      tool_color: toolColors[idx % toolColors.length], title: tool,
      subtitle: "Ferramenta utilizada",
      description: `Você vai usar ${tool} nesta aula.`,
      label: "Ferramenta", appear_at_seconds: (idx + 1) * 3,
    });
  });
  introSlides.push({
    lesson_id: lessonId, slide_order: tools.length + 2, icon: "Rocket", tool_name: null,
    tool_color: "#10B981", title: "Vamos começar!",
    subtitle: "Tudo pronto para iniciar",
    description: "Clique em continuar para começar o tutorial.",
    label: "Início", appear_at_seconds: (tools.length + 1) * 3,
  });
  return introSlides;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startedAt = Date.now();
  const timings: TimingMap = {};
  let stage = "init";
  let pipelineId: string | null = null;
  let lessonId: string | null = null;
  let chunkStart = 0;
  let chunkEnd = 0;
  let requestedSteps = 0;

  // Helper to persist forensic log even on failure
  async function logForensic(supabase: any, action: string, details: Record<string, unknown>) {
    try {
      if (!pipelineId) return;
      await supabase.from("v10_bpa_pipeline_log").insert({
        pipeline_id: pipelineId, stage: 2, action, details,
      });
    } catch (e: any) {
      console.error("[v10-generate-steps] forensic log write failed:", e?.message ?? e);
    }
  }

  try {
    stage = "auth";
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await timed(timings, "auth_ms", async () => requireAdmin(req));
    if (authResult.error) return authResult.error;

    stage = "payload";
    const payload = await timed(timings, "parse_payload_ms", async () => req.json());
    const { pipeline_id, num_steps, instructions, trail_id, course_id, chunk_start, chunk_size, reset } = payload ?? {};
    pipelineId = pipeline_id;

    requestedSteps = clampInt(num_steps, 1, 200, 0);
    if (!pipeline_id || requestedSteps <= 0) {
      return new Response(
        JSON.stringify({ error: "pipeline_id and valid num_steps are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    chunkStart = clampInt(chunk_start, 1, requestedSteps, 1);
    const requestedChunkSize = clampInt(chunk_size, 1, MAX_CHUNK_SIZE, DEFAULT_CHUNK_SIZE);
    chunkEnd = Math.min(requestedSteps, chunkStart + requestedChunkSize - 1);
    const targetChunkSize = chunkEnd - chunkStart + 1;

    stage = "clients";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    stage = "fetch_pipeline";
    const { data: pipeline, error: pipelineError } = await timed(timings, "fetch_pipeline_ms", async () =>
      supabase.from("v10_bpa_pipeline").select("*").eq("id", pipeline_id).single()
    );
    if (pipelineError || !pipeline) {
      return new Response(
        JSON.stringify({ error: "Pipeline not found", details: pipelineError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    stage = "ensure_lesson";
    lessonId = pipeline.lesson_id as string | null;
    if (!lessonId) {
      const { data: lesson, error: lessonError } = await timed(timings, "create_lesson_ms", async () =>
        supabase.from("v10_lessons").insert({
          slug: pipeline.slug, title: pipeline.title, status: "draft",
          total_steps: 0, estimated_minutes: 0, tools: [], xp_reward: 0, order_in_trail: 0,
          ...(trail_id ? { trail_id } : {}), ...(course_id ? { course_id } : {}),
        }).select("id").single()
      );
      if (lessonError || !lesson) throw new Error(`Failed to create lesson: ${lessonError?.message}`);
      lessonId = lesson.id;
      await timed(timings, "attach_lesson_to_pipeline_ms", async () =>
        supabase.from("v10_bpa_pipeline").update({ lesson_id: lessonId }).eq("id", pipeline_id)
      );
    }

    // --- GAP D FIX: NO destructive reset. Use upsert per step_number ---
    // Only delete the specific chunk range we're about to regenerate (safe)
    stage = "cleanup_target_range";
    await timed(timings, "delete_chunk_range_ms", async () =>
      supabase.from("v10_lesson_steps").delete()
        .eq("lesson_id", lessonId)
        .gte("step_number", chunkStart)
        .lte("step_number", chunkEnd)
    );

    // Only delete intro slides on first chunk (they'll be rebuilt at completion)
    if (chunkStart === 1 && Boolean(reset)) {
      await timed(timings, "delete_intro_slides_ms", async () =>
        supabase.from("v10_lesson_intro_slides").delete().eq("lesson_id", lessonId)
      );
    }

    // --- LOG: chunk_start forensic ---
    await logForensic(supabase, "steps_generation_chunk_start", {
      lesson_id: lessonId, chunk_start: chunkStart, chunk_end: chunkEnd,
      target_chunk_size: targetChunkSize, requested_total: requestedSteps,
      instructions_length: (instructions || "").length,
      docs_length: (pipeline.docs_manual_input || "").length,
    });

    stage = "prompt";
    const { PROMPT_GENERATE_STEPS, postProcessC2C3, postProcessFrameDefaults, validateTools, validateStructure } =
      await timed(timings, "load_prompt_utils_ms", async () => import("../_shared/prompt-master.ts"));

    const declaredTools = Array.isArray(pipeline.tools)
      ? pipeline.tools.filter((t: unknown): t is string => typeof t === "string")
      : [];

    // --- GAP A FIX: Segment instructions per chunk ---
    const segmentedInstructions = extractInstructionsForChunk(instructions || "", chunkStart, chunkEnd);

    // --- GAP A FIX: Only send docs on first chunk, compact on subsequent ---
    const docsBlock = chunkStart === 1
      ? (pipeline.docs_manual_input || "Nenhuma documentação fornecida — use seu conhecimento sobre o app.")
      : (pipeline.docs_manual_input
          ? `[Resumo da documentação — ${pipeline.docs_manual_input.length} chars originais]: ${pipeline.docs_manual_input.slice(0, 500)}...`
          : "Sem docs.");

    const instructionsBlock = segmentedInstructions
      ? `\n\nINSTRUÇÕES DO INSTRUTOR (prioridade máxima — passos ${chunkStart} a ${chunkEnd}):\n${segmentedInstructions}\n`
      : "";

    const userMessage = `Gere APENAS os passos ${chunkStart} até ${chunkEnd} (total ${targetChunkSize} passos) para a aula "${pipeline.title}" (slug: ${pipeline.slug}).

Ferramentas declaradas: ${declaredTools.length > 0 ? declaredTools.join(", ") : "Detectar automaticamente do contexto"}

Documentação/notas do instrutor:
${docsBlock}
${instructionsBlock}
REGRAS CRÍTICAS:
- Use APENAS ferramentas declaradas (exceto último passo AILIV quando aplicável no fim total).
- step_number deve ser absoluto (ex: ${chunkStart}, ${chunkStart + 1}...).
- 1 passo = 1 ação atômica.
- Descrição >30 chars com termos técnicos.
- Inclua frames com action e check.

Retorne APENAS o JSON array dos ${targetChunkSize} passos solicitados.`;

    // Record prompt sizes for telemetry
    timings._prompt_system_chars = PROMPT_GENERATE_STEPS.length;
    timings._prompt_user_chars = userMessage.length;

    const aiModel = "openai/gpt-5";

    stage = "ai_initial";
    let chunkSteps: any[];
    let aiCallSucceeded = false;

    try {
      const initialRaw = await callAiGateway({
        apiKey: lovableApiKey, model: aiModel,
        messages: [
          { role: "system", content: PROMPT_GENERATE_STEPS },
          { role: "user", content: userMessage },
        ],
        timings, timingKey: "ai_call_initial_ms",
      });
      stage = "ai_parse_initial";
      chunkSteps = await timed(timings, "ai_parse_initial_ms", async () => extractStepsArray(initialRaw));
      aiCallSucceeded = true;
    } catch (aiError: any) {
      const isTimeout = aiError?.message?.includes("timeout");

      // --- GAP B FIX: Return structured retryable error, not generic 500 ---
      timings.total_ms = Date.now() - startedAt;

      await logForensic(supabase, "steps_generation_chunk_failed", {
        lesson_id: lessonId, chunk_start: chunkStart, chunk_end: chunkEnd,
        target_chunk_size: targetChunkSize, requested_total: requestedSteps,
        error: aiError?.message, error_type: isTimeout ? "ai_timeout" : "ai_error",
        stage, ai_model: aiModel, timings,
        prompt_system_chars: PROMPT_GENERATE_STEPS.length,
        prompt_user_chars: userMessage.length,
        instructions_length: (instructions || "").length,
        docs_length: (pipeline.docs_manual_input || "").length,
      });

      const statusCode = isTimeout ? 408 : 502;
      return new Response(
        JSON.stringify({
          error: aiError?.message ?? String(aiError),
          error_type: isTimeout ? "ai_timeout" : "ai_error",
          retryable: true,
          retry_hint: isTimeout ? "reduce_chunk_size" : "retry_same",
          stage,
          chunk: { start: chunkStart, end: chunkEnd, requested: targetChunkSize },
          prompt_sizes: {
            system_chars: PROMPT_GENERATE_STEPS.length,
            user_chars: userMessage.length,
          },
          timings,
        }),
        { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Completion retry if AI returned fewer steps than expected
    for (let retry = 0; retry < MAX_COMPLETION_RETRIES && chunkSteps.length < targetChunkSize; retry++) {
      const missing = targetChunkSize - chunkSteps.length;
      const completionMessage = `Você retornou ${chunkSteps.length} passos, mas eu pedi ${targetChunkSize}.\nFaltam ${missing} passos no intervalo ${chunkStart}-${chunkEnd}.\nRetorne APENAS um JSON array com os passos faltantes.`;
      stage = `ai_completion_retry_${retry + 1}`;
      try {
        const completionRaw = await callAiGateway({
          apiKey: lovableApiKey, model: aiModel,
          messages: [
            { role: "system", content: PROMPT_GENERATE_STEPS },
            { role: "user", content: userMessage },
            { role: "assistant", content: JSON.stringify(chunkSteps) },
            { role: "user", content: completionMessage },
          ],
          timings, timingKey: `ai_call_completion_retry_${retry + 1}_ms`,
        });
        const completionSteps = extractStepsArray(completionRaw);
        if (completionSteps.length > 0) chunkSteps = [...chunkSteps, ...completionSteps];
      } catch (retryErr: any) {
        console.warn(`[v10-generate-steps] completion retry ${retry + 1} failed:`, retryErr?.message);
      }
    }

    if (!Array.isArray(chunkSteps) || chunkSteps.length === 0) {
      throw new Error("AI retornou zero passos para o chunk solicitado");
    }
    if (chunkSteps.length > targetChunkSize) chunkSteps = chunkSteps.slice(0, targetChunkSize);

    stage = "post_process";
    const c2c3Result = await timed(timings, "post_process_c2c3_ms", async () => postProcessC2C3(chunkSteps));
    await timed(timings, "post_process_defaults_ms", async () => { postProcessFrameDefaults(chunkSteps); return null; });

    for (const step of chunkSteps) {
      if (!Array.isArray(step.frames) || step.frames.length === 0) {
        step.frames = [{
          bar_text: step.app_name || "app", bar_sub: step.title || "Tela principal",
          bar_color: step.accent_color || "#6366F1", elements: [], action: "", check: "",
        }];
      }
    }

    const v1Result = await timed(timings, "validate_tools_ms", async () => validateTools(chunkSteps, declaredTools));
    if (!v1Result.passed && declaredTools.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Validação V1 falhou — passos usam ferramentas não declaradas",
          errors: v1Result.errors, stage, timings,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rows = chunkSteps.map((step: any, index: number) => {
      const absoluteStepNumber = chunkStart + index;
      const title = typeof step.title === "string" && step.title.trim() ? step.title.trim() : `Passo ${absoluteStepNumber}`;
      const slug = (step.slug || title).toString().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
      const phase = normalizePhase(step.phase_number ?? step.phase);
      const progressPercent = Math.round((100 / requestedSteps) * absoluteStepNumber);
      const liv = step.liv && typeof step.liv === "object"
        ? { tip: step.liv.tip ?? "", analogy: step.liv.analogy ?? "", sos: step.liv.sos ?? "" }
        : { tip: "", analogy: "", sos: "" };
      return {
        lesson_id: lessonId, step_number: absoluteStepNumber, slug, title,
        description: typeof step.description === "string" ? step.description : "",
        phase, app_name: typeof step.app_name === "string" ? step.app_name : null,
        app_icon: typeof step.app_icon === "string" ? step.app_icon : null,
        duration_seconds: typeof step.duration_seconds === "number" && step.duration_seconds > 0 ? step.duration_seconds : 30,
        frames: Array.isArray(step.frames) ? step.frames : [],
        liv, warnings: step.warnings && typeof step.warnings === "object" ? step.warnings : null,
        app_badge_bg: typeof step.app_badge_bg === "string" ? step.app_badge_bg : "#EEF2FF",
        app_badge_color: typeof step.app_badge_color === "string" ? step.app_badge_color : "#6366F1",
        accent_color: typeof step.accent_color === "string" ? step.accent_color : "#6366F1",
        progress_percent: progressPercent,
      };
    });

    stage = "insert_chunk";
    const { error: insertError } = await timed(timings, "insert_chunk_ms", async () =>
      supabase.from("v10_lesson_steps").insert(rows)
    );
    if (insertError) throw new Error(`Failed to insert chunk ${chunkStart}-${chunkEnd}: ${insertError.message}`);

    stage = "fetch_all_steps";
    const { data: allStepsData, error: allStepsError } = await timed(timings, "fetch_all_steps_ms", async () =>
      supabase.from("v10_lesson_steps").select("*").eq("lesson_id", lessonId).order("step_number", { ascending: true })
    );
    if (allStepsError) throw new Error(`Failed to fetch all lesson steps: ${allStepsError.message}`);

    const allSteps = (allStepsData ?? []) as any[];
    let generatedCount = allSteps.length;

    if (generatedCount > requestedSteps) {
      await timed(timings, "trim_extra_steps_ms", async () =>
        supabase.from("v10_lesson_steps").delete().eq("lesson_id", lessonId).gt("step_number", requestedSteps)
      );
      generatedCount = requestedSteps;
    }

    const completed = generatedCount >= requestedSteps;
    let estimatedMinutes: number | null = null;
    let tools: string[] = [];
    let v3Warnings: string[] = [];

    stage = "update_pipeline_progress";
    await timed(timings, "update_pipeline_steps_ms", async () =>
      supabase.from("v10_bpa_pipeline").update({ steps_generated: generatedCount }).eq("id", pipeline_id)
    );

    if (completed) {
      stage = "finalize_lesson";
      const finalSteps = allSteps
        .filter((s) => typeof s.step_number === "number" && s.step_number <= requestedSteps)
        .sort((a, b) => a.step_number - b.step_number);

      const totalDurationSeconds = finalSteps.reduce((sum: number, step: any) => sum + (step.duration_seconds || 0), 0);
      estimatedMinutes = Math.ceil(totalDurationSeconds / 60);

      tools = Array.from(new Set(
        finalSteps.map((step: any) => (typeof step.app_name === "string" ? step.app_name.trim() : ""))
          .filter((name: string) => Boolean(name) && name !== "AILIV")
      ));

      const description = `Aula prática de ${pipeline.title} com ${requestedSteps} passos interativos. Ferramentas: ${tools.join(", ") || "diversas"}. Duração estimada: ${estimatedMinutes} minutos.`;

      await timed(timings, "update_lesson_metadata_ms", async () =>
        supabase.from("v10_lessons").update({
          total_steps: requestedSteps, estimated_minutes: estimatedMinutes, description, tools,
        }).eq("id", lessonId)
      );

      const introSlides = buildIntroSlides({
        lessonId: lessonId!, pipelineTitle: pipeline.title,
        stepsCount: requestedSteps, estimatedMinutes, tools,
      });

      await timed(timings, "refresh_intro_slides_ms", async () => {
        await supabase.from("v10_lesson_intro_slides").delete().eq("lesson_id", lessonId);
        if (introSlides.length > 0) await supabase.from("v10_lesson_intro_slides").insert(introSlides);
        return null;
      });

      const v3Result = await timed(timings, "validate_structure_ms", async () => validateStructure(finalSteps));
      if (!v3Result.passed) {
        v3Warnings = v3Result.errors;
        console.warn(`[v10-generate-steps] V3 validation warnings: ${v3Warnings.join("; ")}`);
      }
      console.log(`[v10-generate-steps] Completion OK ${requestedSteps}/${requestedSteps} steps`);
    }

    // --- GAP C FIX: Forensic log on success ---
    stage = "forensic_log";
    await logForensic(supabase, "steps_generation_chunk", {
      lesson_id: lessonId, chunk_start: chunkStart, chunk_end: chunkEnd,
      chunk_target: targetChunkSize, chunk_inserted: rows.length,
      generated_total: generatedCount, requested_total: requestedSteps,
      completed, ai_model: aiModel,
      c2_fixes: c2c3Result.c2Fixes, c3_fixes: c2c3Result.c3Fixes,
      timings, warnings: v3Warnings,
      prompt_system_chars: timings._prompt_system_chars,
      prompt_user_chars: timings._prompt_user_chars,
    });

    timings.total_ms = Date.now() - startedAt;
    console.log(`[v10-generate-steps] chunk ${chunkStart}-${chunkEnd} done in ${timings.total_ms}ms (generated ${generatedCount}/${requestedSteps})`);

    return new Response(
      JSON.stringify({
        success: true, lesson_id: lessonId,
        chunk: { start: chunkStart, end: chunkEnd, requested: targetChunkSize, generated: rows.length },
        progress: {
          generated: generatedCount, total_requested: requestedSteps, completed,
          remaining: Math.max(0, requestedSteps - generatedCount),
          next_chunk_start: completed ? null : generatedCount + 1,
        },
        steps_count: generatedCount, estimated_minutes: estimatedMinutes, tools, timings,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    timings.total_ms = Date.now() - startedAt;
    console.error("v10-generate-steps error:", error);

    // --- GAP C FIX: Persist forensic log even on unexpected failure ---
    try {
      if (pipelineId) {
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase.from("v10_bpa_pipeline_log").insert({
          pipeline_id: pipelineId, stage: 2, action: "steps_generation_chunk_failed",
          details: {
            lesson_id: lessonId, chunk_start: chunkStart, chunk_end: chunkEnd,
            requested_total: requestedSteps, error: error?.message ?? String(error),
            error_type: "unexpected", stage, timings,
          },
        });
      }
    } catch (logErr: any) {
      console.error("[v10-generate-steps] failed to write failure forensic log:", logErr?.message);
    }

    return new Response(
      JSON.stringify({ error: error?.message ?? String(error), error_type: "unexpected", stage, timings }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
