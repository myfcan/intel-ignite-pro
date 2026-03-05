import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useV7SoundEffects } from '@/components/lessons/v7/cinematic/useV7SoundEffects';
import { FlipCardQuizExerciseData } from '@/types/exerciseSchemas';
import { Brain, Zap, Target, Lightbulb, Sparkles, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Brain, Zap, Target, Lightbulb, Sparkles,
};

const COLOR_MAP: Record<string, { gradient: string; glow: string; border: string }> = {
  cyan: {
    gradient: 'from-cyan-600/80 to-cyan-800/90',
    glow: '0 0 25px rgba(34,211,238,0.4)',
    border: 'border-cyan-400/50',
  },
  emerald: {
    gradient: 'from-emerald-600/80 to-emerald-800/90',
    glow: '0 0 25px rgba(52,211,153,0.4)',
    border: 'border-emerald-400/50',
  },
  purple: {
    gradient: 'from-purple-600/80 to-purple-800/90',
    glow: '0 0 25px rgba(168,85,247,0.4)',
    border: 'border-purple-400/50',
  },
  amber: {
    gradient: 'from-amber-600/80 to-amber-800/90',
    glow: '0 0 25px rgba(251,191,36,0.4)',
    border: 'border-amber-400/50',
  },
};

interface FlipCardQuizExerciseProps {
  title: string;
  instruction: string;
  data: FlipCardQuizExerciseData;
  onComplete: (score: number) => void;
}

export function FlipCardQuizExercise({ title, instruction, data, onComplete }: FlipCardQuizExerciseProps) {
  const isMobile = useIsMobile();
  const { playSound } = useV7SoundEffects(0.6, true);
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<number>>(new Set());
  const [showGlow, setShowGlow] = useState<number | null>(null);
  const [shakeCard, setShakeCard] = useState<number | null>(null);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const cards = data.cards;
  const totalCards = cards.length;
  const completedCount = answeredCards.size;

  const handleTryAgain = useCallback(() => {
    setActiveIndex(0);
    setFlippedCards(new Set());
    setSelectedOptions({});
    setAnsweredCards(new Set());
    setCorrectCards(new Set());
    setShowGlow(null);
    setShakeCard(null);
    setShowWrongFeedback(false);
    setFinalScore(0);
  }, []);

  const handleContinueAfterWrong = useCallback(() => {
    onComplete(finalScore);
  }, [onComplete, finalScore]);

  const flipCard = useCallback((index: number) => {
    if (flippedCards.has(index)) return;
    playSound('click-confirm');
    setFlippedCards(prev => new Set(prev).add(index));
    setShowGlow(index);
    setTimeout(() => setShowGlow(null), 800);
  }, [flippedCards, playSound]);

  const selectOption = useCallback((cardIndex: number, optionId: string) => {
    if (answeredCards.has(cardIndex)) return;
    playSound('snap-success');
    setSelectedOptions(prev => ({ ...prev, [cardIndex]: optionId }));
  }, [answeredCards, playSound]);

  const confirmAnswer = useCallback((cardIndex: number) => {
    const card = cards[cardIndex];
    const selectedId = selectedOptions[cardIndex];
    if (!selectedId) return;

    const isCorrect = card.options.find(o => o.id === selectedId)?.isCorrect ?? false;
    setAnsweredCards(prev => new Set(prev).add(cardIndex));

    if (isCorrect) {
      setCorrectCards(prev => new Set(prev).add(cardIndex));
      playSound('combo-hit');
      setTimeout(() => playSound('quiz-correct'), 150);

      // Localized confetti
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({ particleCount: 40, spread: 50, origin: { x, y }, colors: ['#10b981', '#06b6d4', '#8b5cf6'] });
      }

      // Check if last card
      const newCompleted = answeredCards.size + 1;
      if (newCompleted === totalCards) {
        const totalCorrect = correctCards.size + 1;
        const score = (totalCorrect / totalCards) * 100;
        setFinalScore(score);
        if (score === 100) {
          playSound('level-up');
          setTimeout(() => playSound('completion'), 200);
          setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } }), 300);
          setTimeout(() => onComplete(score), 2000);
        } else {
          // Mixed results — show retry/continue
          if (score >= 60) {
            playSound('level-up');
            setTimeout(() => confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } }), 300);
          } else {
            playSound('streak-bonus');
          }
          setTimeout(() => setShowWrongFeedback(true), 1500);
        }
      } else {
        // Auto-advance after delay
        setTimeout(() => {
          if (cardIndex < totalCards - 1) setActiveIndex(cardIndex + 1);
        }, 1500);
      }
    } else {
      playSound('quiz-wrong');
      setShakeCard(cardIndex);
      setTimeout(() => setShakeCard(null), 500);

      const newCompleted = answeredCards.size + 1;
      const totalCorrect = correctCards.size;
      const score = (totalCorrect / totalCards) * 100;
      setFinalScore(score);

      if (newCompleted === totalCards) {
        // Last card — show retry/continue buttons
        setShowWrongFeedback(true);
      } else {
        // Not last card — auto-advance
        setTimeout(() => {
          if (cardIndex < totalCards - 1) setActiveIndex(cardIndex + 1);
        }, 1500);
      }
    }
  }, [cards, selectedOptions, answeredCards, correctCards, totalCards, playSound, onComplete]);

  const colorScheme = (color?: string) => COLOR_MAP[color || 'cyan'] || COLOR_MAP.cyan;

  const renderCard = (index: number, position: 'center' | 'side') => {
    const card = cards[index];
    if (!card) return null;

    const isFlipped = flippedCards.has(index);
    const isAnswered = answeredCards.has(index);
    const isCorrect = correctCards.has(index);
    const isGlowing = showGlow === index;
    const isShaking = shakeCard === index;
    const colors = colorScheme(card.front.color);
    const IconComp = ICON_MAP[card.front.icon || 'Brain'] || Brain;

    const scaleVal = position === 'center' ? 1.05 : 0.85;
    const opacityVal = position === 'center' ? 1 : 0.5;

    return (
      <motion.div
        key={card.id}
        ref={position === 'center' ? cardRef : undefined}
        className="relative"
        style={{ perspective: 1200, width: isMobile ? '100%' : 280 }}
        animate={{
          scale: scaleVal,
          opacity: opacityVal,
          x: isShaking ? [-4, 4, -4, 4, 0] : 0,
        }}
        transition={{ duration: isShaking ? 0.4 : 0.3 }}
      >
        {/* Glow ring on reveal */}
        <AnimatePresence>
          {isGlowing && (
            <motion.div
              className="absolute inset-0 rounded-2xl z-0"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.15, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ boxShadow: colors.glow }}
            />
          )}
        </AnimatePresence>

        {/* Correct answer ring */}
        <AnimatePresence>
          {isAnswered && isCorrect && (
            <motion.div
              className="absolute inset-0 rounded-2xl z-0 border-2 border-emerald-400/60"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          )}
        </AnimatePresence>

        <div className="w-full cursor-pointer">
          {/* FRONT — only visible when not flipped */}
          {!isFlipped && (
            <motion.div
              className={`rounded-2xl bg-gradient-to-br ${colors.gradient} border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-5 p-8 min-h-[340px]`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => position === 'center' && flipCard(index)}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <IconComp className="w-8 h-8 text-white/90" />
              </div>
              <span className="text-white/90 text-xl font-semibold tracking-wide">{card.front.label}</span>
              <span className="text-white/50 text-sm">Toque para revelar</span>
            </motion.div>
          )}

          {/* BACK — only visible when flipped */}
          {isFlipped && (
            <motion.div
              className={`rounded-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 border ${isAnswered ? (isCorrect ? 'border-emerald-400/50' : 'border-red-400/50') : isGlowing ? colors.border : 'border-white/15'} shadow-2xl flex flex-col justify-between p-5 min-h-[340px]`}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                boxShadow: isGlowing ? colors.glow : isAnswered && isCorrect ? '0 0 20px rgba(52,211,153,0.3)' : 'none',
              }}
            >
              <p className="text-white/90 text-base font-medium mb-4 leading-relaxed">{card.back.text}</p>

              <div className="flex flex-col gap-2.5">
                {card.options.map((opt, oi) => {
                  const isSelected = selectedOptions[index] === opt.id;
                  const showResult = isAnswered;
                  const optCorrect = opt.isCorrect;

                  return (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * oi + 0.2 }}
                      disabled={isAnswered}
                      onClick={(e) => { e.stopPropagation(); selectOption(index, opt.id); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        showResult && optCorrect
                          ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                          : showResult && isSelected && !optCorrect
                            ? 'bg-red-500/20 border-red-400/60 text-red-300'
                            : isSelected
                              ? 'bg-white/15 border-cyan-400/50 text-white'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="line-clamp-2">{opt.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Confirm button */}
              {!isAnswered && selectedOptions[index] && position === 'center' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => { e.stopPropagation(); confirmAnswer(index); }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/25 transition-shadow"
                >
                  Confirmar
                </motion.button>
              )}

              {/* Explanation after answer */}
              {isAnswered && card.explanation && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-xs text-white/50 italic leading-relaxed"
                >
                  {card.explanation}
                </motion.p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm">{instruction}</p>
        <div className="mt-4 max-w-xs mx-auto">
          <Progress value={(completedCount / totalCards) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{completedCount} / {totalCards}</p>
        </div>
      </div>

      {/* Cards area */}
      <div className="flex items-start justify-center gap-4">
        {isMobile ? (
          /* Mobile: single card */
          <div className="w-full max-w-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderCard(activeIndex, 'center')}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* Desktop: 3 cards */
          <>
            <div className="transition-all duration-300">
              {activeIndex > 0 ? renderCard(activeIndex - 1, 'side') : <div style={{ width: 280 }} />}
            </div>
            <div className="z-10">
              {renderCard(activeIndex, 'center')}
            </div>
            <div className="transition-all duration-300">
              {activeIndex < totalCards - 1 ? renderCard(activeIndex + 1, 'side') : <div style={{ width: 280 }} />}
            </div>
          </>
        )}
      </div>

      {/* Wrong feedback: Retry + Continue */}
      {showWrongFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4"
        >
          <Button onClick={handleTryAgain} variant="outline" className="w-full">
            Tentar Novamente
          </Button>
          <Button onClick={handleContinueAfterWrong} className="w-full gap-2">
            Continuar Aula
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
