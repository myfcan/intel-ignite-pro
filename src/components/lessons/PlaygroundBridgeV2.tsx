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
  const getReqBracketMap = () => {
    // Extrai labels dos requisitos (ex: "Produto", "Público", etc)
    const bracketKeywords: Record<number, string[]> = {
      0: ['produto', 'principal'],      // Produto → [produto principal]
      1: ['público'],                    // Público → [público]
      2: ['objetivo'],                   // Objetivo → [objetivo do post]
      3: ['tom'],                        // Tom → [tom de voz]
    };
    return bracketKeywords;
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
            <Card className="shadow-2xl border-2 border-primary/30">
              {/* Header compacto */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
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

              {/* Conteúdo compacto sem scroll */}
              <div className="p-3 space-y-2">
                
                {/* CONTEXTO */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  <div className="flex items-start gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground leading-snug">
                      {playgroundExample.context}
                    </p>
                  </div>
                </div>

                {/* REQUISITOS - compacto em 2 colunas */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                      Requisitos (toque para destacar)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1">
                    {playgroundExample.requirements.map((req, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setHighlightedReq(highlightedReq === idx ? null : idx)}
                        className={`text-left bg-white/80 dark:bg-slate-900/50 rounded px-2 py-1 border transition-all text-[11px] ${
                          highlightedReq === idx 
                            ? 'border-cyan-400 ring-1 ring-cyan-400/30 bg-cyan-50 dark:bg-cyan-950/30' 
                            : 'border-orange-100 dark:border-orange-900/30'
                        }`}
                      >
                        {highlightBrackets(req)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MODELO DE PROMPT - compacto */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Modelo de Prompt
                    </span>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-slate-900/60 rounded px-2 py-1.5 border border-purple-100 dark:border-purple-900/30 mb-2">
                    <p className="text-xs text-foreground leading-snug font-mono">
                      {highlightBrackets(playgroundExample.examplePrompt, highlightedReq)}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyPrompt}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded font-semibold text-xs transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar modelo'}</span>
                  </button>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="px-3 pb-3 pt-1">
                <Button
                  onClick={handleStartPractice}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 text-sm"
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
