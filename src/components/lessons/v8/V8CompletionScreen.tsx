import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Coins, Flame, ArrowRight, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { registerGamificationEvent } from "@/services/gamification";
import { PASS_SCORE } from "@/constants/v8Rules";
import { updateMissionProgress } from "@/lib/updateMissionProgress";
import { supabase } from "@/integrations/supabase/client";

interface V8CompletionScreenProps {
  scores: number[];
  lessonId: string;
  onContinue: () => void;
  onBackToTrail?: () => void;
}

export const V8CompletionScreen = ({
  scores,
  lessonId,
  onContinue,
  onBackToTrail,
}: V8CompletionScreenProps) => {
  const [gamificationResult, setGamificationResult] = useState<{
    xpDelta: number;
    coinsDelta: number;
    patentName: string;
    isNewPatent: boolean;
  } | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const hasRegistered = useRef(false);

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 100;

  // Register gamification event + confetti
  useEffect(() => {
    if (hasRegistered.current) return;
    hasRegistered.current = true;

    const register = async () => {
      try {
        const result = await registerGamificationEvent("lesson_completed", lessonId);
        if (result) {
          setGamificationResult({
            xpDelta: result.xp_delta ?? 0,
            coinsDelta: result.coins_delta ?? 0,
            patentName: result.patent_name ?? "",
            isNewPatent: result.is_new_patent ?? false,
          });
        }
      } catch {
        // Silently fail
      }
      try {
        await updateMissionProgress("aulas", 1);
      } catch {
        // Non-blocking
      }
    };

    register();

    if (avgScore >= PASS_SCORE) {
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#8b5cf6", "#10b981", "#fbbf24"],
        });
      }, 400);
    }
  }, [lessonId, avgScore]);

  // Fetch real streak
  useEffect(() => {
    const fetchStreak = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      setStreakDays(data?.current_streak ?? 0);
    };
    fetchStreak();
  }, []);

  const xp = gamificationResult?.xpDelta ?? 40;
  const coins = gamificationResult?.coinsDelta ?? 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[75vh] gap-8 text-center px-4"
    >
      {/* Trophy icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center"
      >
        <Trophy className="w-10 h-10 text-indigo-500" />
      </motion.div>

      {/* Title */}
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-slate-900"
        >
          Aula Concluída!
        </motion.h2>
        {avgScore > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-sm"
          >
            Score médio: {avgScore}%
          </motion.p>
        )}
      </div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3 w-full max-w-sm"
      >
        {/* XP */}
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50">
          <Zap className="w-5 h-5 text-indigo-500" />
          <CountUp value={xp} delay={600} />
          <span className="text-[11px] text-slate-500 font-medium">XP</span>
        </div>

        {/* Coins */}
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50">
          <Coins className="w-5 h-5 text-amber-500" />
          <CountUp value={coins} delay={800} />
          <span className="text-[11px] text-slate-500 font-medium">Moedas</span>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50">
          <Flame className="w-5 h-5 text-emerald-500" />
          <span className="text-xl font-bold text-slate-900 tabular-nums">
            {streakDays}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Dias</span>
        </div>
      </motion.div>

      {/* New patent badge */}
      {gamificationResult?.isNewPatent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 border border-indigo-200"
        >
          <span className="text-sm font-semibold text-indigo-600">
            🎖️ Nova patente: {gamificationResult.patentName}
          </span>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={onContinue}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow"
        >
          Próxima Aula <ArrowRight className="w-4 h-4" />
        </button>

        {onBackToTrail && (
          <button
            onClick={onBackToTrail}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Voltar à Trilha
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- CountUp micro-component ---
const CountUp = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let frame = 0;
      const totalFrames = 30;
      const step = value / totalFrames;
      const interval = setInterval(() => {
        frame++;
        setDisplay(Math.min(Math.round(step * frame), value));
        if (frame >= totalFrames) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <span className="text-xl font-bold text-slate-900 tabular-nums">+{display}</span>
  );
};
