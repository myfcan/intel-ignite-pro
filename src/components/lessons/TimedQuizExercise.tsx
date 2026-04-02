import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, Timer, Trophy, Clock } from 'lucide-react';
import { useV7SoundEffects } from './v7/cinematic/useV7SoundEffects';
import confetti from 'canvas-confetti';
import { TimedQuizExerciseData } from '@/types/exerciseSchemas';

type TimerState = 'waiting' | 'normal' | 'warning' | 'critical' | 'timeout' | 'answered';

interface TimedQuizExerciseProps {
  title: string;
  instruction: string;
  data: TimedQuizExerciseData;
  onComplete: (score: number) => void;
}

const MAX_QUESTIONS = 2;
const LETTER_BADGES = ['A', 'B', 'C', 'D', 'E', 'F'];

export function TimedQuizExercise({ title, instruction, data, onComplete }: TimedQuizExerciseProps) {
  const { timePerQuestion, bonusPerSecondLeft, timeoutPenalty, feedback } = data;
  const questions = (data.questions || []).filter(q => q.options && q.options.length >= 2).slice(0, MAX_QUESTIONS);

  // Guard: no valid questions
  if (questions.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto py-8 text-center space-y-4">
        <p className="text-muted-foreground text-sm">Exercício indisponível</p>
        <button onClick={() => onComplete(100)} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
          Continuar
        </button>
      </div>
    );
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [timerState, setTimerState] = useState<TimerState>('waiting');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTimeoutFlash, setShowTimeoutFlash] = useState(false);
  const [results, setResults] = useState<Array<{ correct: boolean; bonus: number }>>([]);
  const [isFinished, setIsFinished] = useState(false);

  const { playSound, unlockAudio } = useV7SoundEffects(0.6, true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const resultsRef = useRef<Array<{ correct: boolean; bonus: number }>>([]);
  const isCorrectRef = useRef<boolean | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const effectiveTime = currentQuestion?.timeOverride ?? timePerQuestion;

  // Start timer on mount / new question
  useEffect(() => {
    if (timerState === 'waiting') {
      const t = setTimeout(() => {
        setTimerState('normal');
        setTimeLeft(effectiveTime);
        playSound('click-confirm');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [timerState, effectiveTime, playSound]);

  // Timer countdown
  useEffect(() => {
    if (timerState === 'normal' || timerState === 'warning' || timerState === 'critical') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const next = Math.max(0, +(prev - 0.1).toFixed(1));
          const sec = Math.ceil(next);
          if (sec !== lastTickRef.current && sec > 0) {
            lastTickRef.current = sec;
            if (next <= 3) {
              playSound('timer-tick', { volume: 1.4, pitch: 1.4 });
            } else if (next <= 5) {
              playSound('timer-tick', { volume: 1.1, pitch: 1.2 });
            } else {
              playSound('progress-tick', { volume: 0.5 });
            }
          }
          return next;
        });
      }, 100);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [timerState, playSound]);

  // Update timer state based on timeLeft
  useEffect(() => {
    if (timerState === 'answered' || timerState === 'waiting') return;
    if (timeLeft <= 0) {
      setTimerState('timeout');
    } else if (timeLeft <= 3) {
      setTimerState('critical');
    } else if (timeLeft <= 5) {
      setTimerState('warning');
    } else {
      setTimerState('normal');
    }
  }, [timeLeft, timerState]);

  // Handle timeout
  useEffect(() => {
    if (timerState === 'timeout' && !selectedOptionId) {
      if (timerRef.current) clearInterval(timerRef.current);
      playSound('timer-buzzer');
      setShowTimeoutFlash(true);
      setTimeout(() => setShowTimeoutFlash(false), 400);

      const correctOption = currentQuestion.options.find(o => o.isCorrect);
      setIsCorrect(false);
      isCorrectRef.current = false;
      setSelectedOptionId(correctOption?.id ?? null);
      setShowExplanation(true);
      setResults(prev => { const next = [...prev, { correct: false, bonus: 0 }]; resultsRef.current = next; return next; });

      setTimeout(() => advanceQuestion(), 2500);
    }
  }, [timerState]);

  const handleSelectOption = useCallback((optionId: string) => {
    if (timerState === 'answered' || timerState === 'timeout' || selectedOptionId) return;
    unlockAudio();

    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState('answered');
    setSelectedOptionId(optionId);

    const option = currentQuestion.options.find(o => o.id === optionId);
    const correct = option?.isCorrect ?? false;
    setIsCorrect(correct);
    isCorrectRef.current = correct;
    setShowExplanation(true);

    const secondsLeft = Math.ceil(timeLeft);
    const bonus = correct ? secondsLeft * bonusPerSecondLeft : 0;
    const points = correct ? 100 + bonus : 0;

    setTotalPoints(prev => prev + points);
    if (bonus > 0) setTotalBonus(prev => prev + bonus);
    setResults(prev => { const next = [...prev, { correct, bonus }]; resultsRef.current = next; return next; });

    if (correct) {
      playSound('combo-hit');
      setTimeout(() => playSound('quiz-correct'), 150);
      if (bonus >= 10) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 }, colors: ['#06b6d4', '#10b981', '#8b5cf6'] });
      }
    } else {
      playSound('quiz-wrong');
    }

    setTimeout(() => advanceQuestion(), 2200);
  }, [timerState, selectedOptionId, currentQuestion, timeLeft, bonusPerSecondLeft, playSound, unlockAudio]);

  const advanceQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsCorrect(null);
      isCorrectRef.current = null;
      setShowExplanation(false);
      setTimerState('waiting');
      lastTickRef.current = 0;
    } else {
      setIsFinished(true);
      const latestResults = resultsRef.current;
      const correctCount = latestResults.filter(r => r.correct).length;
      const finalPercent = Math.min(100, Math.round((correctCount / questions.length) * 100));

      if (finalPercent >= 90) {
        playSound('level-up');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 } });
      } else if (finalPercent >= 60) {
        playSound('streak-bonus');
      }
      onComplete(finalPercent);
    }
  }, [currentQuestionIndex, questions.length, playSound, onComplete]);

  const progressPercent = (timeLeft / effectiveTime) * 100;

  const barGradient = {
    waiting: 'from-muted to-muted',
    normal: 'from-cyan-500 to-emerald-500',
    warning: 'from-amber-500 to-orange-500',
    critical: 'from-red-500 to-red-600',
    timeout: 'from-red-700 to-red-700',
    answered: 'from-muted to-muted',
  }[timerState];

  const timerBadgeBg = {
    waiting: 'bg-muted text-muted-foreground',
    normal: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-600 border-red-500/20',
    timeout: 'bg-red-500/15 text-red-700 border-red-500/30',
    answered: isCorrect ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground',
  }[timerState];

  // Result screen — feedback only, NO navigation buttons
  if (isFinished) {
    const correctCount = results.filter(r => r.correct).length;
    const finalPercent = Math.round((correctCount / questions.length) * 100);
    const feedbackMsg = finalPercent >= 90 ? feedback?.perfect : finalPercent >= 60 ? feedback?.good : feedback?.needsReview;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/5 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{feedbackMsg || 'Exercício concluído!'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 flex gap-3">
            <div className="flex-1 rounded-xl bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border border-cyan-500/15 p-3 text-center">
              <p className="text-2xl font-bold text-cyan-600">{correctCount}/{questions.length}</p>
              <p className="text-[10px] font-medium text-cyan-600/70 uppercase tracking-wide mt-0.5">Acertos</p>
            </div>
            {totalBonus > 0 && (
              <div className="flex-1 rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/15 p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">+{totalBonus}</p>
                <p className="text-[10px] font-medium text-amber-600/70 uppercase tracking-wide mt-0.5">Bônus</p>
              </div>
            )}
          </div>
          {/* NO internal buttons — parent V8InlineExercise owns navigation */}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-3 relative">
      <AnimatePresence>
        {showTimeoutFlash && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-red-500/15 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Timer bar — premium badge + glow progress */}
      <div className="flex items-center gap-2.5">
        <motion.div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold tabular-nums ${timerBadgeBg}`}
          animate={timerState === 'critical' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <Clock className="w-3.5 h-3.5" />
          {Math.ceil(timeLeft)}s
        </motion.div>
        <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden relative">
          <motion.div
            className={`h-full bg-gradient-to-r ${barGradient} rounded-full relative`}
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
          {(timerState === 'normal' || timerState === 'warning') && (
            <div
              className="absolute top-0 h-full rounded-full opacity-40 blur-sm bg-gradient-to-r from-cyan-400 to-emerald-400"
              style={{ width: `${progressPercent}%` }}
            />
          )}
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Question card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          x: timerState === 'critical' ? [-1, 1, -1, 0] : 0,
        }}
        transition={timerState === 'critical'
          ? { x: { duration: 0.3, repeat: Infinity } }
          : { duration: 0.35 }
        }
        className="space-y-3"
      >
        {/* Question — distinct card */}
        <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-violet-500/[0.04] p-4 relative">
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-primary to-violet-500" />
          <p className="text-[15px] font-semibold text-foreground leading-snug pl-3">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options — individual cards with letter badges */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = showExplanation && option.isCorrect;
            const showWrong = showExplanation && isSelected && !option.isCorrect;
            const isDisabled = timerState === 'answered' || timerState === 'timeout';

            let optionClasses = 'border-border bg-card hover:border-primary/30 hover:shadow-sm text-foreground';
            let badgeClasses = 'bg-muted text-muted-foreground';

            if (showCorrect) {
              optionClasses = 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10';
              badgeClasses = 'bg-emerald-500 text-white';
            } else if (showWrong) {
              optionClasses = 'border-red-500 bg-red-50 text-red-700 shadow-sm shadow-red-500/10';
              badgeClasses = 'bg-red-500 text-white';
            } else if (isDisabled) {
              optionClasses = 'border-border/50 bg-muted/20 text-muted-foreground cursor-default';
              badgeClasses = 'bg-muted/60 text-muted-foreground/60';
            }

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={isDisabled}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                animate={showWrong ? { x: [-2, 2, -2, 0] } : {}}
                transition={showWrong ? { duration: 0.25 } : {}}
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 flex items-center gap-3 ${optionClasses}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${badgeClasses}`}>
                  {showCorrect ? <CheckCircle2 className="w-4 h-4" /> : showWrong ? <XCircle className="w-4 h-4" /> : LETTER_BADGES[idx]}
                </span>
                <span className="flex-1">{option.text}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-muted/40 border border-border"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bonus indicator */}
        <AnimatePresence>
          {timerState === 'answered' && isCorrect && Math.ceil(timeLeft) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1.5 py-1"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-600">
                +{Math.ceil(timeLeft) * bonusPerSecondLeft} bônus de velocidade
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeout indicator */}
        <AnimatePresence>
          {timerState === 'timeout' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-1"
            >
              <span className="text-xs font-semibold text-red-500 flex items-center justify-center gap-1.5 bg-red-500/5 rounded-lg py-1.5 px-3 mx-auto w-fit">
                <Timer className="w-3.5 h-3.5" /> Tempo esgotado
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
