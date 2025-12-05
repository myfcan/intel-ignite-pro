'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Terminal, Sparkles, Send, CheckCircle } from 'lucide-react';

interface CardEffectPlaygroundCreatorProps {
  isActive?: boolean;
}

export const CardEffectPlaygroundCreator: React.FC<CardEffectPlaygroundCreatorProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [typingText, setTypingText] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const promptText = 'Crie um currículo para designer...';
  const responseText = '✓ Currículo profissional criado!';

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1200),
    ];

    // Efeito de digitação
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < promptText.length) {
        setTypingText(promptText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowResponse(true), 800);
        setTimeout(() => setScene(3), 2500);
      }
    }, 80);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(typingInterval);
    };
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900/20 to-slate-900 border border-teal-500/30">
      {/* Background terminal */}
      <div className="absolute inset-0 opacity-10">
        <div className="font-mono text-[8px] text-teal-400 p-4 leading-relaxed overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="opacity-30">
              {'>'} prompt_execute --mode=creative
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Criador de Soluções</h3>
          <p className="text-[10px] text-teal-300">Pratique no Playground</p>
        </motion.div>

        {/* Ícone do Playground */}
        <motion.div
          className="mb-3"
          animate={{
            scale: scene >= 2 ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 1, repeat: scene >= 2 ? Infinity : 0 }}
        >
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-teal-300" />
          </div>
        </motion.div>

        {/* Simulação do Playground */}
        <motion.div
          className="w-full max-w-xs bg-slate-800/70 border border-teal-400/30 rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-teal-400/20 bg-slate-800/50">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <span className="text-[9px] text-teal-400 ml-2">Playground I.A.</span>
          </div>

          {/* Input area */}
          <div className="p-2">
            <div className="bg-slate-900/50 rounded-lg p-2 mb-2 min-h-[40px]">
              <div className="flex items-start gap-2">
                <span className="text-teal-400 text-[10px]">{'>'}</span>
                <span className="text-[10px] text-slate-300">
                  {typingText}
                  {scene >= 2 && typingText.length < promptText.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-teal-400"
                    >
                      |
                    </motion.span>
                  )}
                </span>
              </div>
            </div>

            {/* Response area */}
            <AnimatePresence>
              {showResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-teal-500/10 border border-teal-400/30 rounded-lg p-2"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-[10px] text-teal-300">{responseText}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-teal-400/20 bg-slate-800/50">
            <span className="text-[8px] text-slate-500">Prompt prático</span>
            <motion.div
              className="flex items-center gap-1 text-teal-400"
              animate={{
                scale: scene >= 2 ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: scene >= 2 ? 3 : 0 }}
            >
              <Send className="w-3 h-3" />
              <span className="text-[9px]">Enviar</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-lg px-3 py-1.5"
            >
              <Play className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-300 font-medium">
                Teste agora no Playground!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#14b8a6' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-teal-500/20 border border-teal-400/30 rounded-full px-2 py-0.5"
      >
        <Play className="w-3 h-3 text-teal-400" />
        <span className="text-[9px] text-teal-300 font-medium">Play</span>
      </motion.div>
    </div>
  );
};

export default CardEffectPlaygroundCreator;
