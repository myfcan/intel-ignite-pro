/**
 * V7 Reprocess Endpoint
 * 
 * Accepts a run_id, fetches the original input_data from pipeline_executions,
 * and re-submits it to v7-vv with generate_audio: false.
 * 
 * This enables post-deploy validation without manual JSON pasting.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { run_id, lesson_id } = body;

    if (!run_id && !lesson_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'run_id or lesson_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Fetch the original input_data
    let query = supabase
      .from('pipeline_executions')
      .select('run_id, input_data, lesson_id, lesson_title, model')
      .eq('model', 'v7-vv')
      .order('created_at', { ascending: false })
      .limit(1);

    if (run_id) {
      query = supabase
        .from('pipeline_executions')
        .select('run_id, input_data, lesson_id, lesson_title, model')
        .eq('run_id', run_id)
        .single();
    } else {
      query = supabase
        .from('pipeline_executions')
        .select('run_id, input_data, lesson_id, lesson_title, model')
        .eq('lesson_id', lesson_id)
        .eq('model', 'v7-vv')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    }

    const { data: originalRun, error: fetchError } = await query;

    if (fetchError || !originalRun) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Run not found: ${fetchError?.message || 'no data'}`,
          searched: { run_id, lesson_id },
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!originalRun.input_data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Run has no input_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[v7-reprocess] Found original run: ${originalRun.run_id}`);
    console.log(`[v7-reprocess] Lesson: ${originalRun.lesson_title} (${originalRun.lesson_id})`);

    // Step 2: Modify input for reprocess
    // Generate a new run_id for the reprocess (v7-vv requires it for idempotency)
    const newRunId = crypto.randomUUID();
    const reprocessInput = {
      ...originalRun.input_data,
      run_id: newRunId,
      generate_audio: false,
      reprocess: true,
      existing_lesson_id: originalRun.lesson_id || originalRun.input_data.existing_lesson_id,
      _reprocess_source: {
        original_run_id: originalRun.run_id,
        reprocessed_at: new Date().toISOString(),
        reason: 'post-deploy-validation',
      },
    };

    console.log(`[v7-reprocess] Calling v7-vv with generate_audio:false...`);

    // Step 3: Call v7-vv directly via HTTP
    const v7vvUrl = `${supabaseUrl}/functions/v1/v7-vv`;
    const v7vvResponse = await fetch(v7vvUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(reprocessInput),
    });

    const v7vvResult = await v7vvResponse.json();

    console.log(`[v7-reprocess] v7-vv response status: ${v7vvResponse.status}`);
    console.log(`[v7-reprocess] v7-vv result success: ${v7vvResult.success}`);

    if (!v7vvResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Reprocess failed in v7-vv',
          original_run_id: originalRun.run_id,
          new_run_id: v7vvResult.runId || null,
          v7vv_error: v7vvResult.error,
          v7vv_error_code: v7vvResult.error_code,
          v7vv_error_details: v7vvResult.error_details,
        }),
        { status: v7vvResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Fetch the new run's output for forensic evidence
    const resultRunId = v7vvResult.runId;
    let forensicEvidence = null;

    if (resultRunId) {
      const { data: newRun } = await supabase
        .from('pipeline_executions')
        .select('run_id, status, output_data, error_message, pipeline_version, completed_at')
        .eq('run_id', resultRunId)
        .single();

      if (newRun?.output_data) {
        // Extract anchor actions from phases for forensic proof
        const phases = newRun.output_data?.content?.phases || [];
        const anchorEvidence = phases
          .filter((p: any) => p.anchorActions?.length > 0)
          .map((p: any) => ({
            phaseId: p.id,
            phaseType: p.type,
            startTime: p.startTime,
            endTime: p.endTime,
            anchorActions: p.anchorActions.map((a: any) => ({
              type: a.type,
              keyword: a.keyword,
              keywordTime: a.keywordTime,
            })),
          }));

        forensicEvidence = {
          run_id: newRun.run_id,
          status: newRun.status,
          pipeline_version: newRun.pipeline_version,
          completed_at: newRun.completed_at,
          meta: newRun.output_data?.meta || {},
          anchorEvidence,
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        original_run_id: originalRun.run_id,
        new_run_id: resultRunId,
        lesson_id: v7vvResult.lessonId,
        stats: v7vvResult.stats,
        forensicEvidence,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[v7-reprocess] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
