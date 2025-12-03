'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, Send, Bot, User } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectPlaygroundChat - "Playground de IA / Chat com IA"
 *
 * Efeito cinematografico:
 * 1. Interface de chat moderna aparece com animacao suave
 * 2. Mensagem do usuario aparece digitando
 * 3. IA responde com typing indicator e depois mensagem
 * 4. Bolhas de chat aparecem em sequencia
 * 5. Brilhos e particulas indicam a IA trabalhando
 * 6. Loop continuo com diferentes mensagens
 *
 * MELHORIAS V5:
 * - isActive: animacao so inicia quando card esta em foco
 * - Duracoes 2-2.5x mais lentas para melhor experiencia
 * - Loop continuo enquanto ativo
 */
export const CardEffectPlaygroundChat: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'user-typing' | 'user-sent' | 'ai-typing' | 'ai-response' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const conversations = [
    {
      user: "Me ajude a criar um plano de negocios",
      ai: "Claro! Vou estruturar um plano completo para voce. Qual e o seu nicho de mercado?"
    },
    {
      user: "Escreva um email profissional",
      ai: "Perfeito! Criando um email persuasivo e profissional para voce..."
    },
    {
      user: "Analise esses dados de vendas",
      ai: "Analisando os dados... Identifiquei 3 oportunidades de crescimento!"
    }
  ];

  const currentConvo = conversations[loopCount % conversations.length];

  // Funcao para iniciar a sequencia de animacao
  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setPhase('enter');

    const ENTER_DELAY = 800;
    const USER_TYPING_DELAY = 1500;
    const USER_SENT_DELAY = 3500;
    const AI_TYPING_DELAY = 4500;
    const AI_RESPONSE_DELAY = 6500;
    const COMPLETE_DELAY = 9000;
    const LOOP_DELAY = 12000;

    timersRef.current.push(setTimeout(() => setPhase('user-typing'), USER_TYPING_DELAY));
    timersRef.current.push(setTimeout(() => setPhase('user-sent'), USER_SENT_DELAY));
    timersRef.current.push(setTimeout(() => setPhase('ai-typing'), AI_TYPING_DELAY));
    timersRef.current.push(setTimeout(() => setPhase('ai-response'), AI_RESPONSE_DELAY));
    timersRef.current.push(setTimeout(() => setPhase('complete'), COMPLETE_DELAY));

    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
    }, LOOP_DELAY));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('waiting');
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isAnimating
            ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)'
            : 'transparent'
        }}
        transition={{ duration: 1 }}
      />

      {/* Particulas flutuantes */}
      {isAnimating && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Chat Container */}
      <motion.div
        className="absolute inset-4 sm:inset-8 bg-slate-900/80 rounded-2xl border border-emerald-500/20 backdrop-blur-sm overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: isAnimating ? 1 : 0.9,
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        {/* Header do Chat */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center"
            animate={isAnimating ? {
              boxShadow: ['0 0 0 rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.4)', '0 0 0 rgba(16, 185, 129, 0)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">Playground I.A.</h3>
            <div className="flex items-center gap-1">
              <motion.div
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                animate={isAnimating ? { opacity: [1, 0.5, 1] } : { opacity: 0.5 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] text-emerald-400">Online</span>
            </div>
          </div>
          <div className="ml-auto">
            <Sparkles className="w-4 h-4 text-emerald-400/60" />
          </div>
        </div>

        {/* Area de Mensagens */}
        <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-hidden">
          {/* Mensagem do Usuario */}
          <AnimatePresence>
            {(phase === 'user-typing' || phase === 'user-sent' || phase === 'ai-typing' || phase === 'ai-response' || phase === 'complete') && (
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  <motion.div
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl rounded-br-md"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {phase === 'user-typing' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs sm:text-sm text-emerald-200">Digitando</span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ...
                        </motion.span>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-emerald-100">{currentConvo.user}</p>
                    )}
                  </motion.div>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resposta da IA */}
          <AnimatePresence>
            {(phase === 'ai-typing' || phase === 'ai-response' || phase === 'complete') && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  <motion.div
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0"
                    animate={phase === 'ai-typing' ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 0.8, repeat: phase === 'ai-typing' ? Infinity : 0 }}
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                  <motion.div
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {phase === 'ai-typing' ? (
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-200">{currentConvo.ai}</p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 bg-slate-800/30 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <motion.div
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs sm:text-sm text-slate-400"
              animate={isAnimating ? {
                borderColor: ['rgba(100, 116, 139, 0.5)', 'rgba(16, 185, 129, 0.3)', 'rgba(100, 116, 139, 0.5)']
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Digite sua mensagem...
            </motion.div>
            <motion.button
              className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center"
              animate={isAnimating && phase === 'complete' ? {
                scale: [1, 1.1, 1],
                borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.3)']
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Badge "Sua vez de praticar" */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="text-[10px] sm:text-xs text-emerald-300 font-medium">Sua vez de praticar!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardEffectPlaygroundChat;
