import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Gift, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { V8InsightBlock } from "@/types/v8Lesson";
import { registerGamificationEvent } from "@/services/gamification";
import { supabase } from "@/integrations/supabase/client";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";

interface V8InsightRewardProps {
  insight: V8InsightBlock;
  onContinue?: () => void;
  isActive?: boolean;
}

export const V8InsightReward = ({ insight, onContinue, isActive = true }: V8InsightRewardProps) => {
  const { playSound } = useV7SoundEffects(0.6, true);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [checkingClaim, setCheckingClaim] = useState(true);

  // Check if already claimed on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { setCheckingClaim(false); return; }

        const { data } = await supabase
          .from("user_gamification_events")
          .select("id")
          .eq("event_reference_id", insight.id)
          .eq("event_type", "insight_claimed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!cancelled && data) setClaimed(true);
      } catch {
        // Non-blocking
      } finally {
        if (!cancelled) setCheckingClaim(false);
      }
    })();
    return () => { cancelled = true; };
  }, [insight.id]);

  const handleClaim = useCallback(async () => {
    if (claimed || claiming) return;
    setClaiming(true);

    try {
      // 8s timeout with Promise.race
      const timeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 8000)
      );

      await Promise.race([
        registerGamificationEvent("insight_claimed", insight.id, {
          credits: insight.creditsReward,
        }),
        timeout,
      ]);

      setClaimed(true);
      playSound("streak-bonus");
    } catch (err) {
      // Optimistic fallback on timeout
      console.warn("[V8InsightReward] Claim timeout/error, applying optimistic:", err);
      setClaimed(true);
    } finally {
      setClaiming(false);
    }
  }, [claimed, claiming, insight.id, insight.creditsReward, playSound]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-sm font-bold text-amber-800">{insight.title}</h3>
      </div>

      {/* Insight text */}
      <p className="text-sm text-amber-700 leading-relaxed">{insight.insightText}</p>

      {/* Claim button or claimed badge */}
      {checkingClaim ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
      ) : claimed ? (
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Desbloqueado! +{insight.creditsReward} créditos ✓
          </motion.div>

          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Continuar Aula
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {claiming ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Desbloqueando...</>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Desbloquear +{insight.creditsReward} créditos
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};
