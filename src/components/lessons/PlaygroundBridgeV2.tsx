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
  X
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
 * Modal didático com 3 blocos:
 * 1. Contexto da situação
 * 2. Requisitos com colchetes
 * 3. Exemplo de prompt com colchetes
 */
export function PlaygroundBridgeV2({
  playgroundExample,
  playgroundConfig,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV2Props) {
  const [phase, setPhase] = useState<'example' | 'practice'>('example');
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  console.log('🌉 [BRIDGE-V2] Renderizando:', { 
    phase, 
    hasExample: !!playgroundExample,
  });

  // Fallback seguro: se não tem playgroundExample, não renderiza
  if (!playgroundExample) {
    console.warn('⚠️ [BRIDGE-V2] playgroundExample ausente, pulando modal de exemplo');
    return (
      <PlaygroundMidLesson
        config={playgroundConfig}
        onComplete={onComplete}
        lessonId={lessonId}
        playgroundExample={undefined}
      />
    );
  }

  const handleStartPractice = useCallback(() => {
    console.log('🌉 [BRIDGE-V2] Iniciando transição para prática');
    setIsFlipping(true);
    
    setTimeout(() => {
      setPhase('practice');
      setIsFlipping(false);
    }, 400);
  }, []);

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

  // Função para destacar colchetes no texto
  const highlightBrackets = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span 
            key={idx} 
            className="bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 px-1 rounded font-semibold"
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
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <AnimatePresence mode="wait">
        {/* ==================== FASE 1: MODAL DE EXEMPLO ==================== */}
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
            className="w-full max-w-md max-h-[90vh] overflow-hidden"
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-primary/30 flex flex-col max-h-[90vh]">
              {/* Header com título */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-3 px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {playgroundExample.title}
                    </h3>
                    <p className="text-white/80 text-xs">Veja o exemplo antes de praticar</p>
                  </div>
                  <button
                    onClick={onSkip}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo com scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                
                {/* ========== BLOCO 1: CONTEXTO ========== */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {playgroundExample.context}
                    </p>
                  </div>
                </div>

                {/* ========== BLOCO 2: REQUISITOS ========== */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                      Requisitos
                    </span>
                  </div>
                  
                  <p className="text-xs text-orange-800/80 dark:text-orange-300/80 mb-2.5 leading-snug">
                    Sempre que for criar um prompt, preencha primeiro estes colchetes:
                  </p>
                  
                  <div className="space-y-1.5">
                    {playgroundExample.requirements.map((req, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white/80 dark:bg-slate-900/50 rounded-lg px-2.5 py-2 border border-orange-100 dark:border-orange-900/30"
                      >
                        <span className="text-sm text-foreground leading-snug">
                          {highlightBrackets(req)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ========== BLOCO 3: EXEMPLO DE PROMPT ========== */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Exemplo de Prompt
                    </span>
                  </div>
                  
                  {/* Caixa do prompt */}
                  <div className="bg-white/80 dark:bg-slate-900/60 rounded-lg px-3 py-2.5 border border-purple-100 dark:border-purple-900/30 mb-3">
                    <p className="text-sm text-foreground leading-relaxed font-mono">
                      {highlightBrackets(playgroundExample.examplePrompt)}
                    </p>
                  </div>

                  {/* Botão Copiar */}
                  <button
                    onClick={handleCopyPrompt}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar este prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer com CTA */}
              <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-border/50 bg-background">
                <Button
                  onClick={handleStartPractice}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-5 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Hora da prática!
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ==================== FASE 2: PLAYGROUND DE PRÁTICA ==================== */}
        {phase === 'practice' && (
          <motion.div
            key="practice-playground"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
            <PlaygroundMidLesson
              config={playgroundConfig}
              onComplete={onComplete}
              lessonId={lessonId}
              playgroundExample={{
                title: playgroundExample.title,
                context: playgroundExample.context,
                inputs: playgroundExample.requirements,
                examplePrompt: playgroundExample.examplePrompt,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
