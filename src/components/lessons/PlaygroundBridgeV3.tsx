import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import { 
  Eye, 
  Puzzle, 
  Rocket,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';

// ============================================================================
// CONTRATO DE DADOS V3 - DINÂMICO
// ============================================================================
export interface PlaygroundExampleDataV3 {
  title: string;
  context: string;
  requirements: string[];
  examplePrompt: string;
  exampleOutput?: string;
}

interface PlaygroundBridgeV3Props {
  playgroundExample?: PlaygroundExampleDataV3;
  onComplete: (answer: string | null) => void;
  onSkip: () => void;
  lessonId?: string;
}

/**
 * Extrai o label e placeholder de um requirement
 * Ex: "Foco principal: [trabalho atual, renda extra ou projeto pessoal]"
 * → { label: "Foco principal", placeholder: "trabalho atual, renda extra ou projeto pessoal" }
 */
function parseRequirement(req: string): { label: string; placeholder: string; bracketContent: string } {
  const colonIndex = req.indexOf(':');
  if (colonIndex === -1) {
    return { label: req, placeholder: '', bracketContent: '' };
  }
  
  const label = req.substring(0, colonIndex).trim();
  const rest = req.substring(colonIndex + 1).trim();
  
  // Extrai conteúdo entre colchetes
  const bracketMatch = rest.match(/\[([^\]]+)\]/);
  const bracketContent = bracketMatch ? bracketMatch[1] : rest;
  const placeholder = bracketContent;
  
  return { label, placeholder, bracketContent };
}

/**
 * 🚀 PLAYGROUND BRIDGE V3 - MINI-FERRAMENTA INTERATIVA DINÂMICA
 * 
 * Step 1: I DO - Veja o contexto e exemplo
 * Step 2: WE DO - Preencha cada campo baseado nos requirements do JSON
 * Step 3: YOU DO - Veja o prompt montado e teste
 */
export function PlaygroundBridgeV3({
  playgroundExample,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV3Props) {
  const [phase, setPhase] = useState<'modal' | 'playground'>('modal');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);

  // Estado dinâmico para os valores de cada requirement
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Parse os requirements do JSON
  const parsedRequirements = useMemo(() => {
    if (!playgroundExample?.requirements) return [];
    return playgroundExample.requirements.map(parseRequirement);
  }, [playgroundExample?.requirements]);

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  // Monta o prompt substituindo os placeholders pelos valores preenchidos
  const buildPrompt = useCallback(() => {
    let prompt = playgroundExample.examplePrompt;
    
    parsedRequirements.forEach((req) => {
      const value = fieldValues[req.label] || `[${req.bracketContent}]`;
      // Substitui o bracket original pelo valor
      const bracketPattern = new RegExp(`\\[${req.bracketContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
      prompt = prompt.replace(bracketPattern, value);
    });
    
    return prompt;
  }, [playgroundExample.examplePrompt, parsedRequirements, fieldValues]);

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFieldChange = (label: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [label]: value }));
  };

  // Verifica se pelo menos metade dos campos está preenchida
  const canProceedToStep3 = useMemo(() => {
    const filledCount = Object.values(fieldValues).filter(v => v.trim()).length;
    return filledCount >= Math.ceil(parsedRequirements.length / 2);
  }, [fieldValues, parsedRequirements.length]);

  // Renderiza prompt com destaques visuais
  const renderPromptWithHighlights = () => {
    const parts: { text: string; isHighlight: boolean; filled: boolean }[] = [];
    let prompt = playgroundExample.examplePrompt;
    let lastIndex = 0;
    
    // Encontra todos os brackets e seus valores
    const bracketRegex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = bracketRegex.exec(playgroundExample.examplePrompt)) !== null) {
      // Texto antes do bracket
      if (match.index > lastIndex) {
        parts.push({ text: prompt.substring(lastIndex, match.index), isHighlight: false, filled: false });
      }
      
      // Encontra o requirement correspondente
      const bracketContent = match[1];
      const req = parsedRequirements.find(r => r.bracketContent === bracketContent);
      const value = req ? fieldValues[req.label] : '';
      const displayValue = value || match[0];
      const isFilled = !!value;
      
      parts.push({ text: displayValue, isHighlight: true, filled: isFilled });
      lastIndex = match.index + match[0].length;
    }
    
    // Texto restante
    if (lastIndex < prompt.length) {
      parts.push({ text: prompt.substring(lastIndex), isHighlight: false, filled: false });
    }
    
    return (
      <span className="text-sm leading-relaxed">
        {parts.map((part, i) => 
          part.isHighlight ? (
            <span 
              key={i} 
              className={`px-1 rounded font-semibold ${
                part.filled 
                  ? 'bg-violet-200 text-violet-900 dark:bg-violet-500/40 dark:text-violet-200' 
                  : 'bg-amber-200/80 text-amber-900 dark:bg-amber-500/30 dark:text-amber-300'
              }`}
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>
    );
  };

  const getStepInfo = (s: number) => {
    switch(s) {
      case 1: return { icon: '👁', label: 'VEJA O CONTEXTO', color: 'emerald' };
      case 2: return { icon: '🧩', label: 'PREENCHA OS CAMPOS', color: 'blue' };
      case 3: return { icon: '🚀', label: 'ADAPTE E TESTE', color: 'purple' };
      default: return { icon: '👁', label: 'VEJA O CONTEXTO', color: 'emerald' };
    }
  };

  const stepInfo = getStepInfo(step);

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
          initialPrompt={buildPrompt()}
        />
      </motion.div>
    );
  }

  return (
    <div 
      data-testid="playground-bridge-v3"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-2.5 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <h3 className="text-white font-bold text-sm leading-tight">
                  {playgroundExample.title}
                </h3>
              </div>
              <button
                onClick={onSkip}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step 
                      ? 'w-6 bg-white' 
                      : s < step 
                        ? 'w-2 bg-white/60' 
                        : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* STEP 1: I DO - Contexto */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">1</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
                        VEJA O CONTEXTO
                      </span>
                    </div>
                  </div>

                  {/* Context */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {playgroundExample.context}
                    </p>
                  </div>

                  {/* Requirements preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                      Você vai preencher:
                    </p>
                    <div className="space-y-1.5">
                      {parsedRequirements.map((req, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 text-sm text-foreground/70"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                          <span className="font-medium">{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example output if available */}
                  {playgroundExample.exampleOutput && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                        Exemplo de resultado:
                      </p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {playgroundExample.exampleOutput}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: WE DO - Preencher campos */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-400">2</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Puzzle className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wide">
                        PREENCHA OS CAMPOS
                      </span>
                    </div>
                  </div>

                  {/* Dynamic fields based on requirements */}
                  <div className="space-y-3">
                    {parsedRequirements.map((req, i) => (
                      <div key={i}>
                        <label className="text-xs font-semibold text-foreground/70 mb-1 block">
                          {req.label}:
                        </label>
                        <Input
                          type="text"
                          placeholder={`Ex.: ${req.placeholder}`}
                          value={fieldValues[req.label] || ''}
                          onChange={(e) => handleFieldChange(req.label, e.target.value)}
                          className="text-sm h-9"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: YOU DO - Prompt final */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-700 dark:text-violet-400">3</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Rocket className="w-4 h-4 text-violet-600" />
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-400 tracking-wide">
                        SEU PROMPT PRONTO
                      </span>
                    </div>
                  </div>

                  {/* Final prompt with highlights */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    {renderPromptWithHighlights()}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1 gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleGoToPlayground}
                      className="flex-1 gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      Testar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER - Navigation */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)}
                className="gap-1.5 text-foreground/60 hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < 3 && (
              <Button
                size="sm"
                onClick={() => setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3)}
                disabled={step === 2 && !canProceedToStep3}
                className="gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                Próximo
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
