import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { WordTimestamp } from '@/types/guidedLesson';

interface SyncedTextProps {
  content: string;
  isActive: boolean;
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  sectionStartTime?: number; // Tempo de início da seção para ajustar sincronização
}

export const SyncedText = ({ content, isActive, wordTimestamps, currentTime, sectionStartTime = 0 }: SyncedTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  
  // Índice global que será resetado a cada render
  let globalWordIndex = 0;

  // Como os timestamps já vêm normalizados do GuidedLesson, usamos currentTime diretamente
  const adjustedTime = currentTime;

  // Encontrar índice da palavra ativa (palavra atual sendo falada)
  const activeWordIndex = wordTimestamps.findIndex(
    (wt) => adjustedTime >= wt.start && adjustedTime < wt.end
  );

  // Se não encontrou palavra ativa, usar a última palavra antes do tempo atual
  const effectiveActiveIndex = activeWordIndex >= 0 
    ? activeWordIndex 
    : wordTimestamps.findIndex((wt, idx) => {
        const nextWord = wordTimestamps[idx + 1];
        return adjustedTime >= wt.end && (!nextWord || adjustedTime < nextWord.start);
      });

  // Log de debug a cada 2 segundos (aproximadamente)
  useEffect(() => {
    if (isActive && Math.floor(adjustedTime) % 2 === 0) {
      const activeWord = wordTimestamps[effectiveActiveIndex];
      console.log(`🎤 Karaoke:`, {
        adjustedTime: adjustedTime.toFixed(2),
        effectiveActiveIndex,
        activeWord: activeWord?.word,
        wordStart: activeWord?.start.toFixed(2),
        wordEnd: activeWord?.end.toFixed(2)
      });
    }
  }, [Math.floor(adjustedTime)]);

  // Scroll automático para palavra ativa
  useEffect(() => {
    if (effectiveActiveIndex >= 0 && isActive) {
      const wordElement = wordRefs.current.get(effectiveActiveIndex);
      if (wordElement) {
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [effectiveActiveIndex, isActive]);

  // Processar markdown para adicionar spans nas palavras
  const processTextWithSpans = (text: string) => {
    const words = text.split(/(\s+)/); // Mantém os espaços

    return words.map((segment, i) => {
      // Se for espaço, retorna como está
      if (/^\s+$/.test(segment)) {
        return <span key={i}>{segment}</span>;
      }

      const currentWordIndex = globalWordIndex;
      globalWordIndex++;

      const isCurrentWord = currentWordIndex === effectiveActiveIndex;
      const isPastWord = effectiveActiveIndex >= 0 && currentWordIndex < effectiveActiveIndex;

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
