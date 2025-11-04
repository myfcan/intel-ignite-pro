import { useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { WordTimestamp } from '@/types/guidedLesson';

interface SyncedTextProps {
  content: string;
  isActive: boolean;
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  sectionStartTime?: number;
}

// Remove emojis e formatação markdown para extrair apenas texto puro
const extractPlainText = (markdown: string): string => {
  return markdown
    .replace(/[#*_`~\[\]()]/g, '') // Remove markdown syntax
    .replace(/[^\w\sÀ-ÿ,.!?;:-]/g, '') // Remove emojis e símbolos especiais
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
};

export const SyncedText = ({ content, isActive, wordTimestamps, currentTime, sectionStartTime = 0 }: SyncedTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  
  // Verificar se o conteúdo bate com os timestamps
  const syncEnabled = useMemo(() => {
    if (wordTimestamps.length === 0) return false;
    
    const plainText = extractPlainText(content);
    const plainWords = plainText.split(/\s+/).filter(w => w.length > 0);
    
    if (plainWords.length === 0) return false;
    
    // Verifica se as primeiras palavras batem (normalizado)
    const firstPlainWord = plainWords[0]?.toLowerCase().replace(/[.,!?;:]/g, '');
    const firstTimestamp = wordTimestamps[0]?.word.toLowerCase().replace(/[.,!?;:]/g, '');
    
    const matches = firstPlainWord === firstTimestamp || 
                    firstPlainWord?.includes(firstTimestamp) ||
                    firstTimestamp?.includes(firstPlainWord);
    
    console.log('🔍 Verificação de sincronização:', {
      matches,
      firstPlainWord,
      firstTimestamp,
      totalPlainWords: plainWords.length,
      totalTimestamps: wordTimestamps.length
    });
    
    return matches;
  }, [content, wordTimestamps]);
  
  // Se não sincronizar, retornar apenas renderização estática
  if (!syncEnabled) {
    return (
      <div
        ref={containerRef}
        className={`
          transition-all duration-500 prose prose-sm max-w-none
          ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}
        `}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  // Índice global que será resetado a cada render
  let globalWordIndex = 0;

  // Encontrar palavra ativa usando currentTime diretamente
  const activeWordIndex = wordTimestamps.findIndex(
    (wt) => currentTime >= wt.start && currentTime < wt.end
  );


  // Scroll automático para palavra ativa
  useEffect(() => {
    if (activeWordIndex >= 0 && isActive) {
      const wordElement = wordRefs.current.get(activeWordIndex);
      if (wordElement) {
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeWordIndex, isActive]);

  // Processar markdown para adicionar spans nas palavras (SEM emojis/formatação)
  const processTextWithSpans = (text: string) => {
    // Remove emojis e símbolos especiais, mantém apenas texto e pontuação
    const cleanText = text.replace(/[^\w\sÀ-ÿ,.!?;:-]/g, '');
    const words = cleanText.split(/(\s+)/);

    return words.map((segment, i) => {
      if (/^\s+$/.test(segment) || segment.length === 0) {
        return <span key={i}>{segment}</span>;
      }

      const currentWordIndex = globalWordIndex;
      globalWordIndex++;

      const isCurrentWord = currentWordIndex === activeWordIndex;
      const isPastWord = activeWordIndex >= 0 && currentWordIndex < activeWordIndex;

      return (
        <span
          key={`${currentWordIndex}-${i}`}
          ref={(el) => {
            if (el) wordRefs.current.set(currentWordIndex, el);
          }}
          className={`
            transition-all duration-200 inline-block
            ${isCurrentWord ? 'bg-cyan-400/20 text-cyan-400 font-bold px-1 rounded scale-105' : ''}
            ${isPastWord ? 'text-white' : ''}
            ${!isCurrentWord && !isPastWord ? 'text-purple-300/50' : ''}
          `}
          style={{
            transformOrigin: 'center',
          }}
        >
          {segment}
        </span>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`
        transition-all duration-500 prose prose-sm max-w-none
        ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}
      `}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">
              {typeof children === 'string' ? processTextWithSpans(children) : children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              {typeof children === 'string' ? processTextWithSpans(children) : children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {typeof children === 'string' ? processTextWithSpans(children) : children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {typeof children === 'string' ? processTextWithSpans(children) : children}
            </h3>
          ),
          li: ({ children }) => (
            <li className="mb-2 text-muted-foreground">
              {typeof children === 'string' ? processTextWithSpans(children) : children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {typeof children === 'string' ? processTextWithSpans(children) : children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
