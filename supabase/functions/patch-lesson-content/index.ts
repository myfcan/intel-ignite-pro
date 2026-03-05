import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: corsHeaders });
    }

    const { lessonId, patches } = await req.json();
    if (!lessonId || !patches) {
      return new Response(JSON.stringify({ error: 'Missing lessonId or patches' }), { status: 400, headers: corsHeaders });
    }

    // Fetch current content
    const { data: lesson, error: fetchErr } = await supabaseAdmin
      .from('lessons')
      .select('content')
      .eq('id', lessonId)
      .single();

    if (fetchErr || !lesson) {
      return new Response(JSON.stringify({ error: 'Lesson not found', details: fetchErr }), { status: 404, headers: corsHeaders });
    }

    const content = lesson.content as Record<string, any>;

    // Apply patches
    const applied: string[] = [];

    if (patches.set_inline_exercises) {
      content.inlineExercises = patches.set_inline_exercises;
      applied.push(`set_inline_exercises (${patches.set_inline_exercises.length} items)`);
    }

    if (patches.set_inline_playgrounds) {
      content.inlinePlaygrounds = patches.set_inline_playgrounds;
      applied.push(`set_inline_playgrounds (${patches.set_inline_playgrounds.length} items)`);
    }

    if (patches.set_inline_quizzes) {
      content.inlineQuizzes = patches.set_inline_quizzes;
      applied.push(`set_inline_quizzes (${patches.set_inline_quizzes.length} items)`);
    }

    if (patches.merge_fields) {
      for (const [key, value] of Object.entries(patches.merge_fields)) {
        content[key] = value;
        applied.push(`merge: ${key}`);
      }
    }

    // Update
    const { error: updateErr } = await supabaseAdmin
      .from('lessons')
      .update({ content })
      .eq('id', lessonId);

    if (updateErr) {
      return new Response(JSON.stringify({ error: 'Update failed', details: updateErr }), { status: 500, headers: corsHeaders });
    }

    console.log(`[patch-lesson-content] ✅ Patched lesson ${lessonId}: ${applied.join(', ')}`);

    return new Response(JSON.stringify({
      success: true,
      lessonId,
      applied,
      inlineExercisesCount: content.inlineExercises?.length ?? 0,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[patch-lesson-content] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
