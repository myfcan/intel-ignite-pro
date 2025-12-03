'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, FileText, CheckCircle, Bot, Send } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectDigitalEmployee - "I.A. como funcionário digital"
 *
 * Efeito cinematográfico:
 * 1. Dashboard surge do rodapé com subida + fade-in
 * 2. Três colunas: Entrada, Processando, Resolvido
 * 3. Ícones de mensagens/emails caem em queda suave
 * 4. Ao tocar "agente digital", são encaminhados para "resolvido" com flash verde
 * 5. Avatar de robô clean digita em teclado (teclas piscam)
 * 6. Notificações "Resolvido", "Respondido" sobem em bolhas
 * 7. Após 3-4s, desacelera para loop suave
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectDigitalEmployee: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'active' | 'idle'>('waiting');
  const [processedItems, setProcessedItems] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; text: string; x: number }[]>([]);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Itens que serão processados
  const incomingItems = [
    { id: 1, icon: MessageCircle, type: 'Chat', color: 'bg-blue-500' },
    { id: 2, icon: Mail, type: 'Email', color: 'bg-pink-500' },
    { id: 3, icon: FileText, type: 'Formulário', color: 'bg-purple-500' },
    { id: 4, icon: MessageCircle, type: 'Chat', color: 'bg-cyan-500' },
    { id: 5, icon: Mail, type: 'Email', color: 'bg-orange-500' },
  ];

  const notificationTexts = ['Resolvido ✓', 'Respondido', 'Atualizado', 'Enviado ✓', 'Processado'];

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('enter');
    setProcessedItems([]);
    setNotifications([]);

    // Durações mais lentas (2.5x)
    const ENTER_DELAY = 1500;       // era 600ms
    const ITEM_DELAY = 1500;        // era 600ms
    const IDLE_DELAY = 11000;       // era 4500ms
    const LOOP_DELAY = 15000;       // tempo até reiniciar

    // Fase entrada
    timersRef.current.push(setTimeout(() => setPhase('active'), ENTER_DELAY));

    // Processar itens um a um (mais lento)
    incomingItems.forEach((item, i) => {
      timersRef.current.push(setTimeout(() => {
        setProcessedItems(prev => [...prev, item.id]);
        // Adicionar notificação
        setNotifications(prev => [
          ...prev,
          { id: Date.now() + i, text: notificationTexts[i % notificationTexts.length], x: 30 + Math.random() * 40 }
        ]);
      }, 3000 + i * ITEM_DELAY)); // era 1200 + i * 600
    });

    // Fase idle
    timersRef.current.push(setTimeout(() => setPhase('idle'), IDLE_DELAY));

    // 🔄 Loop: reiniciar animação após um tempo
    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
    }, LOOP_DELAY));
  };

  // 🎯 Iniciar animação quando isActive mudar para true
  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      // Parar e resetar quando não estiver ativo
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('waiting');
      setProcessedItems([]);
      setNotifications([]);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  // Loop de notificações no idle
  useEffect(() => {
    if (phase !== 'idle' || !isActive) return;

    const interval = setInterval(() => {
      setNotifications(prev => [
        ...prev.slice(-3),
        { id: Date.now(), text: notificationTexts[Math.floor(Math.random() * notificationTexts.length)], x: 30 + Math.random() * 40 }
      ]);
    }, 4000); // mais lento (era 3000)

    return () => clearInterval(interval);
  }, [phase, isActive]);

  // Teclas do teclado que vão piscar
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Dashboard Panel - surge do rodapé */}
      <motion.div
        className="absolute inset-x-6 bottom-6 top-6 bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{
          y: isAnimating ? 0 : '100%',
          opacity: isAnimating ? 1 : 0
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }} // mais lento (era 0.5)
      >
        {/* Header do dashboard */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400 font-medium">Central de Operações</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
        </div>

        {/* Conteúdo - 3 colunas + robô - MAIOR */}
        <div className="flex h-[calc(100%-52px)]">
          {/* Coluna 1: Entrada */}
          <div className="flex-1 border-r border-slate-700/30 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4 text-center">Entrada</div>
            <div className="space-y-3 relative h-64 overflow-hidden">
              {incomingItems.map((item, i) => {
                const Icon = item.icon;
                const isProcessed = processedItems.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl ${item.color}/20 border border-slate-600/30`}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{
                      y: isProcessed ? 100 : 0,
                      opacity: isProcessed ? 0 : (isAnimating ? 1 : 0),
                      x: isProcessed ? 50 : 0,
                    }}
                    transition={{
                      y: { delay: i * 0.3, duration: 0.8, ease: 'easeOut' }, // mais lento
                      opacity: { duration: 0.4 },
                      x: { duration: 0.6 },
                    }}
                  >
                    <Icon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-400">{item.type}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Coluna 2: Robô processando - MAIOR */}
          <div className="w-40 border-r border-slate-700/30 p-4 flex flex-col items-center justify-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Agente IA</div>

            {/* Avatar do robô - maior */}
            <motion.div
              className="relative"
              animate={phase === 'active' ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 1, repeat: Infinity }} // mais lento
            >
              {/* Glow */}
              <motion.div
                className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl"
                animate={{ opacity: isAnimating ? [0.2, 0.5, 0.2] : 0.1 }}
                transition={{ duration: 3, repeat: Infinity }} // mais lento
              />

              {/* Robô - maior */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />

                {/* Olhinhos */}
                <motion.div
                  className="absolute top-4 left-4 flex gap-2"
                  animate={isAnimating ? { scaleY: [1, 0.1, 1] } : {}}
                  transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 4 }} // mais lento
                >
                  <div className="w-2 h-3 bg-white rounded-full" />
                  <div className="w-2 h-3 bg-white rounded-full" />
                </motion.div>
              </div>
            </motion.div>

            {/* Mini teclado - maior */}
            <div className="mt-4 space-y-1">
              {keyboardRows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1">
                  {row.map((key, keyIdx) => (
                    <motion.div
                      key={key}
                      className="w-3 h-3 bg-slate-700 rounded-[3px] flex items-center justify-center"
                      animate={phase === 'active' ? {
                        backgroundColor: ['#334155', '#06b6d4', '#334155'],
                      } : {}}
                      transition={{
                        duration: 0.3, // mais lento (era 0.15)
                        delay: (rowIdx * 10 + keyIdx) * 0.08 % 1.2,
                        repeat: phase === 'active' ? Infinity : 0,
                        repeatDelay: 0.5,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Resolvido */}
          <div className="flex-1 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4 text-center">Resolvido</div>
            <div className="space-y-3 h-64 overflow-hidden">
              <AnimatePresence>
                {processedItems.map((id, i) => {
                  const item = incomingItems.find(it => it.id === id);
                  if (!item) return null;
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={`resolved-${id}`}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30"
                      initial={{ x: -30, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, type: 'spring' }} // mais lento
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </motion.div>
                      <Icon className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-green-400">{item.type}</span>

                      {/* Flash verde */}
                      <motion.div
                        className="absolute inset-0 bg-green-400/30 rounded-xl"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1 }} // mais lento
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Notificações subindo */}
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              className="absolute px-3 py-1 bg-slate-800/80 backdrop-blur-sm rounded-full border border-cyan-500/30 text-sm text-cyan-300"
              style={{ left: `${notif.x}%` }}
              initial={{ bottom: 30, opacity: 0, scale: 0.8 }}
              animate={{ bottom: 280, opacity: [0, 1, 1, 0], scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, ease: 'easeOut' }} // mais lento (era 2)
            >
              {notif.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className="absolute top-4 right-6 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0.3 }}
        transition={{ delay: isAnimating ? 1.5 : 0 }}
      >
        <motion.div
          className="w-3 h-3 bg-green-500 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }} // mais lento
        />
        <span className="text-sm text-green-400">Online 24/7</span>
      </motion.div>
    </div>
  );
};

export default CardEffectDigitalEmployee;
