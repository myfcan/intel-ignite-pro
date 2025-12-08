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
  /** Prompt inicial a ser pré-preenchido no textarea */
  initialPrompt?: string;
}

export function PlaygroundRealChat({ lessonId, onComplete, initialPrompt }: PlaygroundRealChatProps) {
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
      {/* Interface tipo ChatGPT - FULLSCREEN */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-gray-950"
      >
        <div className="flex flex-col h-full">
          {/* Header do Chat */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Assistente IA</h4>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-current animate-pulse" />
                  Online e pronto
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {interactionsRemaining !== null && (
                <div className="text-xs text-gray-400">
                  {interactionsRemaining} interações restantes
                </div>
              )}
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-700"
                >
                  Pular →
                </button>
              )}
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Envie seu primeiro prompt...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Experimente criar algo usando IA!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-gray-700 flex-shrink-0">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-20 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
                placeholder="Digite seu prompt aqui... Ex: 'Crie 3 ideias de posts sobre...'"
                rows={3}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="absolute bottom-3 right-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Sugestões de Prompt */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 flex flex-wrap gap-2"
              >
                {promptSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(suggestion.replace(/^[^\s]+\s/, ''))}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}