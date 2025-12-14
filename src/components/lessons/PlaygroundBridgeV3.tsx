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
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Lightbulb
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
 * Parse um requirement no formato:
 * "Label: [slot] – ex.: chip1, chip2, chip3"
 * ou
 * "Label: [chip1, chip2, chip3]" (sem – ex.:)
 * 
 * Retorna: { label, slot, chips }
 */
function parseRequirement(req: string): { 
  label: string; 
  slot: string; 
  chips: string[];
} {
  // Divide por ":"
  const colonIndex = req.indexOf(':');
  if (colonIndex === -1) {
    return { label: req, slot: '', chips: [] };
  }
  
  const label = req.substring(0, colonIndex).trim();
  const rest = req.substring(colonIndex + 1).trim();
  
  // Extrai slot entre colchetes
  const bracketMatch = rest.match(/\[([^\]]+)\]/);
  const slot = bracketMatch ? bracketMatch[1] : '';
  
  // Extrai chips após "– ex.:" ou "- ex.:" ou "ex.:"
  const exMatch = rest.match(/[–-]\s*ex\.?:\s*(.+)$/i);
  let chips: string[] = [];
  
  if (exMatch) {
    // Tem "– ex.:" → usa os exemplos como chips
    chips = exMatch[1].split(',').map(c => c.trim()).filter(Boolean);
  } else if (slot) {
    // Não tem "– ex.:" → usa o conteúdo dos colchetes como chips
    chips = slot.split(',').map(c => c.trim()).filter(Boolean);
  }
  
  return { label, slot, chips };
}

/**
 * 🚀 PLAYGROUND BRIDGE V3 - WIZARD DE 4 PASSOS SEM SCROLL
 * 
 * Step 1: I DO - Veja o exemplo (title, context, exampleOutput)
 * Step 2: WE DO Part 1 - Escolha seu caso (requirements[0] e [2])
 * Step 3: WE DO Part 2 - Ajuste os detalhes (requirements[1] e [3])
 * Step 4: YOU DO - Monte seu prompt (examplePrompt com colchetes)
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

  // Estado para os valores selecionados (por label)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  // Estado para inputs custom ("Outro")
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  // Estado para mostrar input de "Outro"
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});

  // Parse todos os requirements
  const parsedRequirements = useMemo(() => {
    if (!playgroundExample?.requirements) return [];
    return playgroundExample.requirements.map(parseRequirement);
  }, [playgroundExample?.requirements]);

  // Requirements por step
  // Step 2: índices 0 e 2 (tema/foco e formato)
  // Step 3: índices 1 e 3 (público e resultado)
  const step2Reqs = useMemo(() => {
    const reqs = [];
    if (parsedRequirements[0]) reqs.push(parsedRequirements[0]);
    if (parsedRequirements[2]) reqs.push(parsedRequirements[2]);
    return reqs;
  }, [parsedRequirements]);

  const step3Reqs = useMemo(() => {
    const reqs = [];
    if (parsedRequirements[1]) reqs.push(parsedRequirements[1]);
    if (parsedRequirements[3]) reqs.push(parsedRequirements[3]);
    return reqs;
  }, [parsedRequirements]);

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  // Monta o prompt substituindo os slots pelos valores preenchidos
  const buildPrompt = useCallback(() => {
    let prompt = playgroundExample.examplePrompt;
    
    parsedRequirements.forEach((req) => {
      const value = fieldValues[req.label];
      if (value && req.slot) {
        // Substitui o bracket original pelo valor
        const bracketPattern = new RegExp(`\\[${req.slot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'gi');
        prompt = prompt.replace(bracketPattern, value);
      }
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

  const handleChipSelect = (label: string, value: string) => {
    // Se clicou em "Outro", mostra o input
    if (value === '__other__') {
      setShowCustomInput(prev => ({ ...prev, [label]: true }));
      return;
    }
    
    // Seleciona o chip
    setFieldValues(prev => ({ ...prev, [label]: value }));
    setShowCustomInput(prev => ({ ...prev, [label]: false }));
  };

  const handleCustomInputChange = (label: string, value: string) => {
    setCustomInputs(prev => ({ ...prev, [label]: value }));
    setFieldValues(prev => ({ ...prev, [label]: value }));
  };

  // Verifica se pode avançar do step 2
  const canProceedFromStep2 = useMemo(() => {
    return step2Reqs.some(req => fieldValues[req.label]?.trim());
  }, [fieldValues, step2Reqs]);

  // Verifica se pode avançar do step 3
  const canProceedFromStep3 = useMemo(() => {
    return step3Reqs.some(req => fieldValues[req.label]?.trim());
  }, [fieldValues, step3Reqs]);

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

  // Renderiza um campo com CHIPS como opções principais
  const renderField = (req: { label: string; slot: string; chips: string[] }) => {
    const isSelected = (chip: string) => fieldValues[req.label] === chip;
    const isShowingCustom = showCustomInput[req.label];
    
    return (
      <div key={req.label} className="space-y-2">
        <label className="text-xs font-semibold text-foreground/80 block">
          {req.label}:
        </label>
        
        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          {req.chips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleChipSelect(req.label, chip)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
                isSelected(chip)
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-foreground/70 border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
              }`}
            >
              {chip}
            </button>
          ))}
          
          {/* Chip "Outro" */}
          <button
            onClick={() => handleChipSelect(req.label, '__other__')}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
              isShowingCustom
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-slate-100 dark:bg-slate-700 text-foreground/60 border-slate-200 dark:border-slate-600 hover:border-amber-400'
            }`}
          >
            Outro...
          </button>
        </div>
        
        {/* Input para "Outro" - só aparece se clicou */}
        {isShowingCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.15 }}
          >
            <Input
              type="text"
              placeholder="Digite sua opção..."
              value={customInputs[req.label] || ''}
              onChange={(e) => handleCustomInputChange(req.label, e.target.value)}
              className="text-sm h-8 mt-1"
              autoFocus
            />
          </motion.div>
        )}
      </div>
    );
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
              {/* STEP 1: I DO - Veja o exemplo */}
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

                  {/* Context */}
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {playgroundExample.context}
                  </p>

                  {/* Example output */}
                  {playgroundExample.exampleOutput && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Exemplo de resultado:
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {playgroundExample.exampleOutput}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 2: WE DO Part 1 - Escolha seu caso */}
              {/* ================================================================ */}
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
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wide uppercase">
                      Escolha seu Caso
                    </span>
                  </div>

                  {/* Fields for step 2 with chips */}
                  <div className="space-y-4">
                    {step2Reqs.map(req => renderField(req))}
                  </div>
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 3: WE DO Part 2 - Ajuste os detalhes */}
              {/* ================================================================ */}
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
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <Settings2 className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase">
                      Ajuste os Detalhes
                    </span>
                  </div>

                  {/* Fields for step 3 with chips */}
                  <div className="space-y-4">
                    {step3Reqs.map(req => renderField(req))}
                  </div>
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 4: YOU DO - Monte seu prompt */}
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
                      Monte seu Prompt
                    </span>
                  </div>

                  {/* Instruction */}
                  <p className="text-xs text-foreground/60">
                    Substitua os [colchetes] pelo seu caso real e clique em Testar no Playground.
                  </p>

                  {/* Prompt final */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {buildPrompt()}
                    </p>
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
                          Copiar prompt
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleGoToPlayground}
                      className="flex-1 gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      Testar no Playground
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
                onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
                className="gap-1.5 text-foreground/60 hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < 4 && (
              <Button
                size="sm"
                onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                disabled={(step === 2 && !canProceedFromStep2) || (step === 3 && !canProceedFromStep3)}
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
