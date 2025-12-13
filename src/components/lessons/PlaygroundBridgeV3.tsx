import { useState, useCallback } from 'react';
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

// Opções de chips para cada categoria
const FORMAT_OPTIONS = ['Curso em vídeo', 'eBook', 'Apostila', 'Workshop'];
const AUDIENCE_OPTIONS = ['Público em geral', 'Mães 40+', 'Professores', 'Médicos'];
const MODULES_OPTIONS = ['3', '4', '5'];
const CONTENT_TYPE_OPTIONS = ['Vídeos curtos', 'Aulas mais longas', 'Leitura / eBook'];

/**
 * 🚀 PLAYGROUND BRIDGE V3 - MINI-FERRAMENTA INTERATIVA
 * 
 * Step 1: I DO - Veja o exemplo
 * Step 2: WE DO (parte 1) - Escolha seu caso
 * Step 3: WE DO (parte 2) - Monte a estrutura
 * Step 4: YOU DO - Adapte e teste
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

  // Estado das escolhas do usuário - Step 2
  const [selectedFormat, setSelectedFormat] = useState('');
  const [customFormat, setCustomFormat] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [customAudience, setCustomAudience] = useState('');

  // Estado das escolhas do usuário - Step 3
  const [selectedModules, setSelectedModules] = useState('');
  const [customModules, setCustomModules] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [hasExercises, setHasExercises] = useState<boolean | null>(null);
  const [desiredResult, setDesiredResult] = useState('');

  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  // Valores finais para o prompt
  const finalFormat = selectedFormat === 'Outro' ? customFormat : selectedFormat;
  const finalAudience = selectedAudience === 'Outro' ? customAudience : selectedAudience;
  const finalModules = selectedModules === 'Outro' ? customModules : selectedModules;
  const exercisesText = hasExercises === true ? 'exercícios ao final de cada módulo' : hasExercises === false ? 'sem exercícios' : '';

  // Monta o prompt com as escolhas do usuário
  const buildPrompt = () => {
    let prompt = playgroundExample.examplePrompt;
    // Substitui formato/tipo de produto
    if (finalFormat) {
      prompt = prompt.replace(/\[curso ou eBook\]/gi, finalFormat);
      prompt = prompt.replace(/\[tipo de conteúdo\]/gi, finalFormat);
    }
    // Substitui tema - suporta múltiplos formatos de placeholder
    if (theme) {
      prompt = prompt.replace(/\[tema do curso ou eBook\]/gi, theme);
      prompt = prompt.replace(/\[assunto principal do curso ou eBook\]/gi, theme);
      prompt = prompt.replace(/\[seu tema principal\]/gi, theme);
    }
    // Substitui público
    if (finalAudience) {
      prompt = prompt.replace(/\[quem vai ler ou assistir\]/gi, finalAudience);
      prompt = prompt.replace(/\[quem você quer atingir\]/gi, finalAudience);
    }
    // Substitui módulos
    if (finalModules) {
      prompt = prompt.replace(/\[número de módulos\]/gi, finalModules);
      // Substitui "3 a 5 tópicos" por número real de módulos se especificado
      prompt = prompt.replace(/3 a 5 tópicos/gi, `${finalModules} módulos`);
    }
    // Substitui resultado desejado
    if (desiredResult) {
      prompt = prompt.replace(/\[o que a pessoa deve conseguir fazer ao final\]/gi, desiredResult);
      prompt = prompt.replace(/\[o que deve acontecer\]/gi, desiredResult);
    }
    // Substitui exercícios
    if (exercisesText) {
      prompt = prompt.replace(/\[exercícios ou atividades\]/gi, exercisesText);
    }
    return prompt;
  };

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chip selecionável
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

  // Radio option
  const RadioOption = ({
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
      className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 ${
        selected 
          ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600' 
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-300'
      }`}
    >
      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-violet-600' : 'border-slate-300 dark:border-slate-600'
      }`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />}
      </div>
      <span className="text-foreground/80">{label}</span>
    </button>
  );

  // Renderiza prompt com destaques das escolhas
  const renderPromptWithHighlights = () => {
    const parts = playgroundExample.examplePrompt.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        let value = '';
        const lowerPart = part.toLowerCase();
        
        // Formato/tipo de produto
        if (lowerPart.includes('curso ou ebook') || lowerPart.includes('tipo de conteúdo')) {
          value = finalFormat;
        }
        // Tema - múltiplos formatos
        else if (lowerPart.includes('tema do curso') || lowerPart.includes('assunto principal') || lowerPart.includes('seu tema principal')) {
          value = theme;
        }
        // Público
        else if (lowerPart.includes('quem vai') || lowerPart.includes('quem você quer atingir')) {
          value = finalAudience;
        }
        // Módulos
        else if (lowerPart.includes('número de módulos')) {
          value = finalModules;
        }
        // Resultado
        else if (lowerPart.includes('conseguir fazer') || lowerPart.includes('o que deve acontecer')) {
          value = desiredResult;
        }
        // Exercícios
        else if (lowerPart.includes('exercícios')) {
          value = exercisesText;
        }
        
        if (value) {
          return (
            <span 
              key={idx} 
              className="px-1 rounded font-semibold bg-violet-200 text-violet-900 dark:bg-violet-500/40 dark:text-violet-200"
            >
              {value}
            </span>
          );
        }
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
      case 3: return { icon: '📚', label: 'MONTE A ESTRUTURA', color: 'amber' };
      case 4: return { icon: '🚀', label: 'ADAPTE E TESTE', color: 'purple' };
      default: return { icon: '👁', label: 'VEJA O EXEMPLO', color: 'emerald' };
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

              {/* STEP 2: WE DO (parte 1) - Escolha seu caso */}
              {step === 2 && (
                <div className="space-y-3">
                  {/* Formato */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Tipo de produto:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {FORMAT_OPTIONS.map((opt) => (
                        <SelectChip
                          key={opt}
                          label={opt}
                          selected={selectedFormat === opt}
                          onClick={() => setSelectedFormat(selectedFormat === opt ? '' : opt)}
                        />
                      ))}
                      <SelectChip
                        label="Outro"
                        selected={selectedFormat === 'Outro'}
                        onClick={() => setSelectedFormat(selectedFormat === 'Outro' ? '' : 'Outro')}
                      />
                    </div>
                    {selectedFormat === 'Outro' && (
                      <Input
                        value={customFormat}
                        onChange={(e) => setCustomFormat(e.target.value)}
                        placeholder="Ex.: Podcast, Newsletter..."
                        className="mt-1.5 h-8 text-xs"
                      />
                    )}
                  </div>

                  {/* Tema */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Qual é o tema?</p>
                    <Input
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ex.: gestão de marketing, dieta low carb..."
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Público */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Quem é o público?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AUDIENCE_OPTIONS.map((opt) => (
                        <SelectChip
                          key={opt}
                          label={opt}
                          selected={selectedAudience === opt}
                          onClick={() => setSelectedAudience(selectedAudience === opt ? '' : opt)}
                        />
                      ))}
                      <SelectChip
                        label="Outro"
                        selected={selectedAudience === 'Outro'}
                        onClick={() => setSelectedAudience(selectedAudience === 'Outro' ? '' : 'Outro')}
                      />
                    </div>
                    {selectedAudience === 'Outro' && (
                      <Input
                        value={customAudience}
                        onChange={(e) => setCustomAudience(e.target.value)}
                        placeholder="Ex.: Jovens empreendedores..."
                        className="mt-1.5 h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: WE DO (parte 2) - Monte a estrutura */}
              {step === 3 && (
                <div className="space-y-3">
                  {/* Módulos */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Quantos módulos ou capítulos?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MODULES_OPTIONS.map((opt) => (
                        <SelectChip
                          key={opt}
                          label={opt}
                          selected={selectedModules === opt}
                          onClick={() => setSelectedModules(selectedModules === opt ? '' : opt)}
                        />
                      ))}
                      <SelectChip
                        label="Outro"
                        selected={selectedModules === 'Outro'}
                        onClick={() => setSelectedModules(selectedModules === 'Outro' ? '' : 'Outro')}
                      />
                    </div>
                    {selectedModules === 'Outro' && (
                      <Input
                        type="number"
                        value={customModules}
                        onChange={(e) => setCustomModules(e.target.value)}
                        placeholder="Ex.: 6, 7, 8..."
                        className="mt-1.5 h-8 text-xs w-24"
                      />
                    )}
                  </div>

                  {/* Tipo de conteúdo */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Tipo de conteúdo principal:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CONTENT_TYPE_OPTIONS.map((opt) => (
                        <SelectChip
                          key={opt}
                          label={opt}
                          selected={selectedContentType === opt}
                          onClick={() => setSelectedContentType(selectedContentType === opt ? '' : opt)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Exercícios */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Vai ter exercícios ou atividades?</p>
                    <div className="flex flex-col gap-1.5">
                      <RadioOption
                        label="Não"
                        selected={hasExercises === false}
                        onClick={() => setHasExercises(false)}
                      />
                      <RadioOption
                        label="Sim, no final de cada módulo"
                        selected={hasExercises === true}
                        onClick={() => setHasExercises(true)}
                      />
                    </div>
                  </div>

                  {/* Resultado desejado */}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">Resultado desejado:</p>
                    <Input
                      value={desiredResult}
                      onChange={(e) => setDesiredResult(e.target.value)}
                      placeholder="Ex.: controlar despesas, dar a primeira aula..."
                      className="h-8 text-xs"
                    />
                  </div>
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
