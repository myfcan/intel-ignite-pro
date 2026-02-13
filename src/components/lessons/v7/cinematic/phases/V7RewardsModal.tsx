/**
 * V7RewardsModal - Modal de recompensas V7-vv
 * Mostra Power Score, Créditos IA, patente atual e próxima
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Coins, X, ArrowRight, ArrowLeft, Play, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useV7SoundEffects } from '../useV7SoundEffects';

// Tipo para próxima aula com preview de conteúdo
interface NextLesson {
  id: string;
  title: string;
  order_index: number;
  description?: string | null;
  estimated_time?: number | null;
}

interface V7RewardsModalProps {
  xpDelta: number;
  coinsDelta: number;
  newPowerScore: number;
  newCoins: number;
  patentName: string;
  isNewPatent?: boolean;
  nextLesson?: NextLesson | null;
  onContinue: () => void;
  onBack: () => void;
  onNextLesson?: () => void;
}

// Hook personalizado para animar contadores
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function para suavizar a animação
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(end * easeOut));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export const V7RewardsModal = ({
  xpDelta,
  coinsDelta,
  newPowerScore,
  newCoins,
  patentName,
  isNewPatent = false,
  nextLesson,
  onContinue,
  onBack,
  onNextLesson
}: V7RewardsModalProps) => {
  const [showCoins, setShowCoins] = useState(false);
  
  // ✅ Detectar se é revisão (aula já completada anteriormente)
  const isReview = xpDelta === 0 && coinsDelta === 0;
  
  // Sound effects
  const { playSound } = useV7SoundEffects(0.6, true);
  const soundPlayedRef = useRef(false);
  
  // Animar os contadores
  const animatedXP = useCountUp(xpDelta, 1200);
  const animatedCoins = useCountUp(coinsDelta, 1200);
  const animatedPowerScore = useCountUp(newPowerScore, 1500);
  const animatedTotalCoins = useCountUp(newCoins, 1500);

  useEffect(() => {
    // ✅ Play reward sounds only once - SEMPRE tocar, mesmo em revisão
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      
      // Pequeno delay para garantir que AudioContext seja desbloqueado pela interação
      const playSounds = async () => {
        // Som inicial
        if (isNewPatent) {
          // 🏅 Epic level-up fanfare for new patent
          await playSound('level-up');
        } else if (!isReview) {
          // 🔥 Streak-bonus for XP gains
          if (xpDelta >= 50) {
            await playSound('streak-bonus');
          } else {
            await playSound('success');
          }
        } else {
          // Som suave para revisão
          await playSound('click-confirm');
        }
        
        // Count-up sounds for XP - apenas se ganhou algo
        if (!isReview) {
          setTimeout(() => playSound('count-up'), 200);
          setTimeout(() => playSound('count-up'), 400);
          setTimeout(() => playSound('count-up'), 600);
          setTimeout(() => playSound('count-up'), 800);
        }
      };
      
      // Executa após pequeno delay para garantir interação do usuário
      setTimeout(playSounds, 100);
    }
    
    // Confetti - só se não for revisão
    if (!isReview) {
      setTimeout(() => {
        if (isNewPatent) {
          // Confetti especial para nova patente
          const count = 200;
          const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

          function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
              ...defaults,
              ...opts,
              particleCount: Math.floor(count * particleRatio),
            });
          }

          fire(0.25, { spread: 26, startVelocity: 55 });
          fire(0.2, { spread: 60 });
          fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
          fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        } else {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999
          });
        }
        
        // ✅ Som de celebração após confetti
        playSound('completion');
      }, 300);
    }

    // Moedas caindo com som - só se não for revisão
    if (!isReview) {
      setTimeout(() => {
        setShowCoins(true);
        playSound('reveal');
      }, 500);
    }
  }, [isNewPatent, isReview, playSound, xpDelta]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Moedas caindo animadas */}
        {showCoins && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-coin-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
            ))}
          </div>
        )}
        
        <motion.div 
          className="relative max-w-lg w-full rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 py-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={onBack} 
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex justify-center mb-4">
            <motion.div 
              className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-sky-400" />
            </motion.div>
          </div>

          <motion.h2 
            className="text-2xl font-bold text-center text-slate-50 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isNewPatent ? (
              <>🎉 Nova Patente Desbloqueada!</>
            ) : isReview ? (
              <>📚 Aula Revisada</>
            ) : (
              <>✨ Recompensas</>
            )}
          </motion.h2>

          {isNewPatent && (
            <motion.p 
              className="text-center text-sky-300 text-sm mb-4 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Você subiu para <span className="font-bold">{patentName}</span>. Poucos alunos chegam aqui!
            </motion.p>
          )}
          
          {/* ✅ Mensagem de revisão */}
          {isReview && !isNewPatent && (
            <motion.p 
              className="text-center text-slate-400 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Você já completou esta aula antes. Sem recompensas adicionais, mas seu progresso foi atualizado!
            </motion.p>
          )}

          <motion.div 
            className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-300 tabular-nums">+{animatedXP}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Power Score</p>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-700" />

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-300 tabular-nums">+{animatedCoins}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Créditos IA</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Power Score total</span>
              <span className="font-semibold text-sky-300 tabular-nums">{animatedPowerScore}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Créditos de IA</span>
              <span className="font-semibold text-amber-300 tabular-nums">{animatedTotalCoins}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Patente atual</span>
              <span className="font-semibold text-slate-200">{patentName}</span>
            </div>
          </motion.div>

          {/* ✅ Próxima aula recomendada com preview */}
          {nextLesson && (
            <motion.div 
              className="mt-4 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 rounded-xl p-4 border border-emerald-500/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wide font-medium">Próxima aula</p>
                    {nextLesson.estimated_time && (
                      <span className="text-[10px] text-slate-500">• {nextLesson.estimated_time} min</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-100 leading-tight mb-1">{nextLesson.title}</p>
                  {nextLesson.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{nextLesson.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            className="flex flex-col gap-3 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* ✅ Botão de próxima aula (destaque) */}
            {nextLesson && onNextLesson && (
              <motion.button
                onClick={() => {
                  playSound('click-confirm');
                  onNextLesson();
                }}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4" />
                Começar Próxima Aula
              </motion.button>
            )}
            
            {/* Botões secundários */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => {
                  playSound('click-soft');
                  onBack();
                }}
                className="flex-1 h-12 border border-slate-700 rounded-xl text-slate-300 font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </motion.button>
              <motion.button
                onClick={() => {
                  playSound('click-confirm');
                  onContinue();
                }}
                className={`flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  nextLesson 
                    ? 'border border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {nextLesson ? 'Ir para Trilha' : 'Continuar'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Coin fall animation */}
      <style>{`
        @keyframes coin-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-coin-fall {
          animation: coin-fall linear forwards;
        }
      `}</style>
    </>
  );
};

export default V7RewardsModal;
