import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { exercise_id, user_answer } = await req.json();

    if (!exercise_id || !user_answer) {
      throw new Error('Missing required fields');
    }

    // Use service role key for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get exercise details
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('*, lessons(id)')
      .eq('id', exercise_id)
      .single();

    if (exerciseError) throw exerciseError;

    // Validate answer
    const isCorrect = exercise.correct_answer.toLowerCase().trim() === 
                      user_answer.toLowerCase().trim();

    // Update user progress using authenticated user ID
    if (isCorrect) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', exercise.lessons.id)
        .single();

      if (progress) {
        await supabase
          .from('user_progress')
          .update({
            exercises_completed: (progress.exercises_completed || 0) + 1
          })
          .eq('id', progress.id);
      }
    }

    return new Response(
      JSON.stringify({
        is_correct: isCorrect,
        explanation: exercise.explanation,
        correct_answer: isCorrect ? null : exercise.correct_answer
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-exercise:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});