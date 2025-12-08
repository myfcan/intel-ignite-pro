import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { PlaygroundConfig } from '@/types/guidedLesson';
import { 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  User, 
  ListChecks, 
  MessageSquare, 
  Copy, 
  Check,
  X,
  Edit3,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// CONTRATO DE DADOS V2
// ============================================================================
export interface PlaygroundExampleDataV2 {
  title: string;              // título curto do modal
  context: string;            // 1 ou 2 frases no máximo
  requirements: string[];     // sempre 4 itens, já com colchetes
  examplePrompt: string;      // modelo de prompt com colchetes
}

interface PlaygroundBridgeV2Props {
  /** Dados estruturados do exemplo V2 */
  playgroundExample?: PlaygroundExampleDataV2;
  /** Configuração do playground */
  playgroundConfig: PlaygroundConfig;
  /** Callback quando completa o playground */
  onComplete: (answer: string | null) => void;
  /** Callback quando pula o playground */
  onSkip: () => void;
  /** ID da lição para salvar sessão */
  lessonId?: string;
}

/**
 * 🌉 PLAYGROUND BRIDGE V2
 * 
 * Fluxo interativo em 2 modais:
 * 1. Modal de EXEMPLO: mostra caso concreto com requisitos preenchidos
 * 2. Modal de PRÁTICA: aluno edita o modelo de prompt e envia ao playground
 */
export function PlaygroundBridgeV2({
  playgroundExample,
  playgroundConfig,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV2Props) {
  const [phase, setPhase] = useState<'example' | 'practice' | 'playground'>('example');
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [highlightedReq, setHighlightedReq] = useState<number | null>(null);
  const { toast } = useToast();
  
  // ===== SISTEMA SEQUENCIAL =====
  // Qual requisito está ativo para preenchimento (0-3)
  const [activeStep, setActiveStep] = useState(0);
  // Quais requisitos já foram preenchidos/ativados
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  // Prompt que vai sendo construído com os valores preenchidos
  const [builtPrompt, setBuiltPrompt] = useState(playgroundExample?.examplePrompt || '');
  
  // Ordem fixa: Produto (1), Público (2), Tom (3), Objetivo (4)
  const orderedRequirements = playgroundExample?.requirements ? [
    playgroundExample.requirements[0], // Produto
    playgroundExample.requirements[1], // Público
    playgroundExample.requirements[3], // Tom (era índice 3)
    playgroundExample.requirements[2], // Objetivo (era índice 2)
  ] : [];
  
  // Mapeia índice do step para o colchete no prompt e o valor a substituir
  const getStepMapping = (stepIndex: number) => {
    const mappings = [
      { bracket: /\[produto principal\]/gi, valueKey: 0 },   // Produto
      { bracket: /\[público\]/gi, valueKey: 1 },             // Público
      { bracket: /\[tom de voz\]/gi, valueKey: 2 },          // Tom
      { bracket: /\[objetivo do post\]/gi, valueKey: 3 },    // Objetivo
    ];
    return mappings[stepIndex];
  };
  
  // Extrai o valor do colchete de um requisito (ex: "Produto: [pão]" → "pão")
  const extractBracketValue = (requirement: string) => {
    const match = requirement.match(/\[([^\]]+)\]/);
    return match ? match[1] : '';
  };

  console.log('🌉 [BRIDGE-V2] Renderizando:', { 
    phase, 
    hasExample: !!playgroundExample,
  });

  // Fallback: se não tem playgroundExample, vai direto pro playground
  if (!playgroundExample) {
    console.warn('⚠️ [BRIDGE-V2] playgroundExample ausente, pulando modais');
    return (
      <PlaygroundMidLesson
        config={playgroundConfig}
        onComplete={onComplete}
        lessonId={lessonId}
        playgroundExample={undefined}
      />
    );
  }

  // Inicializa o userPrompt com o modelo quando entra na fase de prática
  const handleStartPractice = useCallback(() => {
    console.log('🌉 [BRIDGE-V2] Transição: Exemplo → Prática');
    setIsFlipping(true);
    setUserPrompt(playgroundExample.examplePrompt);
    
    setTimeout(() => {
      setPhase('practice');
      setIsFlipping(false);
    }, 400);
  }, [playgroundExample.examplePrompt]);

  // Envia o prompt editado para o playground real
  const handleSendToPlayground = useCallback(() => {
    if (!userPrompt.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Preencha o prompt antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    console.log('🌉 [BRIDGE-V2] Transição: Prática → Playground com prompt:', userPrompt);
    setIsFlipping(true);
    
    setTimeout(() => {
      setPhase('playground');
      setIsFlipping(false);
    }, 400);
  }, [userPrompt, toast]);

  const handleCopyPrompt = useCallback(() => {
    if (!playgroundExample?.examplePrompt) return;
    
    navigator.clipboard.writeText(playgroundExample.examplePrompt);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Prompt copiado para a área de transferência",
    });
    
    setTimeout(() => setCopied(false), 2000);
  }, [playgroundExample?.examplePrompt, toast]);

  // Mapeia requisitos para os colchetes correspondentes no prompt
  // Nova ordem: Produto (0), Público (1), Tom (2), Objetivo (3)
  const getReqBracketMap = () => {
    const bracketKeywords: Record<number, string[]> = {
      0: ['produto', 'principal'],      // Produto → [produto principal]
      1: ['público'],                    // Público → [público]
      2: ['tom'],                        // Tom → [tom de voz]
      3: ['objetivo'],                   // Objetivo → [objetivo do post]
    };
    return bracketKeywords;
  };

  // Handler para clicar em uma caixinha sequencial
  const handleStepClick = (stepIndex: number) => {
    // Só pode clicar no step ativo atual
    if (stepIndex !== activeStep) return;
    
    // Obtém o mapeamento e o valor a substituir
    const mapping = getStepMapping(stepIndex);
    const requirement = orderedRequirements[stepIndex];
    const value = extractBracketValue(requirement || '');
    
    // Substitui o colchete no prompt pelo valor
    if (mapping && value) {
      setBuiltPrompt(prev => prev.replace(mapping.bracket, value));
    }
    
    // Marca como completado
    const newCompleted = [...completedSteps];
    newCompleted[stepIndex] = true;
    setCompletedSteps(newCompleted);
    
    // Destaca o colchete correspondente
    setHighlightedReq(stepIndex);
    
    // Avança para o próximo step (se houver)
    if (stepIndex < 3) {
      setTimeout(() => {
        setActiveStep(stepIndex + 1);
        setHighlightedReq(stepIndex + 1);
      }, 500);
    }
  };

  // Destaca colchetes no prompt, com highlight especial se requisito selecionado
  const highlightBrackets = (text: string, activeReqIndex?: number | null) => {
    const bracketMap = getReqBracketMap();
    const parts = text.split(/(\[[^\]]+\])/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const bracketContent = part.toLowerCase();
        
        // Verifica se este colchete corresponde ao requisito selecionado
        let isActive = false;
        if (activeReqIndex !== null && activeReqIndex !== undefined) {
          const keywords = bracketMap[activeReqIndex] || [];
          isActive = keywords.some(kw => bracketContent.includes(kw));
        }
        
        return (
          <span 
            key={idx} 
            className={`px-1 rounded font-semibold transition-all duration-300 ${
              isActive 
                ? 'bg-cyan-400 dark:bg-cyan-500 text-cyan-900 dark:text-white ring-2 ring-cyan-400 ring-offset-1 scale-105 inline-block' 
                : 'bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100'
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div 
      data-testid="playground-bridge-v2"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-2"
    >
      <AnimatePresence mode="wait">
        {/* ==================== MODAL 1: EXEMPLO ==================== */}
        {phase === 'example' && (
          <motion.div
            key="example-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: isFlipping ? 0 : 1, 
              scale: isFlipping ? 0.9 : 1, 
              y: isFlipping ? -20 : 0 
            }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md"
          >
            <Card className="shadow-2xl border-2 border-primary/30 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2.5 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm leading-tight truncate">
                      {playgroundExample.title}
                    </h3>
                  </div>
                  <button
                    onClick={onSkip}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-3.5 space-y-2.5">
                
                {/* CONTEXTO */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[13px] text-foreground leading-snug">
                      {playgroundExample.context}
                    </p>
                  </div>
                </div>

                {/* REQUISITOS - Sistema Sequencial */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      Selecione e preencha os colchetes do prompt
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {orderedRequirements.map((req, idx) => {
                      const isCompleted = completedSteps[idx];
                      const isActive = activeStep === idx && !isCompleted;
                      const isDisabled = idx > activeStep && !isCompleted;
                      
                      return (
                        <motion.button 
                          key={idx}
                          onClick={() => handleStepClick(idx)}
                          disabled={isDisabled}
                          animate={isActive ? {
                            boxShadow: [
                              '0 0 0 0 rgba(251, 191, 36, 0)',
                              '0 0 0 6px rgba(251, 191, 36, 0.3)',
                              '0 0 0 0 rgba(251, 191, 36, 0)',
                            ],
                          } : {}}
                          transition={isActive ? {
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          } : {}}
                          className={`relative text-left rounded-lg px-3 py-2.5 border-2 transition-all text-[12px] leading-snug min-h-[52px] ${
                            isCompleted 
                              ? 'bg-emerald-600/90 border-emerald-400 text-white cursor-default shadow-lg shadow-emerald-500/20' 
                              : isActive
                                ? 'bg-amber-500/20 border-amber-400 text-white cursor-pointer hover:bg-amber-500/30'
                                : 'bg-slate-700/30 border-slate-600/40 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {/* Badge de numeração */}
                          <span className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                            isCompleted 
                              ? 'bg-emerald-400 text-emerald-900' 
                              : isActive
                                ? 'bg-amber-400 text-amber-900 animate-pulse'
                                : 'bg-slate-600 text-slate-400'
                          }`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </span>
                          
                          <span className="pl-3 block">{highlightBrackets(req || '')}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* MODELO DE PROMPT - Mostra o prompt sendo construído */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Seu Prompt (sendo construído)
                    </span>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-slate-900/60 rounded-md px-2.5 py-2 border border-purple-100 dark:border-purple-900/30 mb-2.5 min-h-[60px]">
                    <p className="text-[13px] text-foreground leading-snug font-mono">
                      {highlightBrackets(builtPrompt, highlightedReq)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(builtPrompt);
                      setCopied(true);
                      toast({ title: "Copiado!", description: "Prompt copiado" });
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-semibold text-[13px] transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar prompt'}</span>
                  </button>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="px-3.5 pb-3.5 pt-0.5">
                <Button
                  onClick={handleStartPractice}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 text-sm rounded-lg shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Hora da prática!
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ==================== MODAL 2: PRÁTICA ==================== */}
        {phase === 'practice' && (
          <motion.div
            key="practice-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: isFlipping ? 0 : 1, 
              scale: isFlipping ? 0.9 : 1, 
              y: isFlipping ? -20 : 0 
            }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md"
          >
            <Card className="shadow-2xl border-2 border-cyan-400/50">
              {/* Header compacto */}
              <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-2 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm leading-tight">
                      Hora da prática!
                    </h3>
                  </div>
                  <button
                    onClick={onSkip}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo compacto */}
              <div className="p-3 space-y-2">
                
                {/* REFERÊNCIA - compacto horizontal */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ListChecks className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Substitua os colchetes:
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {playgroundExample.requirements.map((req, idx) => {
                      const label = req.split(':')[0];
                      return (
                        <span 
                          key={idx} 
                          className="text-[10px] bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200 px-1.5 py-0.5 rounded"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* CAMPO DE EDIÇÃO */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800/50 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase">
                      Seu Prompt
                    </span>
                  </div>
                  
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Cole ou digite seu prompt..."
                    className="w-full h-24 bg-white dark:bg-slate-900/60 rounded px-2 py-2 border border-cyan-200 dark:border-cyan-900/30 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  
                  <p className="text-[10px] text-cyan-700/70 dark:text-cyan-400/70 mt-1">
                    💡 Troque os <span className="bg-amber-200 dark:bg-amber-800/60 px-0.5 rounded font-semibold">[colchetes]</span> pelo seu caso.
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="px-3 pb-3 pt-1">
                <Button
                  onClick={handleSendToPlayground}
                  disabled={!userPrompt.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Testar no Playground
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ==================== FASE 3: PLAYGROUND REAL ==================== */}
        {phase === 'playground' && (
          <motion.div
            key="playground-real"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
            <PlaygroundMidLesson
              config={{
                ...playgroundConfig,
                // Injeta o prompt editado pelo aluno como instrução inicial
                instruction: userPrompt || playgroundConfig.instruction,
              }}
              onComplete={onComplete}
              lessonId={lessonId}
              playgroundExample={{
                title: playgroundExample.title,
                context: playgroundExample.context,
                inputs: playgroundExample.requirements,
                examplePrompt: userPrompt, // Usa o prompt editado
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
