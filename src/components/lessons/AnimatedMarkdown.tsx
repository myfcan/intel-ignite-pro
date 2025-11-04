import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface AnimatedMarkdownProps {
  content: string;
  isActive: boolean;
  speed?: number; // caracteres por segundo
}

export const AnimatedMarkdown = ({ content, isActive, speed = 50 }: AnimatedMarkdownProps) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      // Se não está ativo, mostra o conteúdo completo mas com opacidade reduzida
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    // Reset quando seção fica ativa
    setDisplayedContent('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= content.length) {
        setIsComplete(true);
        clearInterval(interval);
        return;
      }

      // Revelar caracteres gradualmente
      const chunkSize = Math.ceil(speed / 10); // Ajusta velocidade
      currentIndex = Math.min(currentIndex + chunkSize, content.length);
      setDisplayedContent(content.slice(0, currentIndex));
    }, 100);

    return () => clearInterval(interval);
  }, [content, isActive, speed]);

  return (
    <div className={`prose prose-lg max-w-none transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6 animate-fade-in">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4 animate-fade-in">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-3 animate-fade-in">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 flex items-start">
              <span className="mr-2">•</span>
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-4 bg-primary/5 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {!isComplete && isActive && (
        <span className="inline-block w-1 h-5 bg-primary animate-pulse ml-1" />
      )}
    </div>
  );
};
