import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Gift, ArrowRight, Loader2, CheckCircle2, Lock } from "lucide-react";
import { V8InsightBlock } from "@/types/v8Lesson";
import { registerGamificationEvent } from "@/services/gamification";
import { supabase } from "@/integrations/supabase/client";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";
import confetti from "canvas-confetti";

interface V8InsightRewardProps {
  insight: V8InsightBlock;
  onContinue?: () => void;
  isActive?: boolean;
  unlockable?: boolean; // Phase 4 (Gap 3): whether the reward can be claimed
}

export const V8InsightReward = ({ insight, onContinue, isActive = true, unlockable = true }: V8InsightRewardProps) => {
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
    if (claimed || claiming || !unlockable) return;
    setClaiming(true);

    try {
      const timeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 8000)
      );

      await Promise.race([
        registerGamificationEvent("insight_claimed", insight.id, {
          credits: insight.creditsReward,  // Keep 'credits' key for DB function compatibility (Gap 6)
        }),
        timeout,
      ]);

      setClaimed(true);
      playSound("streak-bonus");
      // Phase 5: Fire confetti! 🎉
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'],
      });
    } catch (err) {
      console.warn("[V8InsightReward] Claim timeout/error, applying optimistic:", err);
      setClaimed(true);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } finally {
      setClaiming(false);
    }
  }, [claimed, claiming, unlockable, insight.id, insight.creditsReward, playSound]);

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
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-sm font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            🎉 +{insight.creditsReward} XP Desbloqueado!
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
      ) : !unlockable ? (
        /* Phase 4 (Gap 3): Locked state — prerequisite not met */
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Complete o desafio anterior com qualidade para desbloquear
          </div>
          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-300 transition-colors"
            >
              Continuar Aula
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={claiming || !isActive}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {claiming ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Desbloqueando...</>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Desbloquear +{insight.creditsReward} XP
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};
