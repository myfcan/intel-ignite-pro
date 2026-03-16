import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Auth: require admin/supervisor role
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const { pipeline_id, action } = await req.json();

    if (!pipeline_id || !action) {
      return new Response(
        JSON.stringify({ error: 'pipeline_id and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action !== 'publish' && action !== 'unpublish') {
      return new Response(
        JSON.stringify({ error: 'action must be "publish" or "unpublish"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch pipeline
    const { data: pipeline, error: fetchError } = await (supabase as any)
      .from('v10_bpa_pipeline')
      .select('*')
      .eq('id', pipeline_id)
      .single();

    if (fetchError || !pipeline) {
      console.error('Error fetching pipeline:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Pipeline not found', details: fetchError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check lesson_id exists
    if (!pipeline.lesson_id) {
      return new Response(
        JSON.stringify({ error: 'Pipeline has no lesson_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    if (action === 'publish') {
      // 3. Check assembly_passed
      if (!pipeline.assembly_passed) {
        return new Response(
          JSON.stringify({ error: 'Montagem precisa ser aprovada antes de publicar' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 4. Update v10_lessons status to published
      const { error: lessonError } = await (supabase as any)
        .from('v10_lessons')
        .update({ status: 'published' })
        .eq('id', pipeline.lesson_id);

      if (lessonError) {
        console.error('Error updating lesson:', lessonError);
        throw new Error(`Failed to update lesson: ${lessonError.message}`);
      }

      // 5. Update v10_bpa_pipeline
      const { error: pipelineError } = await (supabase as any)
        .from('v10_bpa_pipeline')
        .update({
          published_at: now,
          status: 'published',
          updated_at: now,
        })
        .eq('id', pipeline_id);

      if (pipelineError) {
        console.error('Error updating pipeline:', pipelineError);
        throw new Error(`Failed to update pipeline: ${pipelineError.message}`);
      }

      // 6. Log to v10_bpa_pipeline_log
      const { error: logError } = await (supabase as any)
        .from('v10_bpa_pipeline_log')
        .insert({
          pipeline_id,
          action: 'publish',
          stage: 7,
        });

      if (logError) {
        console.error('Error logging to pipeline log:', logError);
      }

      console.log('Lesson published for pipeline:', pipeline_id);

      // 7. Return success
      return new Response(
        JSON.stringify({ success: true, published_at: now }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- UNPUBLISH ---

    // 3. Update v10_lessons status to draft
    const { error: lessonError } = await (supabase as any)
      .from('v10_lessons')
      .update({ status: 'draft' })
      .eq('id', pipeline.lesson_id);

    if (lessonError) {
      console.error('Error updating lesson:', lessonError);
      throw new Error(`Failed to update lesson: ${lessonError.message}`);
    }

    // 4. Update v10_bpa_pipeline
    const { error: pipelineError } = await (supabase as any)
      .from('v10_bpa_pipeline')
      .update({
        published_at: null,
        status: 'ready',
        updated_at: now,
      })
      .eq('id', pipeline_id);

    if (pipelineError) {
      console.error('Error updating pipeline:', pipelineError);
      throw new Error(`Failed to update pipeline: ${pipelineError.message}`);
    }

    // 5. Log to v10_bpa_pipeline_log
    const { error: logError } = await (supabase as any)
      .from('v10_bpa_pipeline_log')
      .insert({
        pipeline_id,
        action: 'unpublish',
        stage: 7,
      });

    if (logError) {
      console.error('Error logging to pipeline log:', logError);
    }

    console.log('Lesson unpublished for pipeline:', pipeline_id);

    // 6. Return success
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('v10-publish-lesson error:', error);
    return new Response(
      JSON.stringify({ error: error?.message ?? String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
