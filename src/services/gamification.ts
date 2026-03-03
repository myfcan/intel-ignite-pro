import { supabase } from '@/integrations/supabase/client';

export type GamificationEventType =
  | 'lesson_completed'
  | 'journey_completed'
  | 'quiz_answered'
  | 'insight_claimed';

export type GamificationResult = {
  xp_delta: number;
  coins_delta: number;
  new_power_score: number;
  new_coins: number;
  new_patent_level: number;
  patent_name: string;
  is_new_patent: boolean;
};

export async function registerGamificationEvent(
  eventType: GamificationEventType,
  eventReferenceId?: string,
  payload: Record<string, any> = {}
): Promise<GamificationResult | null> {
  try {
    const { data, error } = await supabase.rpc('register_gamification_event', {
      p_event_type: eventType,
      p_event_reference_id: eventReferenceId || null,
      p_payload: payload
    });

    if (error) {
      console.error('[Gamification] Error:', error);
      return null;
    }

    return data as GamificationResult;
  } catch (err) {
    console.error('[Gamification] Exception:', err);
    return null;
  }
}
