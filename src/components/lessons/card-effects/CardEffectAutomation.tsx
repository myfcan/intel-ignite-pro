'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Calendar, Mail, CheckCircle2, User } from 'lucide-react';

/**
 * CardEffectAutomation - "Fluxos de automação com I.A."
 *
 * Efeito cinematográfico:
 * 1. Fluxograma desenhado ao vivo a partir do ponto "Lead"
 * 2. Linhas se desdobram para: Mensagem, Qualificação, Agenda, Confirmação, Follow-up
 * 3. Cada caixa surge com "drop-in" e é preenchida pela I.A.
 * 4. Linhas se acendem com luz percorrendo o caminho
 * 5. Ícones aparecem sobre as caixas com fade-in
 * 6. Caixa final "Consulta marcada" cresce com halo verde
 */
export const CardEffectAutomation: React.FC = () => {
  const [visibleNodes, setVisibleNodes] = useState(0);
  const [activeConnection, setActiveConnection] = useState(-1);
  const [showFinalGlow, setShowFinalGlow] = useState(false);

  const flowNodes = [
    { id: 0, label: 'Lead', icon: User, x: 10, y: 45, color: 'from-blue-500 to-cyan-500' },
    { id: 1, label: 'Mensagem', icon: MessageCircle, x: 28, y: 25, color: 'from-purple-500 to-indigo-500' },
    { id: 2, label: 'Qualificação', icon: CheckCircle2, x: 28, y: 65, color: 'from-pink-500 to-rose-500' },
    { id: 3, label: 'Agenda', icon: Calendar, x: 50, y: 45, color: 'from-orange-500 to-amber-500' },
    { id: 4, label: 'Confirmação', icon: Mail, x: 72, y: 45, color: 'from-cyan-500 to-blue-500' },
    { id: 5, label: 'Consulta', icon: CheckCircle2, x: 90, y: 45, color: 'from-green-500 to-emerald-500', isFinal: true },
  ];

  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Nós aparecem um a um
    flowNodes.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleNodes(i + 1), 400 + i * 400));
    });

    // Conexões se iluminam
    connections.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveConnection(i), 800 + i * 350));
    });

    // Glow final
    timers.push(setTimeout(() => setShowFinalGlow(true), 3500));

    return () => timers.forEach(clearTimeout);
  }, []);

  const getNodePosition = (id: number) => {
    const node = flowNodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-72 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20">
      {/* Grid de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* SVG para conexões */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Linhas de conexão */}
        {connections.map((conn, i) => {
          const from = getNodePosition(conn.from);
          const to = getNodePosition(conn.to);
          const isActive = activeConnection >= i;

          return (
            <g key={i}>
              {/* Linha base */}
              <motion.path
                d={`M ${from.x}% ${from.y}% L ${to.x}% ${to.y}%`}
                stroke="rgba(100, 116, 139, 0.3)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Linha ativa */}
              <motion.path
                d={`M ${from.x}% ${from.y}% L ${to.x}% ${to.y}%`}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Pulso de energia */}
              {isActive && (
                <motion.circle
                  r="4"
                  fill="#10b981"
                  filter="url(#glow)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    cx: [`${from.x}%`, `${to.x}%`],
                    cy: [`${from.y}%`, `${to.y}%`],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: i * 0.2,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nós do fluxograma */}
      {flowNodes.map((node, i) => {
        const Icon = node.icon;
        const isVisible = visibleNodes > i;
        const isFinal = node.isFinal;

        return (
          <motion.div
            key={node.id}
            className="absolute"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0, y: -20 }}
            animate={{
              scale: isVisible ? 1 : 0,
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : -20,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            {/* Glow para nó final */}
            {isFinal && showFinalGlow && (
              <motion.div
                className="absolute inset-0 bg-green-500 rounded-xl blur-xl"
                initial={{ opacity: 0, scale: 1 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Caixa do nó */}
            <motion.div
              className={`relative px-3 py-2 bg-gradient-to-br ${node.color} rounded-xl shadow-lg flex flex-col items-center gap-1 ${
                isFinal ? 'scale-110' : ''
              }`}
              animate={isVisible ? {
                boxShadow: isFinal && showFinalGlow
                  ? ['0 0 0 rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.5)', '0 0 0 rgba(16, 185, 129, 0)']
                  : undefined,
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Efeito de preenchimento */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isVisible ? 1 : 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{ originX: 0 }}
              />

              {/* Ícone */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ delay: 0.3 }}
              >
                <Icon className="w-4 h-4 text-white" />
              </motion.div>

              {/* Label */}
              <span className="text-[9px] text-white font-medium whitespace-nowrap">{node.label}</span>

              {/* Badge para nó final */}
              {isFinal && showFinalGlow && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                >
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Label inferior */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-emerald-300/70 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
      >
        Fluxo automatizado ativo
      </motion.div>

      {/* Indicador de status */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[10px] text-green-400">Automação ativa</span>
      </motion.div>
    </div>
  );
};

export default CardEffectAutomation;
