// src/components/lessons/v7/CodeEditor.tsx
// Code editor component for V7 lessons

import { useEffect, useRef } from 'react';
import { EditorAnnotation } from '@/types/v7-cinematic.types';

interface CodeEditorProps {
  code: string;
  language: string;
  readOnly: boolean;
  onChange?: (code: string) => void;
  highlightLines?: number[];
  annotations?: EditorAnnotation[];
  theme?: string;
}

export const CodeEditor = ({
  code,
  language,
  readOnly,
  onChange,
  highlightLines = [],
  annotations = [],
  theme = 'dark',
}: CodeEditorProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // ============================================================================
  // SYNTAX HIGHLIGHTING
  // ============================================================================

  const highlightCode = (code: string, language: string): string => {
    // Simple syntax highlighting (in production, use a proper library like Prism or Monaco)
    // This is a basic implementation for demonstration

    let highlighted = code;

    // JavaScript/TypeScript keywords
    if (language === 'javascript' || language === 'typescript') {
      const keywords = [
        'const',
        'let',
        'var',
        'function',
        'return',
        'if',
        'else',
        'for',
        'while',
        'class',
        'import',
        'export',
        'default',
        'async',
        'await',
        'try',
        'catch',
      ];

      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(
          regex,
          `<span class="text-purple-400 font-semibold">${keyword}</span>`
        );
      });

      // Strings
      highlighted = highlighted.replace(
        /(['"`])(?:(?=(\\?))\2.)*?\1/g,
        '<span class="text-green-400">$&</span>'
      );

      // Comments
      highlighted = highlighted.replace(
        /\/\/.*/g,
        '<span class="text-gray-500 italic">$&</span>'
      );

      // Numbers
      highlighted = highlighted.replace(
        /\b\d+\b/g,
        '<span class="text-yellow-400">$&</span>'
      );

      // Functions
      highlighted = highlighted.replace(
        /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
        '<span class="text-blue-400">$1</span>('
      );
    }

    return highlighted;
  };

  // ============================================================================
  // LINE NUMBERS
  // ============================================================================

  const renderLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, idx) => {
      const lineNum = idx + 1;
      const isHighlighted = highlightLines.includes(lineNum);

      return (
        <div
          key={lineNum}
          className={`line-number text-right pr-4 ${
            isHighlighted ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-600'
          }`}
        >
          {lineNum}
        </div>
      );
    });
  };

  // ============================================================================
  // ANNOTATIONS
  // ============================================================================

  const renderAnnotations = () => {
    return annotations.map((annotation) => {
      const colors = {
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        success: 'bg-green-500',
      };

      const lineHeight = 24; // Approximate line height in pixels
      const top = (annotation.line - 1) * lineHeight;

      return (
        <div
          key={`${annotation.line}-${annotation.type}`}
          className="absolute right-0 z-10 group"
          style={{ top: `${top}px` }}
        >
          <div className={`w-2 h-2 rounded-full ${colors[annotation.type]}`} />
          <div className="hidden group-hover:block absolute left-4 top-0 bg-gray-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
            {annotation.text}
          </div>
        </div>
      );
    });
  };

  // ============================================================================
  // SYNC SCROLL
  // ============================================================================

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // ============================================================================
  // HANDLE CHANGE
  // ============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange && !readOnly) {
      onChange(e.target.value);
    }
  };

  // ============================================================================
  // HANDLE TAB KEY
  // ============================================================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);

      if (onChange) {
        onChange(newValue);
      }

      // Set cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="code-editor relative h-full bg-gray-950 overflow-hidden">
      <div className="flex h-full">
        {/* Line numbers */}
        <div className="line-numbers bg-gray-900 text-xs font-mono py-4 select-none overflow-hidden">
          {renderLineNumbers()}
        </div>

        {/* Editor container */}
        <div className="editor-container relative flex-1 overflow-auto">
          {/* Syntax-highlighted code (background) */}
          <pre
            ref={preRef}
            className="absolute inset-0 p-4 text-sm font-mono text-gray-300 pointer-events-none overflow-auto whitespace-pre-wrap break-words"
            style={{ scrollBehavior: 'auto' }}
          >
            <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
          </pre>

          {/* Editable textarea (foreground, transparent) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
            className="relative w-full h-full p-4 text-sm font-mono bg-transparent text-transparent caret-white resize-none outline-none overflow-auto whitespace-pre-wrap break-words"
            style={{
              caretColor: 'white',
              scrollBehavior: 'auto',
            }}
          />

          {/* Annotations */}
          {annotations.length > 0 && (
            <div className="absolute top-4 right-4 pointer-events-auto">
              {renderAnnotations()}
            </div>
          )}

          {/* Read-only overlay */}
          {readOnly && (
            <div className="absolute top-2 right-2 bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
              Read-only
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
