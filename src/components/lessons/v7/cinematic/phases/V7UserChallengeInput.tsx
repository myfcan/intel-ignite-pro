/**
 * V7UserChallengeInput - Componente de input real para o desafio do usuário
 * O usuário escreve seu prompt e recebe feedback da IA em tempo real
 * ✅ V7-v27: Integrado com sistema de achievements
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Sparkles, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { usePromptAchievements, type PromptAchievement } from '@/hooks/usePromptAchievements';
import { V7AchievementToast } from './V7AchievementToast';
import { V7_CLASSES } from '../../v7-design-tokens';

// Som sutil de foco (soft chime)
const FOCUS_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1pZmhvd4eXqLrM3erx9fXy7ujf1cy9sKSYjYN6c21oZGJhYGBgYWNlZ2xwdHl+hIqRmKCorrfAyczR1dja3N3d3dza19PQzMjDvrq2sq+sqqusr7K2u8DFyszQ1NfZ29zc3Nza19PRzcnEwLy4tLGvrq2trq+xs7a5vMDDxsnLzdDS09TV1dTT0tDOzMrIxcPBv726uLe3uLq8v8LFyMrMz9DS09TU1NTT0tHPzcvJx8XDwb++vb2+v8HDxcfJy83P0NDR0dHR0dDPzszKyMbEw8LBwMDAv7+/v8DBwsPFxsjJysvMzMzMy8vKycjHxsXEw8LCwcHBwcHCwsPExcbHyMnKysrKysrJycjIx8bFxMPDwsLCwsLCwsPDxMXGx8jIycrKysnJycjIx8bGxcTEw8PDw8PDw8PExMXGxsfIyMjIyMjIx8fGxsXFxMTEw8PDw8PDxMTExcXGxsfHx8fHx8fHxsbGxcXExMTEw8TExMTExMXFxcbGxsbGxsbGxsbFxcXFxcXExMTExMTExMXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxQ==';

/**
 * ✅ V7-v43: Detecta prompts de "lixo" (caracteres aleatórios, sem sentido)
 * Regras:
 * - Caracteres repetitivos (wwwevwevwev...)
 * - Sem palavras reais de pelo menos 3 letras
 * - Padrões suspeitos de teclas aleatórias
 */
function detectGibberishPrompt(text: string): boolean {
  // Remove espaços para análise
  const cleaned = text.replace(/\s+/g, '').toLowerCase();
  
  // Se muito curto, não é gibberish (será tratado por isTooShort)
  if (cleaned.length < 10) return false;
  
  // 1. Detectar padrões repetitivos (ex: "wevwevwev", "asdasdasd")
  const repeatingPattern = /(.{2,5})\1{3,}/i;
  if (repeatingPattern.test(cleaned)) return true;
  
  // 2. Detectar excesso de consoantes consecutivas (ex: "wvwvwvw", "bcdfghjk")
  const consonantStreak = /[bcdfghjklmnpqrstvwxyz]{7,}/i;
  if (consonantStreak.test(cleaned)) return true;
  
  // 3. Detectar ausência de vogais em textos longos
  const vowelCount = (cleaned.match(/[aeiouáàâãéèêíïóôõöúç]/gi) || []).length;
  const vowelRatio = vowelCount / cleaned.length;
  if (cleaned.length > 15 && vowelRatio < 0.15) return true;
  
  // 4. Detectar teclado mashing (letras adjacentes repetidas)
  const keyboardMash = /(?:qw|we|er|rt|ty|yu|ui|io|op|as|sd|df|fg|gh|hj|jk|kl|zx|xc|cv|vb|bn|nm){4,}/i;
  if (keyboardMash.test(cleaned)) return true;
  
  // 5. Verificar se há pelo menos 2 palavras reais de 3+ caracteres
  const words = text.toLowerCase().split(/\s+/);
  const realWords = words.filter(w => 
    /^[a-záàâãéèêíïóôõöúç]{3,}$/i.test(w) && 
    !/^(.)\1+$/.test(w) // não é letra repetida
  );
  if (text.length > 20 && realWords.length < 2) return true;
  
  return false;
}

interface UserChallenge {
  instruction: string;
  challengePrompt: string;
  hints: string[];
}

interface V7UserChallengeInputProps {
  userChallenge: UserChallenge;
  lessonId?: string;
  onComplete: () => void;
  onResultModeChange?: (isResultMode: boolean) => void;
}

interface AIFeedback {
  response: string;
  feedback: string;
  score?: number;
}

export const V7UserChallengeInput = ({
  userChallenge,
  lessonId,
  onComplete,
  onResultModeChange
}: V7UserChallengeInputProps) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<PromptAchievement[]>([]);
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const focusSoundRef = useRef<HTMLAudioElement | null>(null);

  const { checkAndAwardAchievements } = usePromptAchievements();

  // Inicializar o som de foco
  useEffect(() => {
    focusSoundRef.current = new Audio(FOCUS_SOUND_URL);
    focusSoundRef.current.volume = 0.15; // Volume baixo e sutil
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Tocar som sutil ao focar
    if (focusSoundRef.current) {
      focusSoundRef.current.currentTime = 0;
      focusSoundRef.current.play().catch(() => {
        // Ignorar erro se autoplay for bloqueado
      });
    }
  }, []);

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

      // ✅ V7-v43: VALIDAÇÃO REAL do prompt antes de atribuir score
      // Prompts de lixo/ilegíveis devem receber score baixo
      const feedbackText = data.aiFeedback || '';
      const promptText = userPrompt.trim();
      
      // Verificar se o prompt é válido (não é lixo/caracteres repetidos)
      const isGibberish = detectGibberishPrompt(promptText);
      const isTooShort = promptText.length < 15;
      const hasNoRealWords = !/\b[a-záàâãéèêíïóôõöúç]{3,}\b/i.test(promptText);
      
      let score = 70; // Pontuação padrão para prompts válidos
      
      // ✅ REGRA CRÍTICA: Prompts inválidos recebem score MUITO baixo
      if (isGibberish || hasNoRealWords) {
        score = 15; // Prompt é lixo/ilegível
      } else if (isTooShort) {
        score = 35; // Prompt muito curto
      } else if (feedbackText.toLowerCase().includes('excelente') || feedbackText.toLowerCase().includes('ótimo')) {
        score = 90;
      } else if (feedbackText.toLowerCase().includes('bom') || feedbackText.toLowerCase().includes('legal')) {
        score = 75;
      } else if (feedbackText.toLowerCase().includes('melhorar') || feedbackText.toLowerCase().includes('falta')) {
        score = 60;
      } else if (feedbackText.toLowerCase().includes('ilegível') || feedbackText.toLowerCase().includes('não podemos')) {
        score = 20; // IA detectou que é ilegível
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

  // ✅ V7-v44: Modo resultado - após enviar, esconde seção do desafio
  const isResultMode = !!aiFeedback;

  // Notificar o pai quando muda para modo resultado
  useEffect(() => {
    onResultModeChange?.(isResultMode);
  }, [isResultMode, onResultModeChange]);

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
        
        {/* ========== SEÇÃO DE INPUT (esconde após enviar) ========== */}
        <AnimatePresence mode="wait">
          {!isResultMode && (
            <motion.div
              key="input-section"
              initial={{ opacity: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.95,
                transition: { duration: 0.4, ease: "easeInOut" }
              }}
              className="flex flex-col gap-2 sm:gap-3"
            >
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
                <div className="bg-black/40 rounded p-2 font-mono text-xs sm:text-sm text-amber-300 relative overflow-hidden">
                  <span className="opacity-90">
                    "{userChallenge.challengePrompt}"
                  </span>
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

              {/* Input do usuário - altura fixa responsiva - DESTAQUE VISUAL BRILHANTE */}
              <motion.div 
                className="relative"
                animate={{
                  boxShadow: isFocused 
                    ? [
                        '0 0 25px rgba(6, 182, 212, 0.5), 0 0 50px rgba(168, 85, 247, 0.3)',
                        '0 0 40px rgba(6, 182, 212, 0.7), 0 0 80px rgba(168, 85, 247, 0.5)',
                        '0 0 25px rgba(6, 182, 212, 0.5), 0 0 50px rgba(168, 85, 247, 0.3)'
                      ]
                    : [
                        '0 0 15px rgba(6, 182, 212, 0.2), 0 0 30px rgba(168, 85, 247, 0.1)',
                        '0 0 25px rgba(6, 182, 212, 0.4), 0 0 50px rgba(168, 85, 247, 0.25)',
                        '0 0 15px rgba(6, 182, 212, 0.2), 0 0 30px rgba(168, 85, 247, 0.1)'
                      ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ borderRadius: '0.75rem' }}
              >
                {/* Animated gradient border */}
                <motion.div 
                  className="absolute -inset-[2px] rounded-xl pointer-events-none z-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.6), rgba(168, 85, 247, 0.6), rgba(6, 182, 212, 0.6))',
                    backgroundSize: '200% 200%'
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    opacity: isFocused ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Escreva seu prompt profissional aqui..."
                  disabled={isSubmitting}
                  className={`h-24 sm:h-28 ${V7_CLASSES.inputField} relative z-10`}
                  onKeyDown={(e) => e.stopPropagation()}
                  onFocus={handleFocus}
                  onBlur={() => setIsFocused(false)}
                />
                
                {/* Inner glow overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none z-20" />
                
                {/* Corner sparkles - always visible */}
                <motion.div 
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 z-20 pointer-events-none"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-purple-400 z-20 pointer-events-none"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                />
              </motion.div>

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
              <motion.button
                onClick={handleSubmit}
                disabled={!userPrompt.trim() || isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: userPrompt.trim() && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: userPrompt.trim() && !isSubmitting ? 0.98 : 1 }}
                animate={userPrompt.trim() && !isSubmitting ? {
                  boxShadow: [
                    '0 0 10px rgba(6, 182, 212, 0.3)',
                    '0 0 25px rgba(6, 182, 212, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
                    '0 0 10px rgba(6, 182, 212, 0.3)'
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== SEÇÃO DE RESULTADO - LAYOUT PROFISSIONAL ========== */}
        <AnimatePresence>
          {aiFeedback && (
            <motion.div
              key="result-section"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="flex flex-col gap-4 sm:gap-5"
            >
              {/* Header + Score - Design Premium */}
              <motion.div 
                className={`bg-gradient-to-r ${getScoreBg(aiFeedback.score || 70)} border rounded-xl p-4 sm:p-5 flex items-center justify-between`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <span className="text-base sm:text-lg font-bold text-white">Resultado</span>
                </div>
                <div className="flex items-center gap-3">
                  {(aiFeedback.score || 70) >= 70 ? (
                    <CheckCircle className={`w-6 h-6 ${getScoreColor(aiFeedback.score || 70)}`} />
                  ) : (
                    <Sparkles className={`w-6 h-6 ${getScoreColor(aiFeedback.score || 70)}`} />
                  )}
                  <span className={`text-3xl sm:text-4xl font-bold ${getScoreColor(aiFeedback.score || 70)}`}>
                    {aiFeedback.score || 70}%
                  </span>
                </div>
              </motion.div>

              {/* Coach Feedback - Box estático sem scroll */}
              <motion.div 
                className="relative bg-gradient-to-br from-cyan-500/10 via-purple-500/8 to-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 sm:p-5 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-cyan-400/80 text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-1.5">Feedback do Coach</p>
                    <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed line-clamp-4">
                      {aiFeedback.feedback.length > 280 
                        ? aiFeedback.feedback.slice(0, 280) + '...' 
                        : aiFeedback.feedback}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Botões de ação - Maiores e mais espaçados */}
              <motion.div 
                className="grid grid-cols-2 gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* Tentar novamente */}
                <motion.button
                  onClick={() => setAIFeedback(null)}
                  className="py-3.5 sm:py-4 px-4 bg-white/5 border border-white/15 text-white font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 hover:bg-white/10 hover:border-white/25 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">✏️</span>
                  Tentar novamente
                </motion.button>

                {/* Continuar - Destaque principal */}
                <motion.button
                  onClick={onComplete}
                  className="py-3.5 sm:py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    boxShadow: [
                      '0 4px 20px rgba(34, 197, 94, 0.25)',
                      '0 8px 35px rgba(34, 197, 94, 0.4)',
                      '0 4px 20px rgba(34, 197, 94, 0.25)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Continuar
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default V7UserChallengeInput;
