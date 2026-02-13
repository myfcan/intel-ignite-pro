import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, CheckCircle2, XCircle, Timer, Trophy } from 'lucide-react';
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

export function TimedQuizExercise({ title, instruction, data, onComplete }: TimedQuizExerciseProps) {
  const { questions, timePerQuestion, bonusPerSecondLeft, timeoutPenalty, feedback } = data;

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

  const currentQuestion = questions[currentQuestionIndex];
  const maxPossible = questions.length * (100 + timePerQuestion * bonusPerSecondLeft);
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
          // Tick sounds
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
      setSelectedOptionId(correctOption?.id ?? null);
      setShowExplanation(true);
      setResults(prev => [...prev, { correct: false, bonus: 0 }]);

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
    setShowExplanation(true);

    const secondsLeft = Math.ceil(timeLeft);
    const bonus = correct ? secondsLeft * bonusPerSecondLeft : 0;
    const points = correct ? 100 + bonus : 0;

    setTotalPoints(prev => prev + points);
    if (bonus > 0) setTotalBonus(prev => prev + bonus);
    setResults(prev => [...prev, { correct, bonus }]);

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
      setShowExplanation(false);
      setTimerState('waiting');
      lastTickRef.current = 0;
    } else {
      setIsFinished(true);
      const scorePercent = (totalPoints / maxPossible) * 100;
      const correctCount = results.length > 0 ? results.filter(r => r.correct).length + (isCorrect ? 1 : 0) : (isCorrect ? 1 : 0);
      const finalPercent = Math.min(100, Math.round((correctCount / questions.length) * 100));

      if (finalPercent >= 90) {
        playSound('level-up');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 } });
      } else if (finalPercent >= 60) {
        playSound('streak-bonus');
      }

      setTimeout(() => onComplete(finalPercent), 2500);
    }
  }, [currentQuestionIndex, questions.length, totalPoints, maxPossible, results, isCorrect, playSound, onComplete]);

  const progressPercent = (timeLeft / effectiveTime) * 100;

  const timerColor = {
    waiting: 'text-slate-400',
    normal: 'text-cyan-400',
    warning: 'text-amber-400',
    critical: 'text-red-400 animate-pulse',
    timeout: 'text-red-500',
    answered: isCorrect ? 'text-emerald-400' : 'text-slate-400',
  }[timerState];

  const barGradient = {
    waiting: 'from-slate-500 to-slate-400',
    normal: 'from-cyan-500 to-emerald-500',
    warning: 'from-amber-500 to-orange-500',
    critical: 'from-red-500 to-red-600',
    timeout: 'from-red-700 to-red-800',
    answered: 'from-slate-500 to-slate-400',
  }[timerState];

  const cardBorder = {
    waiting: 'border-white/10',
    normal: 'border-white/10',
    warning: 'border-amber-400/40',
    critical: 'border-red-500/50',
    timeout: 'border-red-500/60',
    answered: isCorrect ? 'border-emerald-400/40' : 'border-red-400/30',
  }[timerState];

  if (isFinished) {
    const correctCount = results.filter(r => r.correct).length;
    const finalPercent = Math.round((correctCount / questions.length) * 100);
    const feedbackMsg = finalPercent >= 90 ? feedback?.perfect : finalPercent >= 60 ? feedback?.good : feedback?.needsReview;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 p-8 text-center space-y-6">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-lg text-slate-300">{feedbackMsg || 'Exercício concluído!'}</p>
          <div className="flex justify-center gap-8 text-slate-300">
            <div>
              <p className="text-3xl font-bold text-cyan-400">{correctCount}/{questions.length}</p>
              <p className="text-sm">Acertos</p>
            </div>
            {totalBonus > 0 && (
              <div>
                <p className="text-3xl font-bold text-amber-400">+{totalBonus}</p>
                <p className="text-sm">Bônus tempo</p>
              </div>
            )}
          </div>
          {totalBonus > 0 && feedback?.timeBonus && (
            <p className="text-sm text-amber-300/80">{feedback.timeBonus}</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {/* Timeout flash overlay */}
      <AnimatePresence>
        {showTimeoutFlash && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-red-500/20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Vignette on critical */}
      {timerState === 'critical' && (
        <div className="fixed inset-0 pointer-events-none z-40"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }}
        />
      )}

      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{instruction}</p>
        <p className="text-xs text-slate-500">
          Pergunta {currentQuestionIndex + 1} de {questions.length}
        </p>
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className={`text-5xl font-mono font-bold tabular-nums ${timerColor}`}
          animate={timerState === 'critical' ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {Math.ceil(timeLeft)}s
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${barGradient} rounded-full`}
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Question card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          x: timerState === 'critical' ? [-1.5, 1.5, -1.5, 0] : 0,
        }}
        transition={timerState === 'critical'
          ? { x: { duration: 0.3, repeat: Infinity } }
          : { duration: 0.4 }
        }
        className={`bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border-2 ${cardBorder} p-6 transition-colors duration-300`}
      >
        {/* Question text */}
        <p className="text-lg font-medium text-white mb-6 leading-relaxed">
          {currentQuestion.question}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = showExplanation && option.isCorrect;
            const showWrong = showExplanation && isSelected && !option.isCorrect;

            let optionClasses = 'border border-white/10 bg-slate-800/50 hover:bg-slate-700/60 hover:border-cyan-400/30 text-slate-200';
            if (showCorrect) {
              optionClasses = 'border-2 border-emerald-400 bg-emerald-500/15 text-emerald-300';
            } else if (showWrong) {
              optionClasses = 'border-2 border-red-400 bg-red-500/15 text-red-300';
            } else if (timerState === 'answered' || timerState === 'timeout') {
              optionClasses = 'border border-white/5 bg-slate-800/30 text-slate-500 cursor-default';
            }

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={timerState === 'answered' || timerState === 'timeout'}
                whileHover={timerState !== 'answered' && timerState !== 'timeout' ? { scale: 1.02 } : {}}
                whileTap={timerState !== 'answered' && timerState !== 'timeout' ? { scale: 0.98 } : {}}
                animate={showWrong ? { x: [-3, 3, -3, 0] } : {}}
                transition={showWrong ? { duration: 0.3 } : {}}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2 ${optionClasses}`}
              >
                {showCorrect && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />}
                {showWrong && <XCircle className="w-4 h-4 flex-shrink-0 text-red-400" />}
                <span>{option.text}</span>
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
              className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-white/5"
            >
              <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bonus badge */}
        <AnimatePresence>
          {timerState === 'answered' && isCorrect && Math.ceil(timeLeft) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">
                +{Math.ceil(timeLeft) * bonusPerSecondLeft} bônus de velocidade!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeout message */}
        <AnimatePresence>
          {timerState === 'timeout' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center"
            >
              <span className="text-sm font-medium text-red-400">⏰ Tempo esgotado!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Score footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span className="flex items-center gap-1">
          <Timer className="w-3.5 h-3.5" />
          {results.filter(r => r.correct).length} acertos
        </span>
        {totalBonus > 0 && (
          <span className="flex items-center gap-1 text-amber-400/70">
            <Zap className="w-3.5 h-3.5" />
            +{totalBonus} bônus
          </span>
        )}
      </div>
    </div>
  );
}
