import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import { 
  Eye, 
  ListChecks, 
  Rocket,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// ============================================================================
// CONTRATO DE DADOS V3
// ============================================================================
export interface PlaygroundExampleDataV3 {
  title: string;              // título curto (~60 chars)
  context: string;            // 1 frase curta
  requirements: string[];     // 3-4 items com [colchetes]
  examplePrompt: string;      // 1 prompt com colchetes (2-3 linhas max)
}

interface PlaygroundBridgeV3Props {
  playgroundExample?: PlaygroundExampleDataV3;
  onComplete: (answer: string | null) => void;
  onSkip: () => void;
  lessonId?: string;
}

/**
 * 🚀 PLAYGROUND BRIDGE V3 - MICRO-FERRAMENTA
 * 
 * 1 modal único, 3 blocos compactos, SEM scroll interno
 * Bloco 1: Veja o exemplo (context curto)
 * Bloco 2: Preencha mentalmente (3-4 requirements)
 * Bloco 3: Adapte e teste (1 prompt editável + dica curta)
 */
export function PlaygroundBridgeV3({
  playgroundExample,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV3Props) {
  const [phase, setPhase] = useState<'modal' | 'playground'>('modal');
  const [highlightedReq, setHighlightedReq] = useState<number | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');

  useEffect(() => {
    if (playgroundExample?.examplePrompt) {
      setEditedPrompt(playgroundExample.examplePrompt);
    }
  }, [playgroundExample?.examplePrompt]);

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

  // Extrai label e placeholder do requirement
  const parseRequirement = (req: string) => {
    const colonIndex = req.indexOf(':');
    if (colonIndex === -1) return { label: req, placeholder: '' };
    const label = req.substring(0, colonIndex + 1).trim();
    const rest = req.substring(colonIndex + 1).trim();
    return { label, placeholder: rest };
  };

  // Verifica match entre requirement e colchete no prompt
  const isRequirementMatch = (reqIndex: number, bracket: string) => {
    const req = playgroundExample.requirements[reqIndex];
    if (!req) return false;
    const reqBracketMatch = req.match(/\[([^\]]+)\]/);
    if (!reqBracketMatch) return false;
    return bracket.toLowerCase().includes(reqBracketMatch[1].toLowerCase().substring(0, 10));
  };

  // Renderiza prompt com highlights nos colchetes
  const renderPromptWithHighlights = () => {
    const parts = editedPrompt.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const isHighlighted = highlightedReq !== null && isRequirementMatch(highlightedReq, part);
        return (
          <span 
            key={idx} 
            className={`px-0.5 rounded font-medium transition-all duration-200 ${
              isHighlighted 
                ? 'bg-cyan-400 text-cyan-900' 
                : 'bg-amber-200/80 text-amber-900'
            }`}
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
          initialPrompt={editedPrompt}
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
          
          {/* HEADER compacto */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <h3 className="text-white font-bold text-base leading-tight">
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
          </div>

          {/* CONTEÚDO: 3 BLOCOS compactos */}
          <div className="p-4 space-y-3">
            
            {/* BLOCO 1: Veja o exemplo */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Veja o exemplo
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-snug">
                    {playgroundExample.context}
                  </p>
                </div>
              </div>
            </div>

            {/* BLOCO 2: Preencha mentalmente */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                      Preencha na cabeça
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {playgroundExample.requirements.map((req, idx) => {
                      const { label, placeholder } = parseRequirement(req);
                      const isSelected = highlightedReq === idx;
                      
                      return (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setHighlightedReq(isSelected ? null : idx)}
                          className={`w-full text-left text-xs py-1.5 px-2.5 rounded-md transition-all duration-150 flex items-start gap-1.5 ${
                            isSelected 
                              ? 'bg-cyan-100 dark:bg-cyan-900/50 ring-1 ring-cyan-400' 
                              : 'bg-white/60 dark:bg-slate-800/40 hover:bg-blue-100/80'
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
              </div>
            </div>

            {/* BLOCO 3: Adapte e teste (SÓ 1 TEXTAREA) */}
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Rocket className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Adapte e teste
                    </span>
                  </div>
                  
                  {/* ÚNICO elemento de prompt - com highlights */}
                  <div 
                    className="bg-white dark:bg-slate-900/80 rounded-md p-2.5 border border-purple-100 dark:border-purple-900/40 min-h-[60px] cursor-text"
                    onClick={() => document.getElementById('prompt-textarea')?.focus()}
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {renderPromptWithHighlights()}
                    </p>
                  </div>

                  {/* Textarea invisível para edição */}
                  <textarea
                    id="prompt-textarea"
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="sr-only"
                  />
                  
                  <p className="text-[11px] text-purple-500/80 dark:text-purple-400/60 mt-2 italic">
                    Substitua os [colchetes] pelo seu caso real antes de testar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-4 pt-1">
            <Button
              onClick={handleGoToPlayground}
              disabled={!editedPrompt.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-5 text-sm rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Testar no Playground
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}