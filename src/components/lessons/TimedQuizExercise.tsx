import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, Timer, Trophy } from 'lucide-react';
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

export function TimedQuizExercise({ title, instruction, data, onComplete }: TimedQuizExerciseProps) {
  const { timePerQuestion, bonusPerSecondLeft, timeoutPenalty, feedback } = data;
  const questions = (data.questions || []).slice(0, MAX_QUESTIONS);

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
      // Report immediately — parent owns navigation buttons
      onComplete(finalPercent);
    }
  }, [currentQuestionIndex, questions.length, playSound, onComplete]);

  const progressPercent = (timeLeft / effectiveTime) * 100;

  const timerColor = {
    waiting: 'text-slate-400',
    normal: 'text-cyan-500',
    warning: 'text-amber-500',
    critical: 'text-red-500 animate-pulse',
    timeout: 'text-red-600',
    answered: isCorrect ? 'text-emerald-500' : 'text-slate-400',
  }[timerState];

  const barColor = {
    waiting: 'bg-slate-300',
    normal: 'bg-gradient-to-r from-cyan-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
    critical: 'bg-gradient-to-r from-red-500 to-red-600',
    timeout: 'bg-red-700',
    answered: 'bg-slate-300',
  }[timerState];

  const cardBorderColor = {
    waiting: 'border-border',
    normal: 'border-border',
    warning: 'border-amber-400/50',
    critical: 'border-red-500/50',
    timeout: 'border-red-500/60',
    answered: isCorrect ? 'border-emerald-400/50' : 'border-red-400/40',
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
        <div className="bg-card rounded-xl border border-border p-5 text-center space-y-3">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{feedbackMsg || 'Exercício concluído!'}</p>
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-2xl font-bold text-cyan-600">{correctCount}/{questions.length}</p>
              <p className="text-xs text-muted-foreground">Acertos</p>
            </div>
            {totalBonus > 0 && (
              <div>
                <p className="text-2xl font-bold text-amber-500">+{totalBonus}</p>
                <p className="text-xs text-muted-foreground">Bônus</p>
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

      <div className="flex items-center gap-3">
        <motion.span
          className={`text-2xl font-mono font-bold tabular-nums ${timerColor} min-w-[48px] text-center`}
          animate={timerState === 'critical' ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {Math.ceil(timeLeft)}s
        </motion.span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
      </div>

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
        className={`bg-card rounded-xl border ${cardBorderColor} p-4 transition-colors duration-200`}
      >
        <p className="text-[15px] font-medium text-foreground mb-3 leading-snug">
          {currentQuestion.question}
        </p>

        <div className="space-y-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = showExplanation && option.isCorrect;
            const showWrong = showExplanation && isSelected && !option.isCorrect;

            let optionClasses = 'border border-border bg-muted/40 hover:bg-muted/70 hover:border-primary/30 text-foreground';
            if (showCorrect) {
              optionClasses = 'border border-emerald-500 bg-emerald-50 text-emerald-700';
            } else if (showWrong) {
              optionClasses = 'border border-red-500 bg-red-50 text-red-700';
            } else if (timerState === 'answered' || timerState === 'timeout') {
              optionClasses = 'border border-border/50 bg-muted/20 text-muted-foreground cursor-default';
            }

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={timerState === 'answered' || timerState === 'timeout'}
                whileTap={timerState !== 'answered' && timerState !== 'timeout' ? { scale: 0.98 } : {}}
                animate={showWrong ? { x: [-2, 2, -2, 0] } : {}}
                transition={showWrong ? { duration: 0.25 } : {}}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 flex items-center gap-2 ${optionClasses}`}
              >
                {showCorrect && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />}
                {showWrong && <XCircle className="w-4 h-4 flex-shrink-0 text-red-500" />}
                <span>{option.text}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExplanation && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {timerState === 'answered' && isCorrect && Math.ceil(timeLeft) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600">
                +{Math.ceil(timeLeft) * bonusPerSecondLeft} bônus
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {timerState === 'timeout' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center"
            >
              <span className="text-xs font-medium text-red-500 flex items-center justify-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Tempo esgotado
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
