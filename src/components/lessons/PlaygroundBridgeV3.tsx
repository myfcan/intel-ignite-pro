import { useState, useCallback } from 'react';
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
// CHIPS PRÉ-DEFINIDOS (valores fixos como especificado)
// ============================================================================
const PRODUCT_TYPES = ['Curso em vídeo', 'eBook', 'Apostila', 'Workshop'];
const AUDIENCE_OPTIONS = ['Público em geral', 'Mães 40+', 'Professores', 'Médicos'];
const MODULE_COUNTS = ['3', '4', '5'];
const CONTENT_TYPES = ['Vídeos curtos', 'Aulas mais longas', 'Leitura / eBook'];
const EXERCISE_OPTIONS = ['Não', 'Sim, no final de cada módulo'];

/**
 * 🚀 PLAYGROUND BRIDGE V3 - WIZARD DE 4 PASSOS SEM SCROLL
 * 
 * Step 1: I DO - VEJA O EXEMPLO
 * Step 2: WE DO Part 1 - ESCOLHA SEU CASO (tipo produto, tema, público)
 * Step 3: WE DO Part 2 - MONTE A ESTRUTURA (módulos, conteúdo, exercícios, resultado)
 * Step 4: YOU DO - ADAPTE E TESTE
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

  // Step 2 - Escolha seu caso
  const [productType, setProductType] = useState('');
  const [productTypeCustom, setProductTypeCustom] = useState('');
  const [showProductTypeCustom, setShowProductTypeCustom] = useState(false);
  
  const [tema, setTema] = useState('');
  
  const [audience, setAudience] = useState('');
  const [audienceCustom, setAudienceCustom] = useState('');
  const [showAudienceCustom, setShowAudienceCustom] = useState(false);

  // Step 3 - Monte a estrutura
  const [moduleCount, setModuleCount] = useState('');
  const [moduleCountCustom, setModuleCountCustom] = useState('');
  const [showModuleCountCustom, setShowModuleCountCustom] = useState(false);
  
  const [contentType, setContentType] = useState('');
  const [exercises, setExercises] = useState('');
  const [resultado, setResultado] = useState('');

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  // Valores finais para o prompt
  const finalProductType = showProductTypeCustom ? productTypeCustom : productType;
  const finalAudience = showAudienceCustom ? audienceCustom : audience;
  const finalModuleCount = showModuleCountCustom ? moduleCountCustom : moduleCount;

  // Monta o prompt substituindo os slots pelos valores escolhidos
  const buildPrompt = useCallback(() => {
    let prompt = playgroundExample.examplePrompt;
    
    // Substitui os colchetes pelos valores escolhidos
    if (finalProductType) {
      prompt = prompt.replace(/\[curso em vídeo, eBook, apostila, workshop, outro\]/gi, `[${finalProductType}]`);
      prompt = prompt.replace(/\[curso ou eBook\]/gi, `[${finalProductType}]`);
    }
    if (tema) {
      prompt = prompt.replace(/\[assunto principal do curso ou eBook\]/gi, `[${tema}]`);
    }
    if (finalAudience) {
      prompt = prompt.replace(/\[quem vai ler ou assistir\]/gi, `[${finalAudience}]`);
    }
    if (finalModuleCount) {
      prompt = prompt.replace(/\[número de módulos\]/gi, `[${finalModuleCount}]`);
    }
    if (resultado) {
      prompt = prompt.replace(/\[o que a pessoa deve conseguir fazer ao final\]/gi, `[${resultado}]`);
    }
    if (exercises) {
      const exerciseText = exercises === 'Sim, no final de cada módulo' ? 'exercícios ao final de cada módulo' : 'sem exercícios';
      prompt = prompt.replace(/\[exercícios ou atividades\]/gi, `[${exerciseText}]`);
    }
    
    return prompt;
  }, [playgroundExample.examplePrompt, finalProductType, tema, finalAudience, finalModuleCount, resultado, exercises]);

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handlers para chips
  const handleProductTypeSelect = (value: string) => {
    if (value === '__other__') {
      setShowProductTypeCustom(true);
      setProductType('');
    } else {
      setProductType(value);
      setShowProductTypeCustom(false);
    }
  };

  const handleAudienceSelect = (value: string) => {
    if (value === '__other__') {
      setShowAudienceCustom(true);
      setAudience('');
    } else {
      setAudience(value);
      setShowAudienceCustom(false);
    }
  };

  const handleModuleCountSelect = (value: string) => {
    if (value === '__other__') {
      setShowModuleCountCustom(true);
      setModuleCount('');
    } else {
      setModuleCount(value);
      setShowModuleCountCustom(false);
    }
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

                  {/* Context text */}
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Com 1 prompt e algumas informações suas, a I.A. sugere o esqueleto de um curso ou eBook completo.
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
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {playgroundExample.exampleOutput}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 2: ESCOLHA SEU CASO (WE DO - Parte 1) */}
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

                  {/* Campo 1: Tipo de produto */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Tipo de produto
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRODUCT_TYPES.map((type) => (
                        <ChipButton
                          key={type}
                          label={type}
                          selected={productType === type && !showProductTypeCustom}
                          onClick={() => handleProductTypeSelect(type)}
                        />
                      ))}
                      <OtherChip
                        active={showProductTypeCustom}
                        onClick={() => handleProductTypeSelect('__other__')}
                      />
                    </div>
                    {showProductTypeCustom && (
                      <Input
                        type="text"
                        placeholder="Digite o tipo..."
                        value={productTypeCustom}
                        onChange={(e) => setProductTypeCustom(e.target.value)}
                        className="text-sm h-8 mt-1"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Campo 2: Tema */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Qual é o tema?
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex.: organização financeira, inglês para iniciantes, marketing para médicos"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>

                  {/* Campo 3: Público */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Quem é o público?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AUDIENCE_OPTIONS.map((opt) => (
                        <ChipButton
                          key={opt}
                          label={opt}
                          selected={audience === opt && !showAudienceCustom}
                          onClick={() => handleAudienceSelect(opt)}
                        />
                      ))}
                      <OtherChip
                        active={showAudienceCustom}
                        onClick={() => handleAudienceSelect('__other__')}
                      />
                    </div>
                    {showAudienceCustom && (
                      <Input
                        type="text"
                        placeholder="Digite o público..."
                        value={audienceCustom}
                        onChange={(e) => setAudienceCustom(e.target.value)}
                        className="text-sm h-8 mt-1"
                        autoFocus
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* ================================================================ */}
              {/* STEP 3: MONTE A ESTRUTURA (WE DO - Parte 2) */}
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
                      Monte a Estrutura
                    </span>
                  </div>

                  {/* Campo 1: Quantidade de módulos */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Quantos módulos ou capítulos?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {MODULE_COUNTS.map((count) => (
                        <ChipButton
                          key={count}
                          label={count}
                          selected={moduleCount === count && !showModuleCountCustom}
                          onClick={() => handleModuleCountSelect(count)}
                        />
                      ))}
                      <OtherChip
                        active={showModuleCountCustom}
                        onClick={() => handleModuleCountSelect('__other__')}
                      />
                    </div>
                    {showModuleCountCustom && (
                      <Input
                        type="number"
                        placeholder="Ex.: 6"
                        value={moduleCountCustom}
                        onChange={(e) => setModuleCountCustom(e.target.value)}
                        className="text-sm h-8 mt-1 w-20"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Campo 2: Tipo de conteúdo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Tipo de conteúdo principal
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CONTENT_TYPES.map((type) => (
                        <ChipButton
                          key={type}
                          label={type}
                          selected={contentType === type}
                          onClick={() => setContentType(type)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Campo 3: Exercícios */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Vai ter exercícios ou atividades?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {EXERCISE_OPTIONS.map((opt) => (
                        <ChipButton
                          key={opt}
                          label={opt}
                          selected={exercises === opt}
                          onClick={() => setExercises(opt)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Campo 4: Resultado desejado */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">
                      Resultado desejado
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex.: controlar despesas, dar a primeira aula, liderar reuniões"
                      value={resultado}
                      onChange={(e) => setResultado(e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
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
                  <p className="text-xs text-foreground/60">
                    Confira o prompt abaixo. Se quiser, ajuste os colchetes com seu caso real e depois teste no Playground.
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
                      className="flex-1 gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
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
          <div className="px-4 pb-4 pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
                className="gap-1 text-foreground/60"
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
                className="gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
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
