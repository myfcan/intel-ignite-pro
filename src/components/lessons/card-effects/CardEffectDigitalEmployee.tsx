'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, FileText, CheckCircle, Bot, Send } from 'lucide-react';

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
 */
export const CardEffectDigitalEmployee: React.FC = () => {
  const [phase, setPhase] = useState<'enter' | 'active' | 'idle'>('enter');
  const [processedItems, setProcessedItems] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; text: string; x: number }[]>([]);

  // Itens que serão processados
  const incomingItems = [
    { id: 1, icon: MessageCircle, type: 'Chat', color: 'bg-blue-500' },
    { id: 2, icon: Mail, type: 'Email', color: 'bg-pink-500' },
    { id: 3, icon: FileText, type: 'Formulário', color: 'bg-purple-500' },
    { id: 4, icon: MessageCircle, type: 'Chat', color: 'bg-cyan-500' },
    { id: 5, icon: Mail, type: 'Email', color: 'bg-orange-500' },
  ];

  const notificationTexts = ['Resolvido ✓', 'Respondido', 'Atualizado', 'Enviado ✓', 'Processado'];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Fase entrada
    timers.push(setTimeout(() => setPhase('active'), 600));

    // Processar itens um a um
    incomingItems.forEach((item, i) => {
      timers.push(setTimeout(() => {
        setProcessedItems(prev => [...prev, item.id]);
        // Adicionar notificação
        setNotifications(prev => [
          ...prev,
          { id: Date.now() + i, text: notificationTexts[i % notificationTexts.length], x: 30 + Math.random() * 40 }
        ]);
      }, 1200 + i * 600));
    });

    // Fase idle
    timers.push(setTimeout(() => setPhase('idle'), 4500));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Loop de notificações no idle
  useEffect(() => {
    if (phase !== 'idle') return;

    const interval = setInterval(() => {
      setNotifications(prev => [
        ...prev.slice(-3),
        { id: Date.now(), text: notificationTexts[Math.floor(Math.random() * notificationTexts.length)], x: 30 + Math.random() * 40 }
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, [phase]);

  // Teclas do teclado que vão piscar
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="relative w-full h-72 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
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
        className="absolute inset-x-4 bottom-4 top-4 bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header do dashboard */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Central de Operações</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>

        {/* Conteúdo - 3 colunas + robô */}
        <div className="flex h-[calc(100%-36px)]">
          {/* Coluna 1: Entrada */}
          <div className="flex-1 border-r border-slate-700/30 p-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">Entrada</div>
            <div className="space-y-1.5 relative h-32 overflow-hidden">
              {incomingItems.map((item, i) => {
                const Icon = item.icon;
                const isProcessed = processedItems.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${item.color}/20 border border-slate-600/30`}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{
                      y: isProcessed ? 100 : 0,
                      opacity: isProcessed ? 0 : 1,
                      x: isProcessed ? 50 : 0,
                    }}
                    transition={{
                      y: { delay: i * 0.15, duration: 0.4, ease: 'easeOut' },
                      opacity: { duration: 0.2 },
                      x: { duration: 0.3 },
                    }}
                  >
                    <Icon className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] text-slate-400">{item.type}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Coluna 2: Robô processando */}
          <div className="w-28 border-r border-slate-700/30 p-2 flex flex-col items-center justify-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Agente IA</div>

            {/* Avatar do robô */}
            <motion.div
              className="relative"
              animate={phase === 'active' ? { y: [0, -2, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {/* Glow */}
              <motion.div
                className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* Robô */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />

                {/* Olhinhos */}
                <motion.div
                  className="absolute top-2.5 left-2.5 flex gap-1"
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <div className="w-1.5 h-2 bg-white rounded-full" />
                  <div className="w-1.5 h-2 bg-white rounded-full" />
                </motion.div>
              </div>
            </motion.div>

            {/* Mini teclado */}
            <div className="mt-2 space-y-0.5">
              {keyboardRows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-0.5">
                  {row.map((key, keyIdx) => (
                    <motion.div
                      key={key}
                      className="w-2 h-2 bg-slate-700 rounded-[2px] flex items-center justify-center"
                      animate={phase === 'active' ? {
                        backgroundColor: ['#334155', '#06b6d4', '#334155'],
                      } : {}}
                      transition={{
                        duration: 0.15,
                        delay: (rowIdx * 10 + keyIdx) * 0.05 % 0.8,
                        repeat: phase === 'active' ? Infinity : 0,
                        repeatDelay: 0.3,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Resolvido */}
          <div className="flex-1 p-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">Resolvido</div>
            <div className="space-y-1.5 h-32 overflow-hidden">
              <AnimatePresence>
                {processedItems.map((id, i) => {
                  const item = incomingItems.find(it => it.id === id);
                  if (!item) return null;
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={`resolved-${id}`}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/30"
                      initial={{ x: -30, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                      >
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      </motion.div>
                      <Icon className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] text-green-400">{item.type}</span>

                      {/* Flash verde */}
                      <motion.div
                        className="absolute inset-0 bg-green-400/30 rounded-lg"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
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
              className="absolute px-2 py-0.5 bg-slate-800/80 backdrop-blur-sm rounded-full border border-cyan-500/30 text-[9px] text-cyan-300"
              style={{ left: `${notif.x}%` }}
              initial={{ bottom: 20, opacity: 0, scale: 0.8 }}
              animate={{ bottom: 180, opacity: [0, 1, 1, 0], scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              {notif.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className="absolute top-2 right-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[10px] text-green-400">Online 24/7</span>
      </motion.div>
    </div>
  );
};

export default CardEffectDigitalEmployee;
