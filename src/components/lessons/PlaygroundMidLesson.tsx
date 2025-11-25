import { useState, useEffect, useRef, useCallback } from 'react';
import { LivAvatar } from '@/components/LivAvatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlaygroundConfig } from '@/types/guidedLesson';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check, ChevronRight, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaygroundMidLessonProps {
  config: PlaygroundConfig;
  onComplete: (answer: string | null) => void;
  lessonId?: string; // Necessário para salvar sessão
}

export function PlaygroundMidLesson({ config, onComplete, lessonId }: PlaygroundMidLessonProps) {
  const { toast } = useToast();

  // 🔍 DEBUG: Log detalhado do que foi recebido
  console.log('🎯 [PLAYGROUND RECEIVED] Config recebido:', {
    hasConfig: !!config,
    configType: config?.type,
    hasRealConfig: !!config?.realConfig,
    realConfigKeys: config?.realConfig ? Object.keys(config.realConfig) : [],
    realConfigComplete: config?.realConfig ? {
      title: config.realConfig.title,
      maiaMessage: config.realConfig.maiaMessage,
      scenario: config.realConfig.scenario,
      prefilledText: config.realConfig.prefilledText,
      userPlaceholder: config.realConfig.userPlaceholder,
      validation: config.realConfig.validation,
    } : null,
    fullConfig: JSON.stringify(config, null, 2)
  });

  // ✅ VALIDAÇÃO ROBUSTA: Type guards explícitos
  if (!config) {
    console.error('❌ [PLAYGROUND ERROR] config é undefined/null!');
    toast({
      title: '⚠️ Erro de configuração',
      description: 'Configuração do playground não encontrada',
      variant: 'destructive'
    });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="max-w-md p-6">
          <p className="text-center text-destructive">
            ❌ Erro: Configuração do playground não encontrada
          </p>
          <Button onClick={() => onComplete(null)} className="w-full mt-4">
            Fechar
          </Button>
        </Card>
      </div>
    );
  }

  if (config.type !== 'real-playground' && config.type !== 'multiple-choice-with-feedback') {
    console.error('❌ [PLAYGROUND ERROR] Tipo de playground inválido:', config.type);
  }

  if (config.type === 'real-playground' && !config.realConfig) {
    console.error('❌ [PLAYGROUND ERROR] realConfig está vazio para tipo real-playground!', {
      configKeys: Object.keys(config),
      configType: config.type
    });
  }

  // Verifica se é playground real ou múltipla escolha
  const isRealPlayground = config.type === 'real-playground' && config.realConfig;

  console.log('✅ [PLAYGROUND TYPE] Tipo determinado:', {
    isRealPlayground,
    configType: config.type,
    hasRealConfig: !!config.realConfig
  });

  // Estados para playground real
  const [userInput, setUserInput] = useState('');
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    feedback: string;
  }>({ isValid: false, feedback: '' });

  // Estados para IA REAL
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showAIResult, setShowAIResult] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Estados para múltipla escolha (retrocompatibilidade)
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  
  // Estados para UX melhorado
  const [highlightResponse, setHighlightResponse] = useState(false);
  const aiResponseRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll para resposta da IA quando ela aparecer
  useEffect(() => {
    if (showAIResult && aiResponse && aiResponseRef.current) {
      setTimeout(() => {
        aiResponseRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
      
      // Trigger highlight animation
      setHighlightResponse(true);
      setTimeout(() => setHighlightResponse(false), 2000);
    }
  }, [showAIResult, aiResponse]);

  // Handlers para múltipla escolha
  const handleContinue = useCallback(() => {
    if (selectedOption) {
      onComplete(selectedOption);
    }
  }, [selectedOption, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete(null);
  }, [onComplete]);

  const handleCreateAnother = useCallback(() => {
    setUserInput('');
    setValidationState({ isValid: false, feedback: '' });
    setAiResponse(null);
    setAiFeedback(null);
    setShowAIResult(false);
    setHighlightResponse(false);
  }, []);

  // ============================================================================
  // HANDLERS PARA IA REAL
  // ============================================================================

  // Gerar resposta da IA usando edge function
  const generateAIResponse = async () => {
    console.log('🤖 [PLAYGROUND AI] Iniciando chamada de IA...', { lessonId });

    if (!lessonId) {
      console.error('❌ [PLAYGROUND AI] lessonId não fornecido!');
      toast({
        title: '⚠️ Erro de configuração',
        description: 'lessonId não fornecido para chamada de IA',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingAI(true);

    try {
      const fullPrompt = `${config.realConfig!.prefilledText} ${userInput}`;
      console.log('📝 [PLAYGROUND AI] Prompt completo:', fullPrompt);

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('lesson-playground', {
        body: { lessonId, prompt: fullPrompt }
      });
      const elapsed = Date.now() - startTime;

      if (error) {
        console.error('❌ [PLAYGROUND AI] Edge function error:', error);
        toast({
          title: '❌ Erro ao gerar resposta',
          description: 'Não foi possível conectar com a IA. Tente novamente.',
          variant: 'destructive'
        });
        return;
      }

      console.log('✅ [PLAYGROUND AI] Resposta recebida em', elapsed, 'ms', {
        responseLength: data.aiResponse?.length,
        feedbackLength: data.aiFeedback?.length
      });

      setAiResponse(data.aiResponse);
      setAiFeedback(data.aiFeedback);
      setShowAIResult(true);

      toast({
        title: '✅ Resposta gerada!',
        description: 'A IA processou seu prompt com sucesso.',
      });

    } catch (err: any) {
      console.error('❌ [PLAYGROUND AI] Erro ao chamar IA:', err);
      toast({
        title: '❌ Erro inesperado',
        description: err.message || 'Algo deu errado ao gerar a resposta.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingAI(false);
      console.log('🏁 [PLAYGROUND AI] Chamada finalizada');
    }
  };

  // Copiar prompt completo para clipboard
  const handleCopyPrompt = async () => {
    const fullPrompt = `${config.realConfig!.prefilledText} ${userInput}`;

    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopiedPrompt(true);
      toast({
        title: '📋 Copiado!',
        description: 'Prompt copiado para a área de transferência',
      });

      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Handler para playground real
  const handleRealPlaygroundComplete = () => {
    onComplete(userInput);
  };

  // Renderizar playground REAL
  if (isRealPlayground && config.realConfig) {
    const fullPrompt = `${config.realConfig.prefilledText} ${userInput}`;

    return (
      <div 
        data-testid="playground-mid-lesson"
        data-playground-type="real"
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="bg-background rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 py-4 px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <LivAvatar
                size="medium"
                showHalo={false}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">⏸️ {config.realConfig.title}</h3>
                <p className="text-white/90 text-sm">Vamos praticar o que você aprendeu!</p>
              </div>
              <button
                onClick={handleSkip}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Fechar playground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="p-6">
            {/* Mensagem da Liv */}
            <div className="bg-cyan-50 dark:bg-cyan-950/30 border-2 border-cyan-200 dark:border-cyan-800 rounded-xl p-5 mb-4">
              <h4 className="font-semibold text-foreground mb-3">
                Complete o Desafio:
              </h4>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-normal leading-relaxed text-balance">
                🤖 {config.realConfig.maiaMessage}
              </p>
            </div>
            
            {/* Playground */}
            <div className="mb-4">
              <h4 className="font-semibold text-foreground mb-3">
                ✍️ Digite seu prompt:
              </h4>
              
              {/* Parte editável */}
              <div className="relative">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={config.realConfig.userPlaceholder}
                  className="w-full px-4 py-3 pr-14 border-2 border-cyan-400 rounded-lg font-medium min-h-[100px] focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                {/* Botão de enviar dentro do textarea */}
                <button
                  onClick={generateAIResponse}
                  disabled={!validationState.isValid || isGeneratingAI}
                  className={cn(
                    "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                    validationState.isValid && !isGeneratingAI
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label="Enviar prompt"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Dica: Seja específico! Mencione para quem, sobre o quê e qual tom.
                </p>
              </div>
            </div>
            
            {/* Feedback da Liv (dinâmico) - mais discreto */}
            {validationState.feedback && userInput && !showAIResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                validationState.isValid 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning'
              }`}>
                <span>{validationState.isValid ? '✅' : '⚠️'}</span>
                <p className="flex-1">{validationState.feedback}</p>
              </div>
            )}

            {/* Resposta da IA - com auto-scroll e highlight */}
            {showAIResult && aiResponse && (
              <div 
                ref={aiResponseRef}
                className={`space-y-4 transition-all duration-300 ${
                  highlightResponse ? 'ring-2 ring-primary ring-offset-4' : ''
                }`}
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-5 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h5 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    Resposta da IA:
                  </h5>
                  <p className="leading-relaxed whitespace-pre-wrap text-base">
                    {aiResponse}
                  </p>
                </div>

                {aiFeedback && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-xl p-5 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                    <h5 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Feedback sobre seu prompt:
                    </h5>
                    <p className="leading-relaxed text-base">
                      {aiFeedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botões de ação */}
            <div className="space-y-3">
              {/* Botões de ação final - dois botões quando tem resposta */}
              {showAIResult && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    onClick={handleCreateAnother}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <span className="mr-2">🔄</span>
                    Criar outro prompt
                  </Button>
                  <Button
                    onClick={() => onComplete(userInput)}
                    size="lg"
                    className="flex-1"
                    data-testid="playground-mid-continue"
                  >
                    Continuar Aula
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar múltipla escolha (retrocompatibilidade)
  return (
    <Card 
      data-testid="playground-mid-lesson"
      data-playground-type="multiple-choice"
      className="max-w-xl w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-300 bg-gradient-to-br from-white/95 to-white/90"
    >
      <div className="flex justify-center mb-6">
        <LivAvatar 
          size="large"
          showHalo={true}
          state="listening"
          theme="fundamentos"
        />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2 text-balance">🎮 Hora de praticar!</h3>
        <p className="text-muted-foreground font-normal">{config.instruction}</p>
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
          Pular
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedOption}
          className="flex-1"
        >
          Continuar Aula
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        💡 Este exercício não afeta sua nota, é apenas para fixar o aprendizado!
      </p>
    </Card>
  );
}
