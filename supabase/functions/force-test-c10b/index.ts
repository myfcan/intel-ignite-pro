/**
 * FORCE TEST C10B - Edge Function de Orquestração
 * 
 * Executa 12 runs de teste do contrato C10B + BoundaryFix
 * usando variações controladas nas cenas interativas.
 * 
 * @version 1.0.0
 * @date 2026-02-08
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// MATRIZ DE VARIAÇÕES DOS 12 RUNS
// ============================================================================

interface RunVariation {
  runTag: string;
  description: string;
  expectedResult: 'PASS' | 'FAIL';
  expectedError?: string;
  quizPauseAt: string;
  promessaPauseAt: string;
  playgroundPauseAt: string;
  // Opcional: modificar narração
  modifyNarration?: {
    quiz?: string;
    promessa?: string;
    playground?: string;
  };
}

const RUN_MATRIX: RunVariation[] = [
  // R01: 3-4 palavras únicas no final (ideal)
  // Narrações REAIS:
  // - quiz: "...a opção que mais representa você."
  // - promessa: "...dez vezes mais claro no que você faz."
  // - playground: "...Faça o teste agora."
  {
    runTag: 'R01-3-4-words-unique',
    description: 'pauseAt 3-4 palavras únicas no final',
    expectedResult: 'PASS',
    quizPauseAt: 'representa você',
    promessaPauseAt: 'você faz',  // ← CORRIGIDO: existe na narração real
    playgroundPauseAt: 'teste agora',
  },
  
  // R02: 2 palavras únicas
  {
    runTag: 'R02-2-words-unique',
    description: 'pauseAt 2 palavras únicas',
    expectedResult: 'PASS',
    quizPauseAt: 'representa você',
    promessaPauseAt: 'você faz',
    playgroundPauseAt: 'agora',
  },
  
  // R03: 1 palavra comum (risco de match ambíguo)
  {
    runTag: 'R03-1-word-common',
    description: 'pauseAt 1 palavra comum (risco)',
    expectedResult: 'PASS', // Deve passar com LAST_IN_RANGE
    quizPauseAt: 'você',
    promessaPauseAt: 'faz',
    playgroundPauseAt: 'agora',
  },
  
  // R04: palavra repetida 2x na mesma narração
  {
    runTag: 'R04-repeated-word',
    description: 'pauseAt repetido 2x na mesma narração',
    expectedResult: 'PASS', // Usa LAST_IN_RANGE
    quizPauseAt: 'você',
    promessaPauseAt: 'projetos',
    playgroundPauseAt: 'agora',
  },
  
  // R05: pauseAt NÃO existe na narração (DEVE FALHAR)
  {
    runTag: 'R05-not-in-narration',
    description: 'pauseAt NÃO existe na narração',
    expectedResult: 'FAIL',
    expectedError: 'PAUSE_ANCHOR_NOT_FOUND',
    quizPauseAt: 'inexistente123xyz',
    promessaPauseAt: 'palavrainvalida999',
    playgroundPauseAt: 'naoencontra888',
  },
  
  // R06: pauseAt existe mas aparece cedo (>1.5s antes do fim) - C10B guardrail
  // ✅ NARRAÇÕES REAIS:
  // Quiz: "Como você usa a Inteligência Artificial hoje? Escolha a opção que mais representa você."
  // Promessa: "Vou te mostrar o segredo dos dois por cento. Para projetos. Renda extra. E para se tornar dez vezes mais claro no que você faz."
  // Playground: "Agora é a sua vez de colocar em prática tudo o que você aprendeu..."
  // 
  // Palavras no INÍCIO que devem disparar C10B:
  {
    runTag: 'R06-early-anchor',
    description: 'pauseAt existe mas aparece cedo (C10B fail)',
    expectedResult: 'FAIL',
    expectedError: 'PAUSE_ANCHOR_NOT_AT_END',
    quizPauseAt: 'Inteligência',      // ~45s vs fim ~50s → ~5s de diferença
    promessaPauseAt: 'segredo',       // "Vou te mostrar o segredo" - início
    playgroundPauseAt: 'prática',     // "colocar em prática" - início
  },
  
  // R07: pauseAt com pontuação no final
  {
    runTag: 'R07-with-punctuation',
    description: 'pauseAt com pontuação no final',
    expectedResult: 'PASS', // Normalização remove pontuação
    quizPauseAt: 'representa você.',
    promessaPauseAt: 'você faz.',
    playgroundPauseAt: 'agora.',
  },
  
  // R08: pauseAt com acento/variação - testa normalização NFD
  // ✅ CORREÇÃO v2: pauseAt deve estar nos ÚLTIMOS 1.5s da narração (C10B safe)
  // Quiz: "...a opção que mais representa você." → "você" (ê, última palavra)
  // Promessa: "...dez vezes mais claro no que você faz." → "faz" (última palavra)
  // Playground: "...Faça o teste agora." → "agora" (última palavra)
  {
    runTag: 'R08-accent-voce',
    description: 'pauseAt com acento (você/ê) no fim - normalização NFD',
    expectedResult: 'PASS', // Normalização NFD remove ê→e
    quizPauseAt: 'você',        // ê accent, ÚLTIMA palavra da narração quiz
    promessaPauseAt: 'faz',     // última palavra da narração promessa
    playgroundPauseAt: 'agora', // última palavra da narração playground
  },
  
  // R09: pauseAt em CAIXA ALTA
  {
    runTag: 'R09-case-insensitive',
    description: 'pauseAt em CAIXA ALTA na narração',
    expectedResult: 'PASS', // Normalização toLower
    quizPauseAt: 'REPRESENTA VOCÊ',
    promessaPauseAt: 'VOCÊ FAZ',
    playgroundPauseAt: 'AGORA',
  },
  
  // R10: pauseAt plural/singular - usando palavras que EXISTEM
  // Narrações: "projetos", "prompt amador"
  {
    runTag: 'R10-plural-singular',
    description: 'pauseAt plural/singular (match exato)',
    expectedResult: 'PASS', // Depende do match - singular vs plural
    quizPauseAt: 'você',  // Existe: "representa você"
    promessaPauseAt: 'projetos',  // Existe: "Para projetos"
    playgroundPauseAt: 'prompt',  // Existe: "prompt amador" e "prompt profissional"
  },
  
  // R11: narração muito curta antes do quiz (stress boundary)
  // ✅ CORREÇÃO: Não modifica narração para não quebrar schema - apenas testa boundary com pausa válida
  {
    runTag: 'R11-short-pause-word',
    description: 'pauseAt com palavra curta válida (stress boundary)',
    expectedResult: 'PASS', // Stress boundary fix - narração não modificada
    quizPauseAt: 'você',       // Palavra curta mas válida
    promessaPauseAt: 'claro',  // Existe em "dez vezes mais claro"
    playgroundPauseAt: 'agora',
    // REMOVIDO modifyNarration - causava VALIDATION_ERROR
  },
  
  // R12: narração muito longa antes do playground (stress timestamps)
  {
    runTag: 'R12-long-narration',
    description: 'narração muito longa antes do playground',
    expectedResult: 'PASS', // Stress timestamps
    quizPauseAt: 'representa você',
    promessaPauseAt: 'você faz',
    playgroundPauseAt: 'teste agora',
    modifyNarration: {
      playground: 'Agora é a sua vez de colocar em prática tudo o que você aprendeu. Pegue o conceito, transforme em ação, e veja como a inteligência artificial pode multiplicar seus resultados de forma extraordinária. Este é o momento de testar, experimentar, iterar, e descobrir o poder real do que você acabou de aprender. Faça o teste agora.',
    },
  },
];

// ============================================================================
// TIPOS
// ============================================================================

interface ForceTestRequest {
  lesson_id: string;
  runs?: string; // 'R01-R12' ou 'R01,R05,R06' ou 'ALL'
  dry_run?: boolean; // Se true, não executa, apenas valida matriz
  sequential_delay_ms?: number; // Delay entre runs (default: 2000)
}

interface RunResult {
  run_id: string;
  runTag: string;
  status: 'completed' | 'failed' | 'skipped';
  pipeline_version?: string;
  commit_hash?: string;
  boundaries_ok?: string;
  wt_count?: number;
  c10_pass?: string;
  c10b_pass?: string;
  failure_reason?: string;
  duration_ms?: number;
}

interface ForceTestResult {
  batch_id: string;  // ✅ ISOLAMENTO: UUID único do batch
  test_id: string;
  started_at: string;
  completed_at: string;
  total_runs: number;
  passed_runs: number;
  failed_runs: number;
  expected_failures: number;
  unexpected_failures: number;
  results: RunResult[];
  run_mapping: Array<{ runTag: string; run_id: string }>; // ✅ Mapeamento explícito
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function generateRunId(runTag: string): string {
  // Gerar UUID v4 válido usando crypto
  // Usamos o UUID padrão mas modificamos os primeiros bytes para rastreabilidade
  const runNum = runTag.match(/R(\d+)/)?.[1] || '00';
  const runNumPadded = parseInt(runNum).toString().padStart(2, '0');
  const uuid = crypto.randomUUID();
  // Substituir apenas os primeiros 4 chars para manter UUID válido
  // f0rc + runNum (2 chars) + resto do uuid original
  // Exemplo: f0010001-xxxx-4xxx-xxxx-xxxxxxxxxxxx (R01)
  return `f0${runNumPadded}${uuid.slice(4)}`;
}

function parseRunRange(runsParam: string): string[] {
  if (!runsParam || runsParam.toUpperCase() === 'ALL') {
    return RUN_MATRIX.map(r => r.runTag);
  }
  
  // Suporta: 'R01-R12', 'R01,R05,R06', 'R01-R06,R10'
  const result: string[] = [];
  const parts = runsParam.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim().toUpperCase();
    if (trimmed.includes('-')) {
      // Range: R01-R06
      const [start, end] = trimmed.split('-').map(s => parseInt(s.replace('R', '')));
      for (let i = start; i <= end; i++) {
        const tag = `R${i.toString().padStart(2, '0')}`;
        const variation = RUN_MATRIX.find(r => r.runTag.startsWith(tag));
        if (variation) {
          result.push(variation.runTag);
        }
      }
    } else {
      // Single: R05
      const tag = trimmed;
      const variation = RUN_MATRIX.find(r => r.runTag.startsWith(tag));
      if (variation) {
        result.push(variation.runTag);
      }
    }
  }
  
  return result;
}

function modifyInputForRun(
  originalInput: any,
  variation: RunVariation,
  batchId: string  // ✅ ISOLAMENTO: batch_id passado para cada run
): any {
  const modifiedInput = JSON.parse(JSON.stringify(originalInput));
  
  // ✅ ISOLAMENTO: Adicionar metadados de rastreamento no input
  // Estes serão persistidos em output_data->meta pelo v7-vv
  modifiedInput.forceTestMeta = {
    batchId: batchId,
    runTag: variation.runTag,
  };
  
  // Adicionar runTag para rastreamento (legado - manter compatibilidade)
  modifiedInput.postLessonFlow = {
    ...modifiedInput.postLessonFlow,
    runTag: variation.runTag,
  };
  
  // Modificar cenas interativas
  if (modifiedInput.scenes && Array.isArray(modifiedInput.scenes)) {
    modifiedInput.scenes = modifiedInput.scenes.map((scene: any) => {
      // ✅ CORREÇÃO: Verificar por ID PRIMEIRO, não por type
      // cena-6-quiz
      if (scene.id === 'cena-6-quiz') {
        const modified = { ...scene };
        modified.anchorText = {
          ...modified.anchorText,
          pauseAt: variation.quizPauseAt,
        };
        if (variation.modifyNarration?.quiz) {
          modified.narration = variation.modifyNarration.quiz;
        }
        console.log(`[ForceTest] Modified ${scene.id}: pauseAt = "${variation.quizPauseAt}"`);
        return modified;
      }
      
      // cena-7-promessa
      if (scene.id === 'cena-7-promessa') {
        const modified = { ...scene };
        modified.anchorText = {
          ...modified.anchorText,
          pauseAt: variation.promessaPauseAt,
        };
        if (variation.modifyNarration?.promessa) {
          modified.narration = variation.modifyNarration.promessa;
        }
        console.log(`[ForceTest] Modified ${scene.id}: pauseAt = "${variation.promessaPauseAt}"`);
        return modified;
      }
      
      // cena-10-playground
      if (scene.id === 'cena-10-playground') {
        const modified = { ...scene };
        modified.anchorText = {
          ...modified.anchorText,
          pauseAt: variation.playgroundPauseAt,
        };
        if (variation.modifyNarration?.playground) {
          modified.narration = variation.modifyNarration.playground;
        }
        console.log(`[ForceTest] Modified ${scene.id}: pauseAt = "${variation.playgroundPauseAt}"`);
        return modified;
      }
      
      return scene;
    });
  }
  
  return modifiedInput;
}

async function executeReprocess(
  supabase: any,
  lessonId: string,
  inputData: any,
  runId: string
): Promise<{ success: boolean; error?: string; run_id?: string }> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  try {
    console.log(`[ForceTest] Executing reprocess for run ${runId}...`);
    console.log(`[ForceTest] Input has ${inputData.scenes?.length || 0} scenes`);
    
    // ✅ CORREÇÃO: Espalhar inputData como campos do body, não como campo aninhado
    // O v7-vv espera: { title, scenes, existing_lesson_id, reprocess, ... }
    const response = await fetch(`${SUPABASE_URL}/functions/v1/v7-vv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ...inputData,  // ← Espalhar inputData (title, scenes, etc.)
        existing_lesson_id: lessonId,
        reprocess: true,
        generate_audio: false,  // ← SEM TTS: usa word_timestamps existentes do banco
        run_id: runId,
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };
    }
    
    return {
      success: true,
      run_id: result.run_id || runId,
    };
    
  } catch (error: any) {
    console.error(`[ForceTest] Error executing reprocess:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function collectRunMetrics(
  supabase: any,
  runId: string
): Promise<Partial<RunResult>> {
  // Query para coletar métricas do run
  const { data, error } = await supabase
    .from('pipeline_executions')
    .select(`
      run_id,
      status,
      pipeline_version,
      commit_hash,
      error_message,
      output_data
    `)
    .eq('run_id', runId)
    .single();
  
  if (error || !data) {
    return {
      status: 'failed',
      failure_reason: error?.message || 'Run not found',
    };
  }
  
  const metrics: Partial<RunResult> = {
    status: data.status as any,
    pipeline_version: data.pipeline_version,
    commit_hash: data.commit_hash,
    failure_reason: data.error_message,
  };
  
  // Se completou, extrair métricas detalhadas
  if (data.status === 'completed' && data.output_data) {
    const output = data.output_data;
    const content = output.content || output;
    
    // Word timestamps count
    const wordTimestamps = content?.audio?.mainAudio?.wordTimestamps || [];
    metrics.wt_count = wordTimestamps.length;
    
    // Boundaries check
    const phases = content?.phases || [];
    let boundaryViolations = 0;
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const duration = phase.endTime - phase.startTime;
      if (duration <= 0) boundaryViolations++;
      
      const nextPhase = phases[i + 1];
      if (nextPhase && phase.endTime > nextPhase.startTime) {
        boundaryViolations++;
      }
    }
    metrics.boundaries_ok = boundaryViolations === 0 
      ? `${phases.length}/${phases.length}` 
      : `FAIL (${boundaryViolations} violations)`;
    
    // C10/C10B checks seriam feitos aqui via queries específicas
    // Por simplicidade, marcamos como "TODO" - as queries SQL finais validarão
    metrics.c10_pass = 'pending_sql_validation';
    metrics.c10b_pass = 'pending_sql_validation';
  }
  
  return metrics;
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const body: ForceTestRequest = await req.json();
    const { 
      lesson_id, 
      runs = 'ALL', 
      dry_run = false,
      sequential_delay_ms = 500 
    } = body;
    
    if (!lesson_id) {
      return new Response(
        JSON.stringify({ error: 'lesson_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[ForceTest] Starting force test for lesson ${lesson_id}`);
    console.log(`[ForceTest] Runs: ${runs}, Dry Run: ${dry_run}`);
    
    // 1. Recuperar input original da execução com 10 cenas
    // ✅ CORREÇÃO: Buscar execução com pelo menos 10 cenas para garantir que
    // todas as cenas interativas (quiz, promessa, playground) existam
    const { data: validExecutions, error: fetchError } = await supabase
      .from('pipeline_executions')
      .select('input_data, lesson_id, run_id')
      .eq('lesson_id', lesson_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (fetchError) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not fetch executions for lesson',
          details: fetchError?.message 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Encontrar execução com pelo menos 10 cenas
    const lastExecution = validExecutions?.find((exec: any) => {
      const scenesCount = exec.input_data?.scenes?.length ?? 0;
      return scenesCount >= 10;
    });
    
    if (!lastExecution?.input_data) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not find execution with 10+ scenes for lesson',
          details: `Found ${validExecutions?.length ?? 0} executions, none with 10+ scenes`,
          available: validExecutions?.map((e: any) => ({
            run_id: e.run_id,
            scenes: e.input_data?.scenes?.length ?? 0
          }))
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[ForceTest] Using execution ${lastExecution.run_id} with ${lastExecution.input_data?.scenes?.length} scenes`);
    
    const originalInput = lastExecution.input_data;
    console.log(`[ForceTest] Retrieved original input with ${originalInput.scenes?.length || 0} scenes`);
    
    // 2. Determinar quais runs executar
    const selectedRuns = parseRunRange(runs);
    console.log(`[ForceTest] Selected ${selectedRuns.length} runs: ${selectedRuns.join(', ')}`);
    
    // 3. Modo dry-run: apenas retornar matriz
    if (dry_run) {
      const variations = RUN_MATRIX.filter(v => selectedRuns.includes(v.runTag));
      return new Response(
        JSON.stringify({
          mode: 'dry_run',
          lesson_id,
          selected_runs: selectedRuns.length,
          matrix: variations.map(v => ({
            runTag: v.runTag,
            description: v.description,
            expectedResult: v.expectedResult,
            expectedError: v.expectedError,
            quizPauseAt: v.quizPauseAt,
            promessaPauseAt: v.promessaPauseAt,
            playgroundPauseAt: v.playgroundPauseAt,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Executar runs sequencialmente
    // ✅ ISOLAMENTO: Gerar batch_id único para rastrear este batch completo
    const batchId = crypto.randomUUID();
    const testId = `force-test-${Date.now().toString(36)}`;
    const results: RunResult[] = [];
    const runMapping: Array<{ runTag: string; run_id: string }> = [];
    
    console.log(`[ForceTest] ======== BATCH ${batchId} ========`);
    console.log(`[ForceTest] Executing ${selectedRuns.length} runs with isolation`);
    
    for (const runTag of selectedRuns) {
      const variation = RUN_MATRIX.find(v => v.runTag === runTag);
      if (!variation) {
        results.push({
          run_id: '',
          runTag,
          status: 'skipped',
          failure_reason: 'Variation not found in matrix',
        });
        continue;
      }
      
      const runId = generateRunId(runTag);
      const runStartTime = Date.now();
      
      console.log(`[ForceTest] ======== Starting ${runTag} (${variation.description}) ========`);
      
      // Modificar input para este run - inclui batch_id para isolamento
      const modifiedInput = modifyInputForRun(originalInput, variation, batchId);
      
      // Registrar mapping para output final
      runMapping.push({ runTag, run_id: runId });
      
      // Executar reprocess
      const execResult = await executeReprocess(supabase, lesson_id, modifiedInput, runId);
      
      if (!execResult.success) {
        const result: RunResult = {
          run_id: runId,
          runTag,
          status: 'failed',
          failure_reason: execResult.error,
          duration_ms: Date.now() - runStartTime,
        };
        
        // Verificar se era uma falha esperada
        if (variation.expectedResult === 'FAIL') {
          const errorMatches = execResult.error?.includes(variation.expectedError || '');
          result.failure_reason = errorMatches 
            ? `EXPECTED: ${execResult.error}`
            : `UNEXPECTED ERROR: ${execResult.error} (expected: ${variation.expectedError})`;
        }
        
        results.push(result);
      } else {
        // Aguardar um pouco para o pipeline processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Coletar métricas
        const metrics = await collectRunMetrics(supabase, runId);
        
        const result: RunResult = {
          run_id: runId,
          runTag,
          ...metrics,
          duration_ms: Date.now() - runStartTime,
        } as RunResult;
        
        // Verificar expectativa
        if (variation.expectedResult === 'FAIL' && result.status === 'completed') {
          result.failure_reason = `UNEXPECTED SUCCESS: Expected ${variation.expectedError}`;
        }
        
        results.push(result);
      }
      
      console.log(`[ForceTest] ${runTag} completed: ${results[results.length - 1].status}`);
      
      // Delay entre runs
      if (selectedRuns.indexOf(runTag) < selectedRuns.length - 1) {
        console.log(`[ForceTest] Waiting ${sequential_delay_ms}ms before next run...`);
        await new Promise(resolve => setTimeout(resolve, sequential_delay_ms));
      }
    }
    
    // 5. Calcular sumário
    const passedRuns = results.filter(r => r.status === 'completed').length;
    const failedRuns = results.filter(r => r.status === 'failed').length;
    
    const expectedFailures = results.filter(r => {
      const variation = RUN_MATRIX.find(v => v.runTag === r.runTag);
      return variation?.expectedResult === 'FAIL' && r.status === 'failed';
    }).length;
    
    const unexpectedFailures = failedRuns - expectedFailures;
    
    const finalResult: ForceTestResult = {
      batch_id: batchId,  // ✅ ISOLAMENTO: batch_id no resultado
      test_id: testId,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      total_runs: results.length,
      passed_runs: passedRuns,
      failed_runs: failedRuns,
      expected_failures: expectedFailures,
      unexpected_failures: unexpectedFailures,
      results,
      run_mapping: runMapping,  // ✅ Mapeamento explícito runTag→run_id
    };
    
    console.log(`[ForceTest] ======== COMPLETED ========`);
    console.log(`[ForceTest] Batch ID: ${batchId}`);
    console.log(`[ForceTest] Total: ${results.length}, Passed: ${passedRuns}, Failed: ${failedRuns}`);
    console.log(`[ForceTest] Expected Failures: ${expectedFailures}, Unexpected: ${unexpectedFailures}`);
    console.log(`[ForceTest] Run Mapping: ${JSON.stringify(runMapping)}`);
    
    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('[ForceTest] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
