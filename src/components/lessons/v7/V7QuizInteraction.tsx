// src/components/lessons/v7/V7QuizInteraction.tsx
// Interactive quiz component for V7 lessons

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractionPoint, InteractionOption } from '@/types/v7-cinematic.types';

interface V7QuizInteractionProps {
  interaction: InteractionPoint;
  onComplete: (result: QuizResult) => void;
  onSkip?: () => void;
}

export interface QuizResult {
  completed: boolean;
  correct: boolean;
  selectedOptionId: string | null;
  timeSpent: number;
  attempts: number;
}

export const V7QuizInteraction = ({
  interaction,
  onComplete,
  onSkip,
}: V7QuizInteractionProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const options = interaction.content.options || [];
  const question = interaction.content.question || '';
  const hint = interaction.content.hint;

  const handleOptionSelect = (optionId: string) => {
    if (hasAnswered) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;

    const selectedOption = options.find((opt) => opt.id === selectedOptionId);
    const correct = selectedOption?.correct || false;

    setIsCorrect(correct);
    setHasAnswered(true);
    setShowFeedback(true);
    setAttempts((prev) => prev + 1);

    // Show feedback for a moment before completing
    setTimeout(() => {
      const result: QuizResult = {
        completed: true,
        correct,
        selectedOptionId,
        timeSpent: Date.now() - startTime,
        attempts: attempts + 1,
      };
      onComplete(result);
    }, 2500);
  };

  const handleTryAgain = () => {
    setSelectedOptionId(null);
    setHasAnswered(false);
    setIsCorrect(null);
    setShowFeedback(false);
  };

  const getFeedbackMessage = () => {
    if (!selectedOptionId) return '';
    
    const selectedOption = options.find((opt) => opt.id === selectedOptionId);
    if (selectedOption?.feedback) {
      return selectedOption.feedback;
    }
    
    if (isCorrect) {
      return interaction.feedback?.onSuccess?.content || '🎉 Correto! Excelente trabalho!';
    }
    return interaction.feedback?.onError?.content || '❌ Não é isso. Tente novamente!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Pergunta Interativa</h3>
              <p className="text-white/60 text-sm">
                {interaction.required ? 'Obrigatória' : 'Opcional'} • {interaction.points || 0} pontos
              </p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-xl text-white font-medium mb-6">{question}</p>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              const showCorrectness = hasAnswered;
              const optionIsCorrect = option.correct;

              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={hasAnswered}
                  whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                  whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all duration-300
                    ${!hasAnswered && isSelected 
                      ? 'border-cyan-500 bg-cyan-500/20' 
                      : !hasAnswered 
                        ? 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        : ''}
                    ${showCorrectness && isSelected && optionIsCorrect 
                      ? 'border-green-500 bg-green-500/20' 
                      : ''}
                    ${showCorrectness && isSelected && !optionIsCorrect 
                      ? 'border-red-500 bg-red-500/20' 
                      : ''}
                    ${showCorrectness && !isSelected && optionIsCorrect 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : ''}
                    ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Letter indicator */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${!hasAnswered 
                        ? isSelected 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-white/10 text-white/60'
                        : showCorrectness && (isSelected || optionIsCorrect)
                          ? optionIsCorrect 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                          : 'bg-white/10 text-white/60'
                      }
                    `}>
                      {showCorrectness && isSelected ? (
                        optionIsCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>

                    {/* Option text */}
                    <span className={`
                      flex-1 text-base
                      ${isSelected ? 'text-white' : 'text-white/80'}
                    `}>
                      {option.text}
                    </span>

                    {/* Correct indicator for non-selected correct option */}
                    {showCorrectness && !isSelected && optionIsCorrect && (
                      <div className="text-green-400 text-sm">← Correto</div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Hint section */}
          {hint && !hasAnswered && (
            <div className="mt-4">
              {showHint ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-sm">{hint}</p>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Mostrar dica
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  mt-6 p-4 rounded-xl border
                  ${isCorrect 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <Check className="w-6 h-6 text-green-400 shrink-0" />
                  ) : (
                    <X className="w-6 h-6 text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                    </p>
                    <p className={`text-sm mt-1 ${isCorrect ? 'text-green-200/80' : 'text-red-200/80'}`}>
                      {getFeedbackMessage()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
          <div className="text-white/40 text-sm">
            {attempts > 0 && `Tentativas: ${attempts}`}
          </div>

          <div className="flex gap-3">
            {!interaction.required && onSkip && !hasAnswered && (
              <Button variant="ghost" onClick={onSkip} className="text-white/60 hover:text-white">
                Pular
              </Button>
            )}

            {!hasAnswered ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOptionId}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white"
              >
                Confirmar
              </Button>
            ) : !isCorrect && !interaction.required ? (
              <Button onClick={handleTryAgain} variant="outline" className="border-white/20 text-white">
                Tentar novamente
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
