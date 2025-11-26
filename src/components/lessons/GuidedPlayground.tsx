import { useState } from 'react';
import { LivAvatar } from '@/components/LivAvatar';
import { FinalPlaygroundConfig } from '@/types/guidedLesson';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GuidedPlaygroundProps {
  config: FinalPlaygroundConfig;
  onComplete: () => void;
}

export function GuidedPlayground({ config, onComplete }: GuidedPlaygroundProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;

  const canProceed = () => {
    const answer = answers[currentStep.stepNumber];
    if (!answer) return false;

    if (currentStep.type === 'textarea') {
      return answer.length >= (currentStep.minLength || 20);
    }

    if (currentStep.type === 'prompt-builder') {
      return currentStep.template?.parts.every(part => 
        answer[part.id]?.trim().length > 0
      ) ?? false;
    }

    return true;
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleCopyPrompt = () => {
    const step1 = answers[1]; // ferramenta
    const step2 = answers[2]; // descrição
    const step3 = answers[3]; // prompt montado
    
    let fullPrompt = '';
    if (step3) {
      fullPrompt = `${step3.context}\n\n${step3.task}\n\n${step3.tone}`;
    }

    navigator.clipboard.writeText(fullPrompt);
    toast.success('Prompt copiado! Cole na ferramenta que você escolheu.');
  };

  return (
    <div 
      data-testid="guided-playground"
      data-current-step={currentStepIndex}
      data-total-steps={config.steps.length}
      className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <LivAvatar
            size="medium"
            showHalo={true}
            className="mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
          <p className="text-muted-foreground mb-4">{config.maiaIntro}</p>
          <div className="flex gap-2 max-w-md mx-auto">
            {config.steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < currentStepIndex 
                    ? 'bg-green-500' 
                    : index === currentStepIndex 
                    ? 'bg-cyan-500' 
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {currentStep.stepNumber}
              </div>
              <h3 className="text-2xl font-bold">{currentStep.title}</h3>
            </div>
            <p className="text-lg text-muted-foreground">{currentStep.question}</p>
          </div>

          {/* Radio Step */}
          {currentStep.type === 'radio' && currentStep.options && (
            <RadioGroup 
              value={answers[currentStep.stepNumber]}
              onValueChange={(value) => setAnswers(prev => ({ ...prev, [currentStep.stepNumber]: value }))}
              className="space-y-3"
            >
              {currentStep.options.map((option) => (
                <div 
                  key={option.value}
                  className="flex items-start space-x-3 border-2 rounded-lg p-4 hover:border-primary transition-all"
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-bold">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Textarea Step */}
          {currentStep.type === 'textarea' && (
            <div>
              <Textarea
                value={answers[currentStep.stepNumber] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentStep.stepNumber]: e.target.value }))}
                placeholder={currentStep.placeholder}
                className="min-h-[150px] text-base"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Mínimo de {currentStep.minLength || 20} caracteres
              </p>
            </div>
          )}

          {/* Prompt Builder Step */}
          {currentStep.type === 'prompt-builder' && currentStep.template && (
            <div className="space-y-6">
              {currentStep.template.parts.map((part) => (
                <div key={part.id}>
                  <Label className="text-base font-bold mb-2 block">{part.label}</Label>
                  <Input
                    value={answers[currentStep.stepNumber]?.[part.id] || ''}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [currentStep.stepNumber]: {
                        ...prev[currentStep.stepNumber],
                        [part.id]: e.target.value
                      }
                    }))}
                    placeholder={part.placeholder}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground mt-1">{part.hint}</p>
                </div>
              ))}

              {/* Preview */}
              {canProceed() && (
                <div className="mt-6 p-6 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/30 dark:to-purple-950/30 rounded-xl">
                  <h5 className="text-sm font-bold uppercase text-muted-foreground mb-3">
                    👁️ Visualize seu prompt:
                  </h5>
                  <div className="space-y-2 text-foreground font-medium">
                    {currentStep.template.parts.map(part => (
                      <p key={part.id}>
                        {answers[currentStep.stepNumber]?.[part.id]}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStepIndex > 0 && (
            <Button
              onClick={() => setCurrentStepIndex(prev => prev - 1)}
              variant="outline"
              size="lg"
            >
              ← Voltar
            </Button>
          )}
          
          {isLastStep && canProceed() && (
            <Button
              onClick={handleCopyPrompt}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              📋 Copiar Prompt
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            size="lg"
            className="flex-1"
            data-testid="guided-playground-next"
          >
            {isLastStep ? '🎉 Finalizar Aula' : 'Próximo →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
