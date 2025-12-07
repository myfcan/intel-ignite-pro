import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Volume2 } from 'lucide-react';

interface SyncedTextProps {
  content: string;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export const SyncedText = ({ content, isActive, isPast, isFuture }: SyncedTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll automático quando a seção fica ativa
  useEffect(() => {
    if (isActive && containerRef.current) {
      const yOffset = -60; // Reduzido para cards ficarem mais para cima na tela
      const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
      
      console.log(`📜 [SyncedText] Scroll para seção ativa: ${content.substring(0, 50)}...`);
    }
  }, [isActive, content]);

  return (
    <div
      ref={containerRef}
      data-testid="synced-text-section"
      data-is-active={isActive}
      data-is-past={isPast}
      data-is-future={isFuture}
      className={`
        relative transition-all duration-700 
        ${isActive ? 'opacity-100 scale-100' : ''}
        ${isPast ? 'opacity-60' : ''}
        ${isFuture ? 'opacity-40 blur-[1px]' : ''}
      `}
    >
      {/* Indicador visual de estado */}
      <div className="absolute -left-4 top-0 flex flex-col gap-2">
        {isPast && (
          <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-fade-in">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
        {isActive && (
          <div className="w-8 h-8 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center speech-indicator">
            <Volume2 className="w-4 h-4 text-cyan-400" />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className={`
        prose prose-invert max-w-none
        ${isActive ? 'prose-headings:text-cyan-400' : ''}
      `}>
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
