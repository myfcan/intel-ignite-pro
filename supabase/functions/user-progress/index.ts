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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, user_id, lesson_id, time_spent } = await req.json();

    if (!user_id || !lesson_id) {
      throw new Error('Missing required fields');
    }

    if (action === 'start') {
      // Start lesson
      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user_id)
        .eq('lesson_id', lesson_id)
        .single();

      if (existing) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_progress')
          .update({ 
            status: 'in_progress',
            last_accessed: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ progress: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create new progress
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id,
          lesson_id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ progress: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'complete') {
      // Get current progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user_id)
        .eq('lesson_id', lesson_id)
        .single();

      if (!progress) {
        throw new Error('Progress not found');
      }

      // Update progress
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_spent: (progress.time_spent || 0) + (time_spent || 0)
        })
        .eq('id', progress.id);

      if (updateError) throw updateError;

      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();

      // Calculate points
      let points = 10; // Base points
      
      // Bonus for completing exercises
      if (progress.exercises_completed === progress.exercises_total && progress.exercises_total > 0) {
        points += 5;
      }
      
      // Streak bonus (max 10 points)
      const streakBonus = Math.min(user.streak_days * 2, 10);
      points += streakBonus;

      // Update user stats
      const { error: userError } = await supabase
        .from('users')
        .update({
          total_lessons_completed: (user.total_lessons_completed || 0) + 1,
          total_points: (user.total_points || 0) + points,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', user_id);

      if (userError) throw userError;

      // Check for achievements
      const achievements = [];
      
      // First lesson achievement
      if (user.total_lessons_completed === 0) {
        const { data: achievement } = await supabase
          .from('user_achievements')
          .insert({
            user_id,
            achievement_type: 'first_lesson',
            achievement_name: 'Primeira Aula Completa',
            achievement_icon: '🎉',
            points_earned: 10
          })
          .select()
          .single();
        
        if (achievement) achievements.push(achievement);
      }

      // Streak achievements
      if (user.streak_days === 3) {
        const { data: achievement } = await supabase
          .from('user_achievements')
          .insert({
            user_id,
            achievement_type: 'streak_3',
            achievement_name: '3 Dias Seguidos',
            achievement_icon: '🔥',
            points_earned: 15
          })
          .select()
          .single();
        
        if (achievement) achievements.push(achievement);
      }

      return new Response(
        JSON.stringify({
          success: true,
          points_earned: points,
          new_achievements: achievements
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in user-progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});