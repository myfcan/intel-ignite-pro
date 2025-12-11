import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import { 
  Eye, 
  ListChecks, 
  Rocket,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

// ============================================================================
// CONTRATO DE DADOS V3
// ============================================================================
export interface PlaygroundExampleDataV3 {
  title: string;              // título curto (~60 chars)
  context: string;            // 1 frase curta
  requirements: string[];     // 3-4 items com [colchetes]
  examplePrompt: string;      // 1 prompt com colchetes (2-3 linhas max)
  exampleOutput?: string;     // exemplo curto de saída da IA
}

interface PlaygroundBridgeV3Props {
  playgroundExample?: PlaygroundExampleDataV3;
  onComplete: (answer: string | null) => void;
  onSkip: () => void;
  lessonId?: string;
}

/**
 * 🚀 PLAYGROUND BRIDGE V3 - WIZARD DE 3 PASSOS
 * 
 * Step 1: I DO - Veja o exemplo (context + exampleOutput)
 * Step 2: WE DO - Preencha na cabeça (requirements)
 * Step 3: YOU DO - Adapte e teste (examplePrompt + botões)
 */
export function PlaygroundBridgeV3({
  playgroundExample,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV3Props) {
  const [phase, setPhase] = useState<'modal' | 'playground'>('modal');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [highlightedReq, setHighlightedReq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(playgroundExample.examplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extrai label e placeholder do requirement
  const parseRequirement = (req: string) => {
    const colonIndex = req.indexOf(':');
    if (colonIndex === -1) return { label: req, placeholder: '' };
    const label = req.substring(0, colonIndex + 1).trim();
    const rest = req.substring(colonIndex + 1).trim();
    return { label, placeholder: rest };
  };

  // Renderiza prompt com highlights nos colchetes
  const renderPromptWithHighlights = () => {
    const parts = playgroundExample.examplePrompt.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span 
            key={idx} 
            className="px-0.5 rounded font-medium bg-amber-200/80 text-amber-900 dark:bg-amber-500/30 dark:text-amber-300"
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (phase === 'playground') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full"
      >
        <PlaygroundRealChat
          lessonId={lessonId}
          onComplete={() => onComplete(null)}
          initialPrompt={playgroundExample.examplePrompt}
        />
      </motion.div>
    );
  }

  const stepConfig = {
    1: { color: 'emerald', icon: Eye, title: '👀 VEJA O EXEMPLO' },
    2: { color: 'blue', icon: ListChecks, title: '🧩 ESCOLHA SEU CASO REAL' },
    3: { color: 'purple', icon: Rocket, title: '🚀 ADAPTE E TESTE' }
  };

  const current = stepConfig[step];
  const Icon = current.icon;

  return (
    <div 
      data-testid="playground-bridge-v3"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <h3 className="text-white font-bold text-sm leading-tight">
                  {playgroundExample.title}
                </h3>
              </div>
              <button
                onClick={onSkip}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-3">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-6 bg-white' : s < step ? 'w-3 bg-white/60' : 'w-3 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CONTEÚDO DO STEP */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-5"
            >
              {/* Badge + Título do step */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  step === 1 ? 'bg-emerald-500' : step === 2 ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {step}
                </span>
                <span className={`text-sm font-bold uppercase tracking-wide ${
                  step === 1 ? 'text-emerald-700 dark:text-emerald-400' : 
                  step === 2 ? 'text-blue-700 dark:text-blue-400' : 
                  'text-purple-700 dark:text-purple-400'
                }`}>
                  {current.title}
                </span>
              </div>

              {/* STEP 1: I DO */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-base text-foreground leading-relaxed">
                    {playgroundExample.context}
                  </p>
                  
                  {playgroundExample.exampleOutput && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-3">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                        Exemplo de resultado:
                      </p>
                      <p className="text-sm text-foreground/80 italic leading-snug">
                        {playgroundExample.exampleOutput}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: WE DO */}
              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground/70 mb-3">
                    Pense em um curso ou eBook que você gostaria de criar. Use os exemplos entre parênteses só como inspiração.
                  </p>
                  <div className="space-y-2">
                    {playgroundExample.requirements.map((req, idx) => {
                      const { label, placeholder } = parseRequirement(req);
                      const isSelected = highlightedReq === idx;
                      
                      return (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setHighlightedReq(isSelected ? null : idx)}
                          className={`w-full text-left text-sm py-2.5 px-3 rounded-lg transition-all duration-150 flex items-start gap-2 ${
                            isSelected 
                              ? 'bg-cyan-100 dark:bg-cyan-900/50 ring-2 ring-cyan-400' 
                              : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                          }`}
                        >
                          <span className="text-foreground/70 font-medium">{label}</span>
                          <span className={`font-semibold ${
                            isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {placeholder}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: YOU DO */}
              {step === 3 && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    Substitua os <span className="bg-amber-200/80 text-amber-900 dark:bg-amber-500/30 dark:text-amber-300 px-1 rounded font-medium">[colchetes]</span> pelo seu caso real. Antes de testar, confira se o prompt está claro:
                  </p>
                  
                  {/* Checklist de qualidade */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start gap-2 text-xs text-foreground/70">
                      <span className="text-purple-500">✓</span>
                      <span>Tema está específico (não só "finanças", mas "finanças para autônomos")?</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-foreground/70">
                      <span className="text-purple-500">✓</span>
                      <span>Público está bem definido (quem vai assistir/ler)?</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-foreground/70">
                      <span className="text-purple-500">✓</span>
                      <span>Resultado final é uma ação concreta (ex.: "dar a primeira aula")?</span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-lg p-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      {renderPromptWithHighlights()}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="w-full text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copiar prompt
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* FOOTER com navegação */}
          <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="text-sm order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}
            
            <div className="flex-1 hidden sm:block" />
            
            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold px-6 order-1 sm:order-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleGoToPlayground}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold px-4 sm:px-6 order-1 sm:order-2 w-full sm:w-auto"
              >
                <Rocket className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>Testar no Playground</span>
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}