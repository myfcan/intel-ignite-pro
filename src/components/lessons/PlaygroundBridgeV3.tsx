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
  title: string;              // título curto do modal (~60 chars)
  context: string;            // I DO: 1-2 frases (20-35 palavras)
  requirements: string[];     // WE DO: 4 items curtos (10-14 palavras cada)
  examplePrompt: string;      // YOU DO: 1 prompt com colchetes
}

interface PlaygroundBridgeV3Props {
  playgroundExample?: PlaygroundExampleDataV3;
  onComplete: (answer: string | null) => void;
  onSkip: () => void;
  lessonId?: string;
}

/**
 * 🚀 PLAYGROUND BRIDGE V3
 * 
 * 1 modal único com 3 blocos (I DO / WE DO / YOU DO)
 * Bloco 3 tem textarea EDITÁVEL para o usuário adaptar o prompt
 * Botão final envia o prompt editado para o PlaygroundRealChat
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

  // Inicializa o prompt editável com o exemplo
  useEffect(() => {
    if (playgroundExample?.examplePrompt) {
      setEditedPrompt(playgroundExample.examplePrompt);
    }
  }, [playgroundExample?.examplePrompt]);

  // Fallback: se não tem exemplo, vai direto pro playground
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

  // Extrai a label (antes do :) e o placeholder (dentro de [])
  const parseRequirement = (req: string) => {
    const colonIndex = req.indexOf(':');
    if (colonIndex === -1) return { label: req, placeholder: '' };
    
    const label = req.substring(0, colonIndex + 1).trim();
    const rest = req.substring(colonIndex + 1).trim();
    const bracketMatch = rest.match(/\[([^\]]+)\]/);
    const placeholder = bracketMatch ? bracketMatch[0] : rest;
    
    return { label, placeholder };
  };

  // Verifica se o colchete corresponde ao requirement selecionado
  const isRequirementMatch = (reqIndex: number, bracket: string) => {
    const req = playgroundExample.requirements[reqIndex];
    if (!req) return false;
    
    const reqBracketMatch = req.match(/\[([^\]]+)\]/);
    if (!reqBracketMatch) return false;
    
    return bracket.toLowerCase().includes(reqBracketMatch[1].toLowerCase().substring(0, 10));
  };

  // Renderiza o prompt com highlights nos colchetes
  const renderPromptWithHighlights = () => {
    const parts = editedPrompt.split(/(\[[^\]]+\])/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const isHighlighted = highlightedReq !== null && 
          isRequirementMatch(highlightedReq, part);
        
        return (
          <span 
            key={idx} 
            className={`px-1 py-0.5 rounded font-medium transition-all duration-300 ${
              isHighlighted 
                ? 'bg-cyan-400 text-cyan-900 ring-2 ring-cyan-500' 
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

  // Se está no playground, passa o prompt editado
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
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          
          {/* ===== HEADER ===== */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-4 px-5 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white/90" />
                <h3 className="text-white font-bold text-lg leading-tight">
                  {playgroundExample.title}
                </h3>
              </div>
              <button
                onClick={onSkip}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ===== CONTEÚDO: 3 BLOCOS ===== */}
          <div className="p-5 space-y-5">
            
            {/* ----- BLOCO 1: I DO (context) ----- */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Veja o exemplo
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {playgroundExample.context}
                  </p>
                </div>
              </div>
            </div>

            {/* ----- BLOCO 2: WE DO (requirements) ----- */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                      Preencha mentalmente
                    </span>
                  </div>
                  <div className="space-y-2">
                    {playgroundExample.requirements.map((req, idx) => {
                      const { label, placeholder } = parseRequirement(req);
                      const isSelected = highlightedReq === idx;
                      
                      return (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setHighlightedReq(isSelected ? null : idx)}
                          className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-start gap-2 ${
                            isSelected 
                              ? 'bg-cyan-100 dark:bg-cyan-900/50 ring-2 ring-cyan-400 shadow-sm' 
                              : 'bg-white/60 dark:bg-slate-800/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/30'
                          }`}
                        >
                          <span className="text-foreground/80 font-medium">{label}</span>
                          <span className={`font-semibold transition-colors ${
                            isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-amber-700 dark:text-amber-400'
                          }`}>
                            {placeholder}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-blue-500/80 dark:text-blue-400/60 mt-3 italic">
                    💡 Clique em um item para destacar no prompt abaixo
                  </p>
                </div>
              </div>
            </div>

            {/* ----- BLOCO 3: YOU DO (editable prompt) ----- */}
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Adapte e teste
                    </span>
                  </div>
                  
                  {/* Preview com highlights */}
                  <div className="bg-white dark:bg-slate-900/80 rounded-lg p-3 border border-purple-100 dark:border-purple-900/40 mb-3 min-h-[80px]">
                    <p className="text-sm text-foreground leading-relaxed">
                      {renderPromptWithHighlights()}
                    </p>
                  </div>

                  {/* Textarea editável */}
                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    placeholder="Edite o prompt acima, substituindo os [colchetes] pelo seu caso..."
                    className="w-full min-h-[100px] p-3 text-sm rounded-lg border-2 border-purple-200 dark:border-purple-800/60 bg-white dark:bg-slate-900 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none placeholder:text-muted-foreground/60"
                  />
                  
                  <p className="text-xs text-purple-500/80 dark:text-purple-400/60 mt-2 italic">
                    ✏️ Substitua os [colchetes] pelo seu caso real
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FOOTER CTA ===== */}
          <div className="px-5 pb-5 pt-2 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950">
            <Button
              onClick={handleGoToPlayground}
              disabled={!editedPrompt.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Testar no Playground
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
