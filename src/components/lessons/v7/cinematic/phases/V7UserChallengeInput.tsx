/**
 * V7UserChallengeInput - Componente de input real para o desafio do usuário
 * O usuário escreve seu prompt e recebe feedback da IA em tempo real
 * ✅ V7-v27: Integrado com sistema de achievements
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Sparkles, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { usePromptAchievements, type PromptAchievement } from '@/hooks/usePromptAchievements';
import { V7AchievementToast } from './V7AchievementToast';

interface UserChallenge {
  instruction: string;
  challengePrompt: string;
  hints: string[];
}

interface V7UserChallengeInputProps {
  userChallenge: UserChallenge;
  lessonId?: string;
  onComplete: () => void;
}

interface AIFeedback {
  response: string;
  feedback: string;
  score?: number;
}

export const V7UserChallengeInput = ({
  userChallenge,
  lessonId,
  onComplete
}: V7UserChallengeInputProps) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<PromptAchievement[]>([]);
  const [showAchievementToast, setShowAchievementToast] = useState(false);

  const { checkAndAwardAchievements } = usePromptAchievements();

  const handleSubmit = useCallback(async () => {
    if (!userPrompt.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setAIFeedback(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lesson-playground', {
        body: {
          lessonId: lessonId || 'challenge',
          prompt: userPrompt.trim()
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Analisar o feedback para extrair uma pontuação aproximada
      const feedbackText = data.aiFeedback || '';
      let score = 70; // Pontuação padrão
      
      if (feedbackText.toLowerCase().includes('excelente') || feedbackText.toLowerCase().includes('ótimo')) {
        score = 90;
      } else if (feedbackText.toLowerCase().includes('bom') || feedbackText.toLowerCase().includes('legal')) {
        score = 75;
      } else if (feedbackText.toLowerCase().includes('melhorar') || feedbackText.toLowerCase().includes('falta')) {
        score = 60;
      }

      setAIFeedback({
        response: data.aiResponse,
        feedback: data.aiFeedback,
        score
      });

      // ✅ V7-v27: Verificar e atribuir achievements
      const achievements = await checkAndAwardAchievements(score, lessonId);
      if (achievements.length > 0) {
        setEarnedAchievements(achievements);
        setShowAchievementToast(true);
      }
    } catch (err) {
      console.error('Error getting AI feedback:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar seu prompt');
    } finally {
      setIsSubmitting(false);
    }
  }, [userPrompt, lessonId, isSubmitting, checkAndAwardAchievements]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    if (score >= 70) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
  };

  return (
    <>
      {/* Achievement Toast */}
      {showAchievementToast && (
        <V7AchievementToast
          achievements={earnedAchievements}
          onClose={() => setShowAchievementToast(false)}
        />
      )}

      {/* ✅ RESPONSIVE: Layout flex sem scroll, tudo visível na viewport */}
      <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-lg mx-auto">
        {/* Header com instrução - compacto */}
        <motion.p 
          className="text-sm sm:text-base font-bold text-yellow-400 text-center"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {userChallenge.instruction}
        </motion.p>

        {/* Desafio original - compacto */}
        <div className="bg-white/[0.02] border border-amber-500/30 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] sm:text-xs font-bold rounded">DESAFIO</span>
            <span className="text-white/50 text-[10px] sm:text-xs">Reescreva este prompt</span>
          </div>
          <div className="bg-black/40 rounded p-2 font-mono text-xs sm:text-sm text-amber-300">
            "{userChallenge.challengePrompt}"
          </div>
        </div>

        {/* Botão de dicas inline */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1 text-purple-400 text-xs hover:text-purple-300 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lightbulb className="w-3 h-3" />
            {showHints ? 'Esconder' : 'Ver dicas'}
          </motion.button>
          <span className="text-white/30 text-[10px]">{userPrompt.length} caracteres</span>
        </div>

        {/* Dicas expansíveis - compactas */}
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2"
            >
              <ul className="grid grid-cols-1 gap-1">
                {userChallenge.hints.slice(0, 3).map((hint, idx) => (
                  <motion.li 
                    key={idx}
                    className="flex items-start gap-1 text-white/70 text-[10px] sm:text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span className="line-clamp-1">{hint}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input do usuário - altura fixa responsiva - DESTAQUE VISUAL */}
        <div className="relative">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Escreva seu prompt profissional aqui..."
            disabled={isSubmitting || !!aiFeedback}
            className="w-full h-24 sm:h-28 bg-black/60 border-2 border-cyan-400/50 rounded-xl p-3 sm:p-4 text-white placeholder-white/50 font-mono text-sm sm:text-base resize-none focus:outline-none focus:border-cyan-400 focus:bg-black/70 transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
            onKeyDown={(e) => e.stopPropagation()}
          />
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg p-2"
            >
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-1">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de enviar */}
        {!aiFeedback && (
          <motion.button
            onClick={handleSubmit}
            disabled={!userPrompt.trim() || isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: userPrompt.trim() && !isSubmitting ? 1.02 : 1 }}
            whileTap={{ scale: userPrompt.trim() && !isSubmitting ? 0.98 : 1 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar para análise
              </>
            )}
          </motion.button>
        )}

        {/* Feedback da IA - compacto em grid */}
        <AnimatePresence>
          {aiFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              {/* Score + Feedback lado a lado em telas maiores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Score */}
                <motion.div
                  className={`bg-gradient-to-r ${getScoreBg(aiFeedback.score || 70)} border rounded-lg p-2 flex items-center justify-center gap-2`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  {(aiFeedback.score || 70) >= 70 ? (
                    <CheckCircle className={`w-4 h-4 ${getScoreColor(aiFeedback.score || 70)}`} />
                  ) : (
                    <Sparkles className={`w-4 h-4 ${getScoreColor(aiFeedback.score || 70)}`} />
                  )}
                  <span className={`text-lg font-bold ${getScoreColor(aiFeedback.score || 70)}`}>
                    {aiFeedback.score || 70}%
                  </span>
                  <span className="text-white/60 text-xs">
                    {(aiFeedback.score || 70) >= 85 ? 'Excelente!' : 
                     (aiFeedback.score || 70) >= 70 ? 'Bom!' : 'Continue!'}
                  </span>
                </motion.div>

                {/* Coach feedback compacto */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 flex items-start gap-2">
                  <span className="text-sm">🎯</span>
                  <p className="text-white/70 text-[10px] sm:text-xs line-clamp-2">
                    {aiFeedback.feedback}
                  </p>
                </div>
              </div>

              {/* Resultado da IA - toggle para expandir */}
              <details className="bg-white/[0.02] border border-cyan-500/30 rounded-lg">
                <summary className="flex items-center gap-2 p-2 cursor-pointer text-xs text-cyan-400 font-medium">
                  <Sparkles className="w-3 h-3" />
                  Ver resposta completa da IA
                </summary>
                <div className="p-2 pt-0">
                  <div className="bg-black/40 rounded p-2 text-[10px] sm:text-xs text-white/80 max-h-24 overflow-y-auto whitespace-pre-line">
                    {aiFeedback.response}
                  </div>
                </div>
              </details>

              {/* Botão de continuar */}
              <motion.button
                onClick={onComplete}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34, 197, 94, 0.3)',
                    '0 0 25px rgba(34, 197, 94, 0.5)',
                    '0 0 15px rgba(34, 197, 94, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-4 h-4" />
                Continuar Aula
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default V7UserChallengeInput;
