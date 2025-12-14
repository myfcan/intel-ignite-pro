import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Rocket
} from 'lucide-react';

// ============================================================================
// CONTRATO DE DADOS V3 - TEMPLATE GENÉRICO
// ============================================================================
export interface PlaygroundExampleDataV3 {
  title: string;
  context: string;
  requirements: string[]; // Formato: "Label: [opção1 | opção2 | opção3 | outro]"
  examplePrompt: string;
  exampleOutput?: string;
}

interface PlaygroundBridgeV3Props {
  playgroundExample?: PlaygroundExampleDataV3;
  onComplete: (answer: string | null) => void;
  onSkip: () => void;
  lessonId?: string;
}

// ============================================================================
// INTERFACE PARA REQUIREMENT PARSEADO
// ============================================================================
interface ParsedRequirement {
  label: string;
  options: string[];
  originalText: string; // Para buscar no examplePrompt
}

/**
 * 🚀 PLAYGROUND BRIDGE V3 - TEMPLATE GENÉRICO
 *
 * ESTRUTURA FIXA (nunca muda):
 * - 4 passos em wizard, sem scroll
 * - Step 1: I DO - Veja o exemplo
 * - Step 2: WE DO (parte 1) - Escolha (SOMENTE chips)
 * - Step 3: WE DO (parte 2) - Ajuste (chips + inputs opcionais)
 * - Step 4: YOU DO - Adapte e teste
 *
 * DADOS DINÂMICOS (vêm do JSON):
 * - title, context, requirements[], examplePrompt, exampleOutput
 * - Cada requirements[i] no formato: "Label: [opção1 | opção2 | opção3 | outro]"
 */
export function PlaygroundBridgeV3({
  playgroundExample,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV3Props) {
  const [phase, setPhase] = useState<'modal' | 'playground'>('modal');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [copied, setCopied] = useState(false);

  // Estado dinâmico: selections[index] = valor selecionado
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [customValues, setCustomValues] = useState<Record<number, string>>({});

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  // ============================================================================
  // PARSER GENÉRICO - Extrai label e opções de cada requirement
  // ============================================================================
  const parseRequirement = useCallback((req: string): ParsedRequirement => {
    const colonIndex = req.indexOf(':');
    if (colonIndex === -1) {
      return { label: req, options: [], originalText: req };
    }

    const label = req.substring(0, colonIndex).trim();

    const bracketStart = req.indexOf('[');
    const bracketEnd = req.indexOf(']');

    if (bracketStart === -1 || bracketEnd === -1) {
      return { label, options: [], originalText: req };
    }

    const optionsStr = req.substring(bracketStart + 1, bracketEnd);
    const options = optionsStr.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

    return { label, options, originalText: req };
  }, []);

  // Parse todos os requirements
  const parsedRequirements = useMemo(() => {
    return playgroundExample.requirements.map(req => parseRequirement(req));
  }, [playgroundExample.requirements, parseRequirement]);

  // ============================================================================
  // DISTRIBUIÇÃO DOS REQUIREMENTS
  // ============================================================================
  const step2Requirements = parsedRequirements.slice(0, 2); // requirements[0] e [1]
  const step3Requirements = parsedRequirements.slice(2, 4); // requirements[2] e [3]

  // ============================================================================
  // MONTA O PROMPT FINAL COM AS ESCOLHAS
  // ============================================================================
  const buildPrompt = useCallback(() => {
    let prompt = playgroundExample.examplePrompt;

    parsedRequirements.forEach((req, index) => {
      const selectedOption = selections[index];
      let finalValue = '';

      if (selectedOption) {
        // Se selecionou "outro", usar o valor customizado
        if (selectedOption.toLowerCase() === 'outro') {
          finalValue = customValues[index] || '';
        } else {
          finalValue = selectedOption;
        }
      }

      // Tentar encontrar o padrão no prompt
      // Buscar por variações: [label], [label completo], etc.
      if (finalValue) {
        // Criar regex para encontrar o placeholder
        const labelLower = req.label.toLowerCase();

        // Padrão 1: Buscar exatamente [label]
        const pattern1 = new RegExp(`\\[${req.label}\\]`, 'gi');
        prompt = prompt.replace(pattern1, finalValue);

        // Padrão 2: Buscar variações comuns do label
        const labelWords = req.label.split(' ').filter(w => w.length > 3);
        labelWords.forEach(word => {
          const pattern = new RegExp(`\\[[^\\]]*${word}[^\\]]*\\]`, 'gi');
          prompt = prompt.replace(pattern, finalValue);
        });
      }
    });

    return prompt;
  }, [playgroundExample.examplePrompt, parsedRequirements, selections, customValues]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleSelectOption = (reqIndex: number, option: string) => {
    setSelections(prev => ({
      ...prev,
      [reqIndex]: prev[reqIndex] === option ? '' : option
    }));
  };

  const handleCustomValueChange = (reqIndex: number, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [reqIndex]: value
    }));
  };

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================================
  // COMPONENTES DE UI
  // ============================================================================
  const SelectChip = ({
    label,
    selected,
    onClick
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 text-xs rounded-full border transition-all duration-150 ${
        selected
          ? 'bg-violet-600 text-white border-violet-600'
          : 'bg-white dark:bg-slate-800 text-foreground/80 border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950'
      }`}
    >
      {label}
    </button>
  );

  // ============================================================================
  // RENDERIZA UM GRUPO DE REQUIREMENT (label + chips)
  // ============================================================================
  const renderRequirementGroup = (req: ParsedRequirement, reqIndex: number, showInputForOutro: boolean = false) => {
    const selectedOption = selections[reqIndex] || '';
    const isOutroSelected = selectedOption.toLowerCase() === 'outro';

    return (
      <div key={reqIndex}>
        <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">{req.label}:</p>
        <div className="flex flex-wrap gap-1.5">
          {req.options.map((option) => (
            <SelectChip
              key={option}
              label={option}
              selected={selectedOption === option}
              onClick={() => handleSelectOption(reqIndex, option)}
            />
          ))}
        </div>
        {/* Mostrar input SOMENTE se showInputForOutro=true E "outro" está selecionado */}
        {showInputForOutro && isOutroSelected && (
          <Input
            value={customValues[reqIndex] || ''}
            onChange={(e) => handleCustomValueChange(reqIndex, e.target.value)}
            placeholder="Digite sua opção..."
            className="mt-1.5 h-8 text-xs"
          />
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDERIZA PROMPT COM HIGHLIGHTS
  // ============================================================================
  const renderPromptWithHighlights = () => {
    const parts = playgroundExample.examplePrompt.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Verificar se esse colchete foi substituído
        let wasReplaced = false;
        parsedRequirements.forEach((req, reqIndex) => {
          const selectedOption = selections[reqIndex];
          if (selectedOption) {
            const finalValue = selectedOption.toLowerCase() === 'outro'
              ? customValues[reqIndex]
              : selectedOption;

            if (finalValue && part.toLowerCase().includes(req.label.toLowerCase().split(' ')[0])) {
              wasReplaced = true;
            }
          }
        });

        if (wasReplaced) {
          // Substituir pelo valor real
          let replaced = part;
          parsedRequirements.forEach((req, reqIndex) => {
            const selectedOption = selections[reqIndex];
            if (selectedOption) {
              const finalValue = selectedOption.toLowerCase() === 'outro'
                ? customValues[reqIndex]
                : selectedOption;

              if (finalValue) {
                const labelWords = req.label.toLowerCase().split(' ');
                const partLower = part.toLowerCase();
                if (labelWords.some(word => partLower.includes(word))) {
                  replaced = finalValue;
                }
              }
            }
          });

          return (
            <span
              key={idx}
              className="px-1 rounded font-semibold bg-violet-200 text-violet-900 dark:bg-violet-500/40 dark:text-violet-200"
            >
              {replaced}
            </span>
          );
        }

        // Não foi substituído - mostrar colchete em amarelo
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

  const getStepInfo = (s: number) => {
    switch(s) {
      case 1: return { icon: '👁', label: 'VEJA O EXEMPLO', color: 'emerald' };
      case 2: return { icon: '🧩', label: 'ESCOLHA SEU CASO', color: 'blue' };
      case 3: return { icon: '📚', label: 'AJUSTE OS DETALHES', color: 'amber' };
      case 4: return { icon: '🚀', label: 'ADAPTE E TESTE', color: 'purple' };
      default: return { icon: '👁', label: 'VEJA O EXEMPLO', color: 'emerald' };
    }
  };

  const stepInfo = getStepInfo(step);

  // ============================================================================
  // RENDER: PLAYGROUND
  // ============================================================================
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

  // ============================================================================
  // RENDER: MODAL (4 STEPS)
  // ============================================================================
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
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress dots - 4 steps */}
            <div className="flex justify-center gap-2 mt-2">
              {[1, 2, 3, 4].map((s) => (
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
              className="p-4"
            >
              {/* Badge + Título do step */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  step === 1 ? 'bg-emerald-500' :
                  step === 2 ? 'bg-blue-500' :
                  step === 3 ? 'bg-amber-500' :
                  'bg-purple-500'
                }`}>
                  {step}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wide ${
                  step === 1 ? 'text-emerald-700 dark:text-emerald-400' :
                  step === 2 ? 'text-blue-700 dark:text-blue-400' :
                  step === 3 ? 'text-amber-700 dark:text-amber-400' :
                  'text-purple-700 dark:text-purple-400'
                }`}>
                  {stepInfo.icon} {stepInfo.label}
                </span>
              </div>

              {/* STEP 1: I DO - Veja o exemplo */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    {playgroundExample.context}
                  </p>

                  {playgroundExample.exampleOutput && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-2.5">
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                        Exemplo de resultado:
                      </p>
                      <p className="text-xs text-foreground/80 italic leading-snug">
                        {playgroundExample.exampleOutput}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: WE DO (parte 1) - SOMENTE CHIPS */}
              {step === 2 && (
                <div className="space-y-3">
                  {step2Requirements.map((req, localIndex) => {
                    const globalIndex = localIndex; // requirements[0] e requirements[1]
                    return renderRequirementGroup(req, globalIndex, false); // false = NÃO mostrar input
                  })}
                </div>
              )}

              {/* STEP 3: WE DO (parte 2) - Chips + inputs opcionais */}
              {step === 3 && (
                <div className="space-y-3">
                  {step3Requirements.map((req, localIndex) => {
                    const globalIndex = localIndex + 2; // requirements[2] e requirements[3]
                    return renderRequirementGroup(req, globalIndex, true); // true = mostrar input se "outro"
                  })}
                </div>
              )}

              {/* STEP 4: YOU DO - Adapte e teste */}
              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-xs text-foreground/70">
                    Confira o prompt abaixo. Se quiser, ajuste os colchetes com seu caso real e depois teste no Playground.
                  </p>

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
          <div className="px-4 pb-4 pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="text-xs order-2 sm:order-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Voltar
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div className="flex-1 hidden sm:block" />

            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold px-5 order-1 sm:order-2"
              >
                Próximo
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleGoToPlayground}
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold px-4 order-1 sm:order-2 w-full sm:w-auto"
              >
                <Rocket className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>Testar no Playground</span>
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
