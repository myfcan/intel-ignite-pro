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
    // Mostra texto completo instantaneamente - sem animação de digitação
    setDisplayedContent(content);
    setIsComplete(true);
  }, [content, isActive]);

  return (
    <div className={`prose prose-lg max-w-none transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-30 scale-[0.98]'}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-3">{children}</h4>
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
    </div>
  );
};
