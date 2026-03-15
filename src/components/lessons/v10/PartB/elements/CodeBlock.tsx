import React, { useState } from 'react';

interface CodeBlockProps {
  language: string;
  content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0F172A] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-0.5 rounded"
          aria-label="Copiar código"
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 bg-[#1E293B] overflow-x-auto">
        <code className="text-sm font-mono text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
