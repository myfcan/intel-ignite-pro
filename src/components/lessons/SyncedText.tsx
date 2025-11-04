import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { WordTimestamp } from '@/types/guidedLesson';

interface SyncedTextProps {
  content: string;
  isActive: boolean;
  wordTimestamps: WordTimestamp[];
  currentTime: number;
}

export const SyncedText = ({ content, isActive, wordTimestamps, currentTime }: SyncedTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // Encontrar índice da palavra ativa
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

  // Processar markdown para adicionar spans nas palavras
  const processTextWithSpans = (text: string) => {
    const words = text.split(/(\s+)/); // Mantém os espaços
    let wordIndex = 0;

    return words.map((segment, i) => {
      // Se for espaço, retorna como está
      if (/^\s+$/.test(segment)) {
        return <span key={i}>{segment}</span>;
      }

      const currentWordIndex = wordIndex;
      wordIndex++;

      const isCurrentWord = currentWordIndex === activeWordIndex;
      const isPastWord = currentWordIndex < activeWordIndex;

      return (
        <span
          key={i}
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
