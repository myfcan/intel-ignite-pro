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
  
  // Criar mapeamento entre palavras do texto puro e timestamps
  const wordMap = useMemo(() => {
    const plainText = extractPlainText(content);
    const plainWords = plainText.split(/\s+/).filter(w => w.length > 0);
    
    console.log('📖 Mapeamento:', {
      totalTimestamps: wordTimestamps.length,
      totalPlainWords: plainWords.length,
      firstTimestamp: wordTimestamps[0]?.word,
      firstPlainWord: plainWords[0],
      lastTimestamp: wordTimestamps[wordTimestamps.length - 1]?.word,
      lastPlainWord: plainWords[plainWords.length - 1]
    });
    
    // Mapa: índice no texto renderizado -> índice no array de timestamps
    const map = new Map<number, number>();
    let timestampIndex = 0;
    
    plainWords.forEach((plainWord, plainIndex) => {
      if (timestampIndex < wordTimestamps.length) {
        // Normaliza ambas as palavras para comparação
        const normalizedPlain = plainWord.toLowerCase().replace(/[.,!?;:]/g, '');
        const normalizedTimestamp = wordTimestamps[timestampIndex].word.toLowerCase().replace(/[.,!?;:]/g, '');
        
        if (normalizedPlain === normalizedTimestamp || normalizedPlain.includes(normalizedTimestamp)) {
          map.set(plainIndex, timestampIndex);
          timestampIndex++;
        }
      }
    });
    
    return map;
  }, [content, wordTimestamps]);
  
  // Índice global que será resetado a cada render
  let globalWordIndex = 0;

  // Encontrar palavra ativa usando currentTime diretamente
  const activeTimestampIndex = wordTimestamps.findIndex(
    (wt) => currentTime >= wt.start && currentTime < wt.end
  );

  // Se não encontrou, usar a última palavra antes do tempo atual
  const effectiveTimestampIndex = activeTimestampIndex >= 0 
    ? activeTimestampIndex 
    : wordTimestamps.findIndex((wt, idx) => {
        const nextWord = wordTimestamps[idx + 1];
        return currentTime >= wt.end && (!nextWord || currentTime < nextWord.start);
      });

  // Encontrar índice da palavra renderizada correspondente ao timestamp ativo
  const activeRenderIndex = useMemo(() => {
    if (effectiveTimestampIndex < 0) return -1;
    
    // Procura qual índice renderizado mapeia para este timestamp
    for (const [renderIdx, timestampIdx] of wordMap.entries()) {
      if (timestampIdx === effectiveTimestampIndex) {
        return renderIdx;
      }
    }
    return -1;
  }, [effectiveTimestampIndex, wordMap]);

  // Log de debug
  useEffect(() => {
    if (isActive && effectiveTimestampIndex >= 0) {
      const activeWord = wordTimestamps[effectiveTimestampIndex];
      
      console.log(`🎤 [${currentTime.toFixed(2)}s]`, {
        palavra: activeWord?.word,
        timestampIdx: effectiveTimestampIndex,
        renderIdx: activeRenderIndex,
        wordStart: activeWord?.start.toFixed(2),
        wordEnd: activeWord?.end.toFixed(2),
      });
    }
  }, [effectiveTimestampIndex, isActive]);

  // Scroll automático para palavra ativa
  useEffect(() => {
    if (activeRenderIndex >= 0 && isActive) {
      const wordElement = wordRefs.current.get(activeRenderIndex);
      if (wordElement) {
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeRenderIndex, isActive]);

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

      const isCurrentWord = currentWordIndex === activeRenderIndex;
      const isPastWord = activeRenderIndex >= 0 && currentWordIndex < activeRenderIndex;

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
