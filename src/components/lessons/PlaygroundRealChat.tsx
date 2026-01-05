import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PlaygroundRealChatProps {
  lessonId?: string;
  onComplete?: () => void;
  /** Callback para pular o playground sem completar */
  onSkip?: () => void;
  /** Prompt inicial a ser pré-preenchido no textarea */
  initialPrompt?: string;
}

export function PlaygroundRealChat({ lessonId, onComplete, onSkip, initialPrompt }: PlaygroundRealChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const [interactionsRemaining, setInteractionsRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  console.log('🎮 [PLAYGROUND-REAL-CHAT] Componente renderizado, initialPrompt:', initialPrompt);

  // Atualiza o input quando initialPrompt mudar
  useEffect(() => {
    if (initialPrompt && inputValue === '') {
      setInputValue(initialPrompt);
    }
  }, [initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('claude-interact', {
        body: {
          lesson_id: lessonId,
          message: userMessage.content,
          context_type: 'playground'
        }
      });

      if (error) throw error;

      if (data.limit_reached) {
        toast({
          title: 'Limite diário atingido',
          description: `Você usou todas as suas ${data.limit} interações hoje. Volte amanhã!`,
          variant: 'destructive'
        });
        setIsTyping(false);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setInteractionsRemaining(data.remaining);

      if (data.cached) {
        toast({
          title: '⚡ Resposta instantânea',
          description: 'Obtida do cache',
          duration: 2000
        });
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro ao comunicar com IA',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const promptSuggestions = [
    "💡 Reescreva de forma profissional",
    "🎯 Adicione contexto específico"
  ];

  return (
    <>
      {/* Interface Glassmorphism - FULLSCREEN */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
        }}
      >
        {/* Background decorativo com blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative flex flex-col h-full">
          {/* Header do Chat - Glassmorphism */}
          <div className="flex items-center justify-between px-6 py-4 
            bg-white/5 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 
                flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white/90">Assistente IA</h4>
                <p className="text-xs text-emerald-400/80 flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-current animate-pulse" />
                  Online e pronto
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {interactionsRemaining !== null && (
                <div className="text-xs text-white/50 bg-white/5 backdrop-blur-sm 
                  px-3 py-1.5 rounded-lg border border-white/10">
                  {interactionsRemaining} interações restantes
                </div>
              )}
              {(onComplete || onSkip) && (
                <button
                  onClick={onSkip || onComplete}
                  className="text-white/60 hover:text-white transition-all text-sm font-medium 
                    px-4 py-2 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent
                    hover:border-white/10"
                >
                  Pular →
                </button>
              )}
            </div>
          </div>

          {/* Área de Mensagens - Glassmorphism */}
          <div className="flex-1 p-6 overflow-y-auto 
            scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 
                  backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto mb-6
                  shadow-lg shadow-violet-500/10">
                  <Bot className="w-10 h-10 text-violet-300" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">Comece a conversa</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Experimente criar algo usando IA! Envie seu primeiro prompt ou use uma sugestão abaixo.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3.5 backdrop-blur-md
                          ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-violet-500/80 to-purple-600/80 text-white rounded-br-md shadow-lg shadow-violet-500/20'
                            : 'bg-white/10 text-white/90 border border-white/15 rounded-bl-md'
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] opacity-40 mt-2 block">
                          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator - Glassmorphism */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 
                      rounded-2xl rounded-bl-md px-5 py-4">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2.5 h-2.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2.5 h-2.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Glassmorphism */}
          <div className="px-6 py-5 border-t border-white/10 bg-white/5 backdrop-blur-xl flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  className="w-full bg-white/10 backdrop-blur-md text-white rounded-2xl 
                    px-5 py-4 pr-20 resize-none border border-white/20
                    focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:outline-none 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder:text-white/30 transition-all duration-200"
                  placeholder="Digite seu prompt aqui... Ex: 'Crie 3 ideias de posts sobre...'"
                  rows={3}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={inputValue.trim().length > 7 && !isTyping ? {
                    boxShadow: [
                      '0 0 0 0 rgba(139, 92, 246, 0)',
                      '0 0 25px 10px rgba(139, 92, 246, 0.4)',
                      '0 0 0 0 rgba(139, 92, 246, 0)'
                    ]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-xl 
                    bg-gradient-to-br from-violet-500 to-purple-600 
                    hover:from-violet-400 hover:to-purple-500
                    text-white flex items-center justify-center 
                    transition-all disabled:opacity-40 disabled:cursor-not-allowed 
                    shadow-lg shadow-violet-500/30 disabled:shadow-none"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>

              {/* Sugestões de Prompt - Glassmorphism */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex flex-wrap gap-2 justify-center"
                >
                  {promptSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputValue(suggestion.replace(/^[^\s]+\s/, ''))}
                      className="text-sm px-4 py-2 rounded-xl 
                        bg-white/5 backdrop-blur-sm text-white/60 
                        hover:bg-white/10 hover:text-white/80
                        transition-all duration-200 border border-white/10 hover:border-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}