import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { V10Liv, V10Warning } from '../../../../types/v10.types';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

export interface LivChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LIVSheetProps {
  isOpen: boolean;
  onClose: () => void;
  liv: V10Liv;
  warnings: V10Warning | null;
  frameTip: { text: string; position?: string } | null;
  frameAction: string | null;
  frameCheck: string | null;
  onAskLiv: (question: string) => void;
  chatMessages: LivChatMessage[];
  chatLoading: boolean;
  chatLimitReached?: boolean;
}

type OptionKey = 'warnings' | 'action' | 'tip' | 'check' | 'chat' | null;

interface OptionItem {
  key: NonNullable<OptionKey>;
  icon: string;
  title: string;
  subtitle: string;
  disabledSubtitle: string;
  hasContent: boolean;
}

const LIVSheet: React.FC<LIVSheetProps> = ({
  isOpen,
  onClose,
  liv,
  warnings,
  frameTip,
  frameAction,
  frameCheck,
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

  // OPTIONS built inside component so props are in scope
  const options: OptionItem[] = useMemo(() => [
    {
      key: 'warnings' as const,
      icon: '⚠️',
      title: 'Pontos de atenção',
      subtitle: 'Avisos e cuidados deste passo',
      disabledSubtitle: 'Nenhum conteúdo neste passo',
      hasContent: !!(warnings?.warn || warnings?.ift),
    },
    {
      key: 'action' as const,
      icon: '👆',
      title: 'O que fazer',
      subtitle: 'Instrução concreta do passo',
      disabledSubtitle: 'Nenhum conteúdo neste passo',
      hasContent: !!frameAction,
    },
    {
      key: 'tip' as const,
      icon: '💡',
      title: 'Dica',
      subtitle: 'Dica prática e explicação alternativa',
      disabledSubtitle: 'Nenhum conteúdo neste passo',
      hasContent: !!(frameTip?.text || liv?.tip),
    },
    {
      key: 'check' as const,
      icon: '✅',
      title: 'Como confirmar',
      subtitle: 'Como saber que deu certo',
      disabledSubtitle: 'Nenhum conteúdo neste passo',
      hasContent: !!frameCheck,
    },
    {
      key: 'chat' as const,
      icon: '💬',
      title: 'Perguntar à LIV',
      subtitle: 'Tire dúvidas com a assistente IA',
      disabledSubtitle: '',
      hasContent: true,
    },
  ], [warnings, frameAction, frameTip, liv, frameCheck]);

  const handleClose = () => {
    if (chatInput.trim() && !window.confirm('Você tem texto não enviado. Deseja fechar mesmo assim?')) {
      return;
    }
    setExpanded(null);
    onClose();
  };

  const handleSendChat = (text?: string) => {
    const trimmed = (text || chatInput).trim();
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

  const renderExpandedContent = () => {
    switch (expanded) {
      case 'warnings':
        return (
          <div className="flex flex-col gap-3">
            {warnings?.warn && (
              <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 shrink-0 mt-0.5">⚠️</span>
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
            {warnings?.ift && (
              <div className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  {warnings.ift.tag}
                </span>
                <p className="text-sm text-white/70">{warnings.ift.desc}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    →
                  </span>
                  <span className="text-xs text-white/60">
                    {warnings.ift.act}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="px-3 py-3 rounded-xl bg-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              👆 Faça agora
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              {frameAction}
            </p>
          </div>
        );

      case 'tip':
        return (
          <div className="flex flex-col gap-3">
            <div className="px-3 py-3 rounded-xl bg-white/5">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                💡 Dica
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                {frameTip?.text || liv?.tip}
              </p>
            </div>
            {liv?.analogy && (
              <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">
                  🔄 Explicando de outro jeito
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {liv.analogy}
                </p>
              </div>
            )}
          </div>
        );

      case 'check':
        return (
          <div className="px-3 py-3 rounded-xl bg-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              ✅ Deu certo se
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              {frameCheck}
            </p>
          </div>
        );

      case 'chat':
        return (
          <div className="flex flex-col gap-3">
            {/* SOS as suggested question (CORREÇÃO 1) */}
            {liv?.sos && chatMessages.length === 0 && (
              <button
                type="button"
                onClick={() => handleSendChat(liv.sos)}
                className="text-left px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
                  Sugestão de pergunta:
                </p>
                <p className="text-sm text-white/70 italic">
                  "{liv.sos}"
                </p>
              </button>
            )}

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
                onClick={() => handleSendChat()}
                disabled={chatLoading || !chatInput.trim() || chatLimitReached}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-indigo-500 text-white disabled:opacity-40 transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DrawerContent
        className="border-t border-indigo-500/30 max-h-[80vh] mx-auto max-w-[420px] md:max-w-[680px]"
        style={{ backgroundColor: '#1E1B2E' }}
      >
        {/* Title row */}
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <span className="text-xl">🤖</span>
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
              {options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => opt.hasContent && setExpanded(opt.key)}
                  disabled={!opt.hasContent}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left min-h-[44px] transition-colors ${
                    opt.hasContent
                      ? 'bg-white/5 hover:bg-white/10 cursor-pointer'
                      : 'bg-white/[0.02] opacity-30 cursor-default'
                  }`}
                >
                  <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-lg">
                    {opt.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white">
                      {opt.title}
                    </span>
                    <span className="text-xs text-white/50">
                      {opt.hasContent ? opt.subtitle : opt.disabledSubtitle}
                    </span>
                  </div>
                  {opt.hasContent && (
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
                  )}
                </button>
              ))}
            </div>
          ) : (
            renderExpandedContent()
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LIVSheet;
