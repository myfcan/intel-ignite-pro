import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PlaygroundRealChatProps {
  lessonId?: string;
  onComplete?: () => void;
}

export function PlaygroundRealChat({ lessonId, onComplete }: PlaygroundRealChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interactionsRemaining, setInteractionsRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    "📝 Crie 3 variações",
    "🎯 Adicione contexto específico"
  ];

  return (
    <div className="mt-12 relative">
      {/* Separador visual animado */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
          <span className="font-semibold text-purple-900 dark:text-purple-100">Hora de Praticar!</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
      </motion.div>

      {/* Interface tipo ChatGPT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Header do Chat - FORA do card escuro */}
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Assistente IA</h4>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <Circle className="w-2 h-2 fill-current" />
                Online e pronto
              </p>
            </div>
          </div>
          {interactionsRemaining !== null && (
            <div className="text-xs text-slate-600">
              {interactionsRemaining} interações restantes
            </div>
          )}
        </div>

        <Card className="bg-gray-950 border-gray-800 rounded-2xl p-6 shadow-2xl">
          {/* Área de Mensagens */}
          <div className="rounded-xl p-4 min-h-[300px] max-h-[500px] overflow-y-auto mb-4">
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
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 pr-12 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Digite seu prompt aqui... Ex: 'Crie 3 ideias de posts sobre...'"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Sugestões de Prompt */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {promptSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(suggestion.replace(/^[^\s]+\s/, ''))}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}