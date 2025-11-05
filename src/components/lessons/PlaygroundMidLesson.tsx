import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { PlaygroundConfig } from '@/types/guidedLesson';

interface PlaygroundMidLessonProps {
  config: PlaygroundConfig;
  onComplete: (answer: string | null) => void;
}

export function PlaygroundMidLesson({ config, onComplete }: PlaygroundMidLessonProps) {
  // Verifica se é playground real ou múltipla escolha
  const isRealPlayground = config.type === 'real-playground' && config.realConfig;

  // Estados para playground real
  const [userInput, setUserInput] = useState('');
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    feedback: string;
  }>({ isValid: false, feedback: '' });

  // Estados para múltipla escolha (retrocompatibilidade)
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');

  // Validação em tempo real para playground real
  useEffect(() => {
    if (!isRealPlayground || !config.realConfig) return;

    const validate = () => {
      if (userInput.length === 0) {
        return { isValid: false, feedback: '' };
      }
      
      if (userInput.length < config.realConfig!.validation.minLength) {
        return { isValid: false, feedback: config.realConfig!.validation.feedback.tooShort };
      }
      
      const hasAllKeywords = config.realConfig!.validation.requiredKeywords?.every(keywordGroup =>
        keywordGroup.some(keyword => 
          userInput.toLowerCase().includes(keyword.toLowerCase())
        )
      ) ?? true;
      
      if (!hasAllKeywords) {
        return { isValid: false, feedback: config.realConfig!.validation.feedback.good };
      }
      
      return { isValid: true, feedback: config.realConfig!.validation.feedback.excellent };
    };
    
    setValidationState(validate());
  }, [userInput, config, isRealPlayground]);

  // Handlers para múltipla escolha
  const handleContinue = () => {
    if (selectedOption) {
      onComplete(selectedOption);
    }
  };

  const handleSkip = () => {
    onComplete(null);
  };

  // Handler para playground real
  const handleRealPlaygroundComplete = () => {
    onComplete(userInput);
  };

  // Renderizar playground REAL
  if (isRealPlayground && config.realConfig) {
    const fullPrompt = `${config.realConfig.prefilledText} ${userInput}`;

    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-background rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <img 
                src="/maia-avatar-v3.png" 
                alt="MAIA" 
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex-shrink-0" 
              />
              <div>
                <h3 className="text-white font-bold text-xl">⏸️ {config.realConfig.title}</h3>
                <p className="text-white/90 text-sm">Vamos praticar o que você aprendeu!</p>
              </div>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="p-8">
            {/* Mensagem da MAIA */}
            <div className="bg-cyan-50 dark:bg-cyan-950/30 border-2 border-cyan-200 dark:border-cyan-800 rounded-xl p-5 mb-6">
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                🤖 {config.realConfig.maiaMessage}
              </p>
            </div>
            
            {/* Situação */}
            <div className="mb-6">
              <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                📋 {config.realConfig.scenario.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {config.realConfig.scenario.description}
              </p>
            </div>
            
            {/* Playground */}
            <div className="mb-6">
              <h4 className="font-bold text-foreground mb-3">
                ✍️ Complete o prompt:
              </h4>
              
              {/* Parte pré-preenchida */}
              <div className="mb-3">
                <input
                  type="text"
                  value={config.realConfig.prefilledText}
                  disabled
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-lg text-muted-foreground font-medium"
                />
              </div>
              
              {/* Parte editável */}
              <div>
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={config.realConfig.userPlaceholder}
                  className="w-full px-4 py-3 border-2 border-cyan-400 rounded-lg font-medium min-h-[120px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Dica: Seja específico! Mencione para quem, sobre o quê e qual tom.
                </p>
              </div>
            </div>
            
            {/* Feedback da MAIA (dinâmico) */}
            {validationState.feedback && (
              <div className={`p-4 rounded-xl mb-6 ${
                validationState.isValid 
                  ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-300 dark:border-yellow-800'
              }`}>
                <p className={`text-sm font-medium ${
                  validationState.isValid ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'
                }`}>
                  {validationState.feedback}
                </p>
              </div>
            )}
            
            {/* Prompt completo preview */}
            {userInput.length >= config.realConfig.validation.minLength && (
              <div className="bg-muted border-2 border-border rounded-xl p-5 mb-6">
                <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  👁️ Seu prompt completo:
                </h5>
                <p className="text-foreground font-medium leading-relaxed">
                  "{fullPrompt}"
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  💾 Você pode copiar e usar esse prompt no ChatGPT de verdade depois!
                </p>
              </div>
            )}
            
            {/* Botão Continuar */}
            <Button
              onClick={handleRealPlaygroundComplete}
              disabled={!validationState.isValid}
              className="w-full py-6 text-lg font-bold"
              size="lg"
            >
              {validationState.isValid ? '✅ Continuar Aula' : '⏳ Complete o prompt para continuar'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar múltipla escolha (retrocompatibilidade)
  return (
    <Card className="max-w-xl w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-center mb-6">
        <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-lg">
          <AvatarImage src="/maia-avatar-v3.png" alt="MAIA" />
        </Avatar>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">🎮 Hora de praticar!</h3>
        <p className="text-muted-foreground">{config.instruction}</p>
      </div>

      <div className="space-y-4 mb-6">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {config.options?.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                selectedOption === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {selectedOption && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Label htmlFor="reasoning" className="text-sm text-muted-foreground mb-2 block">
            Por quê você escolheu essa opção? (opcional)
          </Label>
          <Textarea
            id="reasoning"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explique seu raciocínio..."
            className="min-h-[80px] resize-none"
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="flex-1"
        >
          ⏭️ Pular
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedOption}
          className="flex-1"
        >
          ✅ Continuar Aula
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        💡 Este exercício não afeta sua nota, é apenas para fixar o aprendizado!
      </p>
    </Card>
  );
}
