import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import { 
  Eye, 
  ListChecks, 
  Rocket,
  Copy, 
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// CONTRATO DE DADOS V3 - Idêntico ao V2, compatível
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
 * 🚀 PLAYGROUND BRIDGE V3 - "Turbo"
 * 
 * 1 modal único com 3 blocos estáticos (I DO / WE DO / YOU DO)
 * Altura máxima: 1-1.5 telas mobile
 * Sem wizard, sem complexidade - micro-ferramenta guiada
 */
export function PlaygroundBridgeV3({
  playgroundExample,
  onComplete,
  onSkip,
  lessonId,
}: PlaygroundBridgeV3Props) {
  const [phase, setPhase] = useState<'modal' | 'playground'>('modal');
  const [copied, setCopied] = useState(false);
  const [highlightedReq, setHighlightedReq] = useState<number | null>(null);
  const { toast } = useToast();

  // Fallback: se não tem exemplo, vai direto pro playground
  if (!playgroundExample) {
    return (
      <PlaygroundRealChat
        lessonId={lessonId}
        onComplete={() => onComplete(null)}
      />
    );
  }

  const handleCopyPrompt = useCallback(() => {
    if (!playgroundExample?.examplePrompt) return;
    
    navigator.clipboard.writeText(playgroundExample.examplePrompt);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Prompt copiado. Agora adapte os [colchetes] para seu caso.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  }, [playgroundExample?.examplePrompt, toast]);

  const handleGoToPlayground = useCallback(() => {
    setPhase('playground');
  }, []);

  // Destaca colchetes correspondentes ao requirement clicado
  const highlightBrackets = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const isHighlighted = highlightedReq !== null && 
          isRequirementMatch(highlightedReq, part);
        
        return (
          <span 
            key={idx} 
            className={`px-1 rounded font-semibold transition-all duration-300 ${
              isHighlighted 
                ? 'bg-cyan-400 text-cyan-900 ring-2 ring-cyan-400 ring-offset-1' 
                : 'bg-amber-200 dark:bg-amber-700/60 text-amber-900 dark:text-amber-100'
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Verifica se o colchete corresponde ao requirement selecionado
  const isRequirementMatch = (reqIndex: number, bracket: string) => {
    const keywords: Record<number, string[]> = {
      0: ['tema', 'produto', 'principal', 'curso', 'ebook'],
      1: ['público', 'quem', 'ler', 'assistir'],
      2: ['formato', 'vídeo', 'apostila', 'workshop'],
      3: ['resultado', 'final', 'conseguir', 'fazer', 'objetivo'],
    };
    const bracketLower = bracket.toLowerCase();
    return keywords[reqIndex]?.some(kw => bracketLower.includes(kw)) || false;
  };

  // Se está no playground
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
        className="w-full max-w-md max-h-[85vh] overflow-y-auto"
      >
        <Card className="shadow-2xl border-2 border-primary/30 rounded-xl overflow-hidden">
          
          {/* ===== HEADER ===== */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-3 px-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base leading-tight">
                {playgroundExample.title}
              </h3>
              <button
                onClick={onSkip}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ===== CONTEÚDO: 3 BLOCOS ===== */}
          <div className="p-4 space-y-4">
            
            {/* ----- PASSO 1: I DO (context) ----- */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Veja o exemplo
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed pl-8">
                {playgroundExample.context}
              </p>
            </div>

            {/* ----- PASSO 2: WE DO (requirements) ----- */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                    Preencha mentalmente
                  </span>
                </div>
              </div>
              <ul className="space-y-1.5 pl-8">
                {playgroundExample.requirements.map((req, idx) => (
                  <li 
                    key={idx}
                    onClick={() => setHighlightedReq(highlightedReq === idx ? null : idx)}
                    className={`text-sm text-foreground cursor-pointer py-1 px-2 rounded transition-all ${
                      highlightedReq === idx 
                        ? 'bg-cyan-100 dark:bg-cyan-900/40 ring-1 ring-cyan-400' 
                        : 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    {highlightBrackets(req)}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-2 pl-8">
                💡 Clique em um item para destacar no prompt abaixo
              </p>
            </div>

            {/* ----- PASSO 3: YOU DO (examplePrompt) ----- */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div className="flex items-center gap-1.5">
                  <Rocket className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                    Copie e adapte
                  </span>
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-900/60 rounded-md px-3 py-2.5 border border-purple-100 dark:border-purple-900/30 mb-3 ml-8">
                <p className="text-sm text-foreground leading-relaxed">
                  {highlightBrackets(playgroundExample.examplePrompt)}
                </p>
              </div>

              <div className="pl-8">
                <button
                  onClick={handleCopyPrompt}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar prompt'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ===== FOOTER CTA ===== */}
          <div className="px-4 pb-4 pt-2 sticky bottom-0 bg-card">
            <Button
              onClick={handleGoToPlayground}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-3 text-sm rounded-lg shadow-md"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Ir para o Playground
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
