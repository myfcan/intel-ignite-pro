// src/components/lessons/v7/CodeEditor.tsx
// Code editor component for V7 lessons with Prism.js syntax highlighting

import { useEffect, useRef, useMemo } from 'react';
import { EditorAnnotation } from '@/types/v7-cinematic.types';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import '@/styles/prism-dark.css';

interface CodeEditorProps {
  code: string;
  language: string;
  readOnly: boolean;
  onChange?: (code: string) => void;
  highlightLines?: number[];
  annotations?: EditorAnnotation[];
  theme?: string;
}

// Map common language names to Prism grammar names
const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  md: 'markdown',
  sh: 'bash',
  shell: 'bash',
};

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
  // SYNTAX HIGHLIGHTING WITH PRISM.JS
  // ============================================================================

  const highlightedCode = useMemo(() => {
    const normalizedLang = languageMap[language] || language;
    const grammar = Prism.languages[normalizedLang] || Prism.languages.javascript;
    
    try {
      return Prism.highlight(code, grammar, normalizedLang);
    } catch (error) {
      console.warn('Prism highlighting failed, using plain text:', error);
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [code, language]);

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
            className="absolute inset-0 p-4 text-sm font-mono pointer-events-none overflow-auto whitespace-pre-wrap break-words prism-code"
            style={{ scrollBehavior: 'auto' }}
          >
            <code 
              className={`language-${languageMap[language] || language}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }} 
            />
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
