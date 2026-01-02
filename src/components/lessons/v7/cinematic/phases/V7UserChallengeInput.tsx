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

      {/* ✅ FIX: Container com max-height e overflow para não estourar a tela */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto px-1">
      {/* Header com instrução */}
      <div className="text-center mb-2">
        <motion.p 
          className="text-lg font-bold text-yellow-400"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {userChallenge.instruction}
        </motion.p>
      </div>

      {/* Desafio original - mais compacto */}
      <div className="bg-white/[0.02] border-2 border-amber-500/30 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded">DESAFIO</span>
          <span className="text-white/50 text-xs">Reescreva este prompt</span>
        </div>
        <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-amber-300">
          "{userChallenge.challengePrompt}"
        </div>
      </div>

      {/* Botão de dicas */}
      <motion.button
        onClick={() => setShowHints(!showHints)}
        className="flex items-center gap-2 text-purple-400 text-sm hover:text-purple-300 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Lightbulb className="w-4 h-4" />
        {showHints ? 'Esconder dicas' : 'Ver dicas'}
      </motion.button>

      {/* Dicas expansíveis */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4"
          >
            <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
              <span>💡</span>
              Dicas para um prompt profissional:
            </h4>
            <ul className="space-y-2">
              {userChallenge.hints.map((hint, idx) => (
                <motion.li 
                  key={idx}
                  className="flex items-start gap-2 text-white/70 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                  <span>{hint}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input do usuário - ✅ FIX: onKeyDown removido para permitir espaços */}
      <div className="relative">
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Escreva seu prompt profissional aqui..."
          disabled={isSubmitting || !!aiFeedback}
          className="w-full min-h-[100px] bg-black/40 border-2 border-cyan-500/30 rounded-xl p-3 text-white placeholder-white/30 font-mono text-sm resize-none focus:outline-none focus:border-cyan-500/60 transition-colors disabled:opacity-50"
          onKeyDown={(e) => {
            // ✅ FIX: Não bloquear nenhuma tecla - permitir espaços normalmente
            e.stopPropagation();
          }}
        />
        
        {/* Contador de caracteres */}
        <div className="absolute bottom-2 right-3 text-white/30 text-xs">
          {userPrompt.length} caracteres
        </div>
      </div>

      {/* Erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de enviar */}
      {!aiFeedback && (
        <motion.button
          onClick={handleSubmit}
          disabled={!userPrompt.trim() || isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: userPrompt.trim() && !isSubmitting ? 1.02 : 1 }}
          whileTap={{ scale: userPrompt.trim() && !isSubmitting ? 0.98 : 1 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analisando seu prompt...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar para análise
            </>
          )}
        </motion.button>
      )}

      {/* Feedback da IA - mais compacto */}
      <AnimatePresence>
        {aiFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Score - mais compacto */}
            <motion.div
              className={`bg-gradient-to-r ${getScoreBg(aiFeedback.score || 70)} border rounded-xl p-3 text-center`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-center gap-2">
                {(aiFeedback.score || 70) >= 70 ? (
                  <CheckCircle className={`w-5 h-5 ${getScoreColor(aiFeedback.score || 70)}`} />
                ) : (
                  <Sparkles className={`w-5 h-5 ${getScoreColor(aiFeedback.score || 70)}`} />
                )}
                <span className={`text-xl font-bold ${getScoreColor(aiFeedback.score || 70)}`}>
                  {aiFeedback.score || 70}%
                </span>
                <span className="text-white/60 text-sm ml-2">
                  {(aiFeedback.score || 70) >= 85 ? 'Excelente!' : 
                   (aiFeedback.score || 70) >= 70 ? 'Bom trabalho!' : 'Continue!'}
                </span>
              </div>
            </motion.div>

            {/* Resultado da IA - mais compacto */}
            <div className="bg-white/[0.02] border border-cyan-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">RESULTADO DA IA</span>
              </div>
              <div className="bg-black/40 rounded-lg p-3 text-xs text-white/80 max-h-[80px] overflow-y-auto whitespace-pre-line">
                {aiFeedback.response}
              </div>
            </div>

            {/* Feedback do coach - mais compacto */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🎯</span>
                <span className="text-xs font-bold text-purple-300">FEEDBACK DO COACH</span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                {aiFeedback.feedback}
              </p>
            </div>

            {/* Botão de continuar */}
            <motion.button
              onClick={onComplete}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.3)',
                  '0 0 40px rgba(34, 197, 94, 0.5)',
                  '0 0 20px rgba(34, 197, 94, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-5 h-5" />
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
