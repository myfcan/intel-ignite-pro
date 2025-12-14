import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import { 
  Eye, 
  Settings2, 
  Rocket,
  Layers,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Lightbulb
} from 'lucide-react';

// ============================================================================
// CONTRATO DE DADOS V3
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

// ============================================================================
// PARSER DE REQUIREMENTS
// Extrai label, slot (texto dentro de colchetes) e chips (opções separadas por vírgula)
// ============================================================================
interface ParsedRequirement {
  label: string;
  slot: string;
  chips: string[];
  hasChips: boolean;
}

function parseRequirement(req: string): ParsedRequirement {
  // Formato: "Label: [slot com opções separadas por vírgula]"
  const colonIndex = req.indexOf(':');
  
  if (colonIndex === -1) {
    return { label: req, slot: '', chips: [], hasChips: false };
  }
  
  const label = req.slice(0, colonIndex).trim();
  const rest = req.slice(colonIndex + 1).trim();
  
  // Extrai o conteúdo dentro dos colchetes
  const bracketMatch = rest.match(/\[([^\]]+)\]/);
  
  if (!bracketMatch) {
    return { label, slot: rest, chips: [], hasChips: false };
  }
  
  const slotContent = bracketMatch[1];
  
  // Verifica se tem opções separadas por vírgula (chips)
  // Se tiver vírgulas, são chips; se não, é campo de texto livre
  const options = slotContent.split(',').map(s => s.trim()).filter(Boolean);
  const hasChips = options.length > 1 || slotContent.includes(' ou ');
  
  // Se tiver " ou " também considera como chips
  let chips: string[] = [];
  if (hasChips) {
    if (slotContent.includes(' ou ')) {
      chips = slotContent.split(/,| ou /).map(s => s.trim()).filter(Boolean);
    } else {
      chips = options;
    }
  }
  
  return {
    label,
    slot: `[${slotContent}]`,
    chips,
    hasChips
  };
}

/**
 * 🚀 PLAYGROUND BRIDGE V3 - WIZARD DE 4 PASSOS SEM SCROLL
 * 
 * TEMPLATE FIXO com DADOS DINÂMICOS do JSON
 * 
 * Step 1: I DO - VEJA O EXEMPLO (usa context + exampleOutput)
 * Step 2: WE DO Part 1 - ESCOLHA SEU CASO (usa requirements[0] e requirements[1])
 * Step 3: WE DO Part 2 - COMPLETE OS DETALHES (usa requirements[2] e requirements[3])
 * Step 4: YOU DO - ADAPTE E TESTE (usa examplePrompt com substituições)
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

  // Parse dos requirements do JSON
  const parsedRequirements = useMemo(() => {
    if (!playgroundExample?.requirements) return [];
    return playgroundExample.requirements.map(parseRequirement);
  }, [playgroundExample?.requirements]);

  // Estado para cada requirement (4 campos)
  const [values, setValues] = useState<Record<number, string>>({});
  const [customValues, setCustomValues] = useState<Record<number, string>>({});
  const [showCustom, setShowCustom] = useState<Record<number, boolean>>({});

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  // Handlers
  const handleChipSelect = (reqIndex: number, value: string) => {
    if (value === '__other__') {
      setShowCustom(prev => ({ ...prev, [reqIndex]: true }));
      setValues(prev => ({ ...prev, [reqIndex]: '' }));
    } else {
      setValues(prev => ({ ...prev, [reqIndex]: value }));
      setShowCustom(prev => ({ ...prev, [reqIndex]: false }));
    }
  };

  const handleCustomChange = (reqIndex: number, value: string) => {
    setCustomValues(prev => ({ ...prev, [reqIndex]: value }));
  };

  const handleTextChange = (reqIndex: number, value: string) => {
    setValues(prev => ({ ...prev, [reqIndex]: value }));
  };

  // Valor final de um requirement
  const getFinalValue = (reqIndex: number): string => {
    if (showCustom[reqIndex]) return customValues[reqIndex] || '';
    return values[reqIndex] || '';
  };

  // Monta o prompt substituindo os slots pelos valores escolhidos
  const buildPrompt = useCallback(() => {
    let prompt = playgroundExample.examplePrompt;
    
    parsedRequirements.forEach((req, index) => {
      const value = getFinalValue(index);
      if (value && req.slot) {
        // Substitui o slot original pelo valor escolhido mantendo colchetes
        prompt = prompt.replace(req.slot, `[${value}]`);
      }
    });
    
    return prompt;
  }, [playgroundExample.examplePrompt, parsedRequirements, values, customValues, showCustom]);

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          initialPrompt={buildPrompt()}
        />
      </motion.div>
    );
  }

  // Renderiza um chip button
  const ChipButton = ({ 
    label, 
    selected, 
    onClick 
  }: { 
    label: string; 
    selected: boolean; 
    onClick: () => void 
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
        selected
          ? 'bg-violet-600 text-white border-violet-600 shadow-md'
          : 'bg-white dark:bg-slate-800 text-foreground/70 border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
      }`}
    >
      {label}
    </button>
  );

  // Chip "Outro"
  const OtherChip = ({ 
    active, 
    onClick 
  }: { 
    active: boolean; 
    onClick: () => void 
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
        active
          ? 'bg-amber-500 text-white border-amber-500'
          : 'bg-slate-100 dark:bg-slate-700 text-foreground/60 border-slate-200 dark:border-slate-600 hover:border-amber-400'
      }`}
    >
      Outro
    </button>
  );

  // Renderiza um campo baseado no requirement parseado
  const renderField = (reqIndex: number) => {
    const req = parsedRequirements[reqIndex];
    if (!req) return null;

    const currentValue = values[reqIndex] || '';
    const isCustomActive = showCustom[reqIndex] || false;

    if (req.hasChips) {
      // Campo com chips
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">
            {req.label}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {req.chips.map((chip) => (
              <ChipButton
                key={chip}
                label={chip}
                selected={currentValue === chip && !isCustomActive}
                onClick={() => handleChipSelect(reqIndex, chip)}
              />
            ))}
            <OtherChip
              active={isCustomActive}
              onClick={() => handleChipSelect(reqIndex, '__other__')}
            />
          </div>
          {isCustomActive && (
            <Input
              type="text"
              placeholder="Digite..."
              value={customValues[reqIndex] || ''}
              onChange={(e) => handleCustomChange(reqIndex, e.target.value)}
              className="text-sm h-8 mt-1"
              autoFocus
            />
          )}
        </div>
      );
    } else {
      // Campo de texto livre
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">
            {req.label}
          </label>
          <Input
            type="text"
            placeholder={req.slot.replace(/[\[\]]/g, '')}
            value={currentValue}
            onChange={(e) => handleTextChange(reqIndex, e.target.value)}
            className="text-sm h-9"
          />
        </div>
      );
    }
  };

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

            {/* Progress dots - 4 steps */}
            <div className="flex justify-center gap-1.5 mt-2">
              {[1, 2, 3, 4].map((s) => (
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

          {/* CONTENT - SEM SCROLL */}
          <div className="p-4">
            <AnimatePresence mode="wait">
              
              {/* ================================================================ */}
              {/* STEP 1: VEJA O EXEMPLO (I DO) */}
              {/* ================================================================ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                      Veja o Exemplo
                    </span>
                  </div>

                  {/* Context text - dinâmico do JSON */}
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {playgroundExample.context}
                  </p>

                  {/* Example output */}
                  {playgroundExample.exampleOutput && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                          Exemplo de resultado
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-line">
                        {playgroundExample.exampleOutput}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 2: ESCOLHA SEU CASO (WE DO - Parte 1) */}
              {/* Usa requirements[0] e requirements[1] */}
              {/* ================================================================ */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wide uppercase">
                      Escolha seu Caso
                    </span>
                  </div>

                  {/* Campo 1: requirements[0] */}
                  {renderField(0)}

                  {/* Campo 2: requirements[1] */}
                  {renderField(1)}
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 3: COMPLETE OS DETALHES (WE DO - Parte 2) */}
              {/* Usa requirements[2] e requirements[3] */}
              {/* ================================================================ */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase">
                      Complete os Detalhes
                    </span>
                  </div>

                  {/* Campo 3: requirements[2] */}
                  {renderField(2)}

                  {/* Campo 4: requirements[3] */}
                  {renderField(3)}
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 4: ADAPTE E TESTE (YOU DO) */}
              {/* ================================================================ */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                      <Rocket className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <span className="text-xs font-bold text-violet-700 dark:text-violet-400 tracking-wide uppercase">
                      Adapte e Teste
                    </span>
                  </div>

                  {/* Instruction */}
                  <p className="text-xs text-foreground/70">
                    Confira o prompt abaixo. Se quiser, ajuste os colchetes com seu caso real e depois teste no Playground.
                  </p>

                  {/* Prompt box */}
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-foreground/90 leading-relaxed font-mono">
                      {buildPrompt()}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1 h-9 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copiar prompt
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleGoToPlayground}
                      size="sm"
                      className="flex-1 h-9 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      <Rocket className="w-3.5 h-3.5 mr-1.5" />
                      Testar no Playground
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER - Navigation */}
          <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
                  className="text-xs text-foreground/60 hover:text-foreground"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Voltar
                </Button>
              ) : (
                <div />
              )}

              {step < 4 && (
                <Button
                  onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                  size="sm"
                  className="h-9 px-4 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
