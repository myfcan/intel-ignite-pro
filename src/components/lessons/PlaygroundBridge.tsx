import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LivAvatar } from '@/components/LivAvatar';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { PlaygroundConfig } from '@/types/guidedLesson';
import { Sparkles, ArrowRight, Lightbulb, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PlaygroundBridgeProps {
  /** Conteúdo do exemplo prático (visualContent da seção 4 ou texto custom) */
  practicalExample: string;
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
 * mostrando primeiro um exemplo prático (card de contexto) e depois
 * transicionando com animação flip para o playground real.
 * 
 * Fluxo:
 * 1. Card de Contexto (exemplo prático) → Usuário lê
 * 2. Clica em "Agora é sua vez!" 
 * 3. Animação flip/slide
 * 4. Playground abre para prática
 */
export function PlaygroundBridge({
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

  console.log('🌉 [PLAYGROUND-BRIDGE] Renderizando:', { 
    phase, 
    hasExample: !!practicalExample, 
    exampleLength: practicalExample?.length 
  });

  const handleStartPlayground = useCallback(() => {
    console.log('🌉 [PLAYGROUND-BRIDGE] Iniciando transição para playground');
    setIsFlipping(true);
    
    // Pequeno delay para a animação de saída
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

  // Extrair o conteúdo mais relevante do exemplo prático
  // Remove o título principal (primeira linha com #) e pega o conteúdo significativo
  const getExamplePreview = (text: string): string => {
    if (!text) return '';
    
    // Dividir por parágrafos e filtrar vazios
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    // Remover o título principal (linha que começa com ##)
    const contentParagraphs = paragraphs.filter(p => !p.trim().startsWith('##'));
    
    // Pegar os primeiros 4-5 elementos para ter conteúdo substancial
    const preview = contentParagraphs.slice(0, 5).join('\n\n');
    
    // Limitar a 600 caracteres para mais contexto
    if (preview.length > 600) {
      return preview.substring(0, 600) + '...';
    }
    
    return preview;
  };

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
            className="w-full max-w-2xl"
            style={{ perspective: 1000 }}
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-primary/30">
              {/* Header com gradiente - mais compacto */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {contextTitle}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      {contextDescription}
                    </p>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    aria-label="Fechar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo do exemplo prático */}
              <div className="p-4 max-h-[35vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-amber-800 dark:prose-headings:text-amber-200 prose-strong:text-amber-700 dark:prose-strong:text-amber-300 prose-li:my-1 prose-ul:my-2 prose-p:my-2">
                    <ReactMarkdown>
                      {getExamplePreview(practicalExample)}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Dica visual */}
                <div className="mt-3 flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Sua vez!</strong> Agora você vai criar algo similar usando o que aprendeu.
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="p-6 pt-0 space-y-3">
                <Button
                  onClick={handleStartPlayground}
                  size="lg"
                  className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Agora é sua vez!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="w-full text-sm hover:bg-muted/50"
                  size="sm"
                >
                  ⏭️ Pular por enquanto
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ==================== FASE 2: PLAYGROUND ==================== */}
        {phase === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1],
              delay: 0.1
            }}
            className="w-full max-w-3xl"
            style={{ perspective: 1000 }}
          >
            {/* Renderiza o PlaygroundMidLesson existente */}
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
