import React, { useState, useRef, useEffect } from 'react';
import type { V10Liv, V10Warning } from '../../../../types/v10.types';

export interface LivChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LIVSheetProps {
  isOpen: boolean;
  onClose: () => void;
  liv: V10Liv;
  warnings: V10Warning | null;
  onAskLiv: (question: string) => void;
  chatMessages: LivChatMessage[];
  chatLoading: boolean;
  chatLimitReached?: boolean;
}

type OptionKey = 'tip' | 'analogy' | 'sos' | 'chat' | null;

interface OptionItem {
  key: OptionKey;
  icon: string;
  title: string;
  subtitle: string;
}

const OPTIONS: OptionItem[] = [
  {
    key: 'tip',
    icon: '\u{1F4A1}',
    title: 'Dica rápida',
    subtitle: 'Uma dica curta para este passo',
  },
  {
    key: 'analogy',
    icon: '\u{1F504}',
    title: 'Explica diferente',
    subtitle: 'Uma analogia para entender melhor',
  },
  {
    key: 'sos',
    icon: '\u{1F198}',
    title: 'SOS',
    subtitle: 'Ajuda detalhada para quando travar',
  },
  {
    key: 'chat',
    icon: '\u{1F4AC}',
    title: 'Perguntar à LIV',
    subtitle: 'Converse com a IA sobre este passo',
  },
];

const LIVSheet: React.FC<LIVSheetProps> = ({
  isOpen,
  onClose,
  liv,
  warnings,
  onAskLiv,
  chatMessages,
  chatLoading,
  chatLimitReached = false,
}) => {
  const [expanded, setExpanded] = useState<OptionKey>(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  const handleClose = () => {
    setExpanded(null);
    onClose();
  };

  const handleOptionClick = (key: OptionKey) => {
    setExpanded(key);
  };

  const handleSendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    onAskLiv(trimmed);
    setChatInput('');
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const getContent = (key: OptionKey): string => {
    switch (key) {
      case 'tip':
        return liv?.tip ?? '';
      case 'analogy':
        return liv?.analogy ?? '';
      case 'sos':
        return liv?.sos ?? '';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        display: isOpen ? 'flex' : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      className="fixed inset-0 z-50 flex-col justify-end"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="LIV Assistente"
    >
      {/* Sheet */}
      <div
        className="w-full max-w-[420px] mx-auto rounded-t-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#1E1B2E', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Title row */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <span className="text-xl">&#x1F916;</span>
          <span className="text-base font-bold text-white">LIV</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Ajuda
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Back button when expanded */}
          {expanded !== null && (
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="flex items-center gap-1.5 mb-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors min-h-[44px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Voltar</span>
            </button>
          )}

          {/* Option items or expanded content */}
          {expanded === null ? (
            <div className="flex flex-col gap-2">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleOptionClick(opt.key)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left min-h-[44px]"
                >
                  <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-lg">
                    {opt.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white">
                      {opt.title}
                    </span>
                    <span className="text-xs text-white/50">{opt.subtitle}</span>
                  </div>
                  <svg
                    className="shrink-0 ml-auto w-4 h-4 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          ) : expanded === 'chat' ? (
            /* Chat interface */
            <div className="flex flex-col gap-3">
              {/* Messages */}
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-white/40 text-center py-4">
                    Faça uma pergunta sobre este passo
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-500/30 text-white'
                          : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-xl px-3 py-2 text-sm text-white/50">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder={chatLimitReached ? 'Limite diário atingido' : 'Digite sua dúvida...'}
                  disabled={chatLimitReached}
                  className="flex-1 min-h-[44px] rounded-xl bg-white/10 border border-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={handleSendChat}
                  disabled={chatLoading || !chatInput.trim() || chatLimitReached}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-indigo-500 text-white disabled:opacity-40 transition-opacity"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-1 py-2 rounded-xl bg-white/5">
              <p className="text-sm text-white/80 leading-relaxed px-3 py-2">
                {getContent(expanded)}
              </p>
            </div>
          )}

          {/* Warnings section (always visible when not expanded) */}
          {expanded === null && warnings && (
            <div className="mt-4 flex flex-col gap-3">
              {/* Warning card */}
              {warnings.warn && (
                <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-amber-400 shrink-0 mt-0.5">&#x26A0;</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Aviso
                    </span>
                    <span className="text-sm text-white/70">
                      {warnings.warn}
                    </span>
                  </div>
                </div>
              )}

              {/* IF/THEN card */}
              {warnings.ift && (
                <div className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    {warnings.ift.tag}
                  </span>
                  <p className="text-sm text-white/70">{warnings.ift.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      Ação:
                    </span>
                    <span className="text-xs text-white/60">
                      {warnings.ift.act}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LIVSheet;
