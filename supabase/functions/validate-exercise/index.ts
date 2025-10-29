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
    const { exercise_id, user_answer, user_id } = await req.json();

    if (!exercise_id || !user_answer || !user_id) {
      throw new Error('Missing required fields');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Update user progress
    if (isCorrect) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user_id)
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