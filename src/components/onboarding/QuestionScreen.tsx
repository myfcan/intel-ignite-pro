import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface QuestionOption {
  value: string;
  label: string;
  subtitle?: string;
  emoji: string;
  highlight?: boolean;
  badge?: string;
}

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  type: 'single-choice' | 'multiple-choice';
  options: QuestionOption[];
}

interface QuestionScreenProps {
  question: Question;
  progress: number;
  onAnswer: (questionId: string, value: string) => void;
}

export const QuestionScreen = ({ question, progress, onAnswer }: QuestionScreenProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleClick = (value: string) => {
    if (question.type === 'single-choice') {
      onAnswer(question.id, value);
    } else {
      // Multiple choice
      const newSelected = selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value];
      setSelected(newSelected);
    }
  };

  const handleContinue = () => {
    onAnswer(question.id, selected.join(','));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">{Math.round(progress)}% completo</p>
        </div>

        {/* Question */}
        <h1 className="text-3xl font-bold mb-2">{question.question}</h1>
        {question.subtitle && <p className="text-gray-600 mb-8">{question.subtitle}</p>}

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleClick(option.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                option.highlight 
                  ? 'border-amber-400 bg-amber-50' 
                  : selected.includes(option.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <span className="text-3xl">{option.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold">{option.label}</div>
                {option.subtitle && <div className="text-sm text-gray-500">{option.subtitle}</div>}
              </div>
              {option.badge && (
                <span className="px-3 py-1 bg-amber-400 text-xs font-bold rounded-full">
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {question.type === 'multiple-choice' && selected.length > 0 && (
          <Button 
            onClick={handleContinue}
            className="mt-8 w-full"
            size="lg"
          >
            Continuar →
          </Button>
        )}
      </div>
    </div>
  );
};
