import React from 'react';

interface CodeBlockProps {
  language: string;
  content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, content }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0F172A] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{language}</span>
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
