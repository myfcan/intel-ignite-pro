import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { PlaygroundConfig } from '@/types/guidedLesson';
import { Sparkles, ArrowRight, Lightbulb, User, Target, MessageSquare, CheckCircle2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipo para o exemplo estruturado do playground
export interface PlaygroundExampleData {
  title: string;
  context: string;
  inputs: string[];
  examplePrompt: string;
}

interface PlaygroundBridgeProps {
  /** Exemplo estruturado com context, inputs e prompt */
  playgroundExample?: PlaygroundExampleData;
  /** Fallback: conteúdo markdown antigo */
  practicalExample?: string;
  /** Configuração do playground */
  playgroundConfig: PlaygroundConfig;
  /** Callback quando completa o playground */
  onComplete: (answer: string | null) => void;
  /** Callback quando pula o playground */
  onSkip: () => void;
  /** ID da lição para salvar sessão */
  lessonId?: string;
  /** Título customizado para o card de contexto */
  contextTitle?: string;
  /** Descrição customizada */
  contextDescription?: string;
}

/**
 * 🌉 PLAYGROUND BRIDGE
 * 
 * Componente que cria uma ponte entre o conteúdo e o playground,
 * mostrando primeiro um exemplo prático estruturado e depois
 * transicionando com animação flip para o playground real.
 */
export function PlaygroundBridge({
  playgroundExample,
  practicalExample,
  playgroundConfig,
  onComplete,
  onSkip,
  lessonId,
  contextTitle = "Veja um exemplo prático!",
  contextDescription = "Antes de praticar, observe como funciona na vida real:"
}: PlaygroundBridgeProps) {
  const [phase, setPhase] = useState<'context' | 'playground'>('context');
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  console.log('🌉 [PLAYGROUND-BRIDGE] Renderizando:', { 
    phase, 
    hasStructuredExample: !!playgroundExample,
    hasFallback: !!practicalExample
  });

  const handleStartPlayground = useCallback(() => {
    console.log('🌉 [PLAYGROUND-BRIDGE] Iniciando transição para playground');
    setIsFlipping(true);
    
    setTimeout(() => {
      setPhase('playground');
      setIsFlipping(false);
    }, 400);
  }, []);

  const handlePlaygroundComplete = useCallback((answer: string | null) => {
    console.log('🌉 [PLAYGROUND-BRIDGE] Playground completado');
    onComplete(answer);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    console.log('🌉 [PLAYGROUND-BRIDGE] Usuário pulou');
    onSkip();
  }, [onSkip]);

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

  return (
    <div 
      data-testid="playground-bridge"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <AnimatePresence mode="wait">
        {/* ==================== FASE 1: CARD DE CONTEXTO ==================== */}
        {phase === 'context' && (
          <motion.div
            key="context-card"
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ 
              opacity: isFlipping ? 0 : 1, 
              scale: isFlipping ? 0.9 : 1, 
              rotateY: isFlipping ? 90 : 0 
            }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-full max-w-lg"
            style={{ perspective: 1000 }}
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-primary/30">
              {/* Header compacto e menor */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2.5 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base">
                      {playgroundExample?.title || contextTitle}
                    </h3>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    aria-label="Fechar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo estruturado - SEM SCROLL */}
              <div className="p-4 space-y-4">
                {playgroundExample ? (
                  <>
                    {/* Situação - Compacto */}
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground leading-snug">{playgroundExample.context}</p>
                    </div>

                    {/* Inputs/Requisitos - DESTAQUE VISUAL */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Requisitos</span>
                      </div>
                      <div className="space-y-2">
                        {playgroundExample.inputs.map((input, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-2.5 bg-white/70 dark:bg-slate-900/50 rounded-lg px-3 py-2 border border-orange-100 dark:border-orange-900/30"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-foreground font-medium">{input}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exemplo de Prompt - Clicável para copiar */}
                    <div 
                      onClick={handleCopyPrompt}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 cursor-pointer hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Exemplo de Prompt</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/10">
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-green-500">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Copiar</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-foreground italic leading-relaxed">
                        &ldquo;{playgroundExample.examplePrompt}&rdquo;
                      </p>
                    </div>
                  </>
                ) : practicalExample ? (
                  // Fallback para conteúdo markdown antigo
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {practicalExample.substring(0, 200)}...
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Botões */}
              <div className="px-4 pb-4 pt-1 flex gap-2">
                <Button
                  onClick={handleStartPlayground}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-5 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Agora é sua vez!
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ==================== FASE 2: PLAYGROUND ==================== */}
        {phase === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-full h-full"
          >
            <PlaygroundMidLesson
              config={playgroundConfig}
              onComplete={handlePlaygroundComplete}
              lessonId={lessonId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}