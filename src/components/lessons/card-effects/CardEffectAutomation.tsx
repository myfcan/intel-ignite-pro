'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Calendar, Mail, CheckCircle2, User } from 'lucide-react';
import { CardEffectProps } from './index';

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
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2-2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectAutomation: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'active'>('waiting');
  const [visibleNodes, setVisibleNodes] = useState(0);
  const [activeConnection, setActiveConnection] = useState(-1);
  const [showFinalGlow, setShowFinalGlow] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

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

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('active');
    setVisibleNodes(0);
    setActiveConnection(-1);
    setShowFinalGlow(false);

    // Durações mais lentas (2-2.5x)
    const NODE_DELAY = 1000;        // era 400ms (2.5x)
    const CONNECTION_DELAY = 875;   // era 350ms (2.5x)
    const FINAL_GLOW_DELAY = 8750;  // era 3500ms (2.5x)
    const LOOP_DELAY = 12000;       // tempo até reiniciar

    // Nós aparecem um a um
    flowNodes.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleNodes(i + 1), NODE_DELAY + i * NODE_DELAY));
    });

    // Conexões se iluminam
    connections.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setActiveConnection(i), 2000 + i * CONNECTION_DELAY));
    });

    // Glow final
    timersRef.current.push(setTimeout(() => setShowFinalGlow(true), FINAL_GLOW_DELAY));

    // 🔄 Loop 2x: reiniciar animação apenas 2 vezes
    timersRef.current.push(setTimeout(() => {
      if (loopCount < 1) {
        setLoopCount(prev => prev + 1);
      }
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
      setVisibleNodes(0);
      setActiveConnection(-1);
      setShowFinalGlow(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  const getNodePosition = (id: number) => {
    const node = flowNodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20">
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
                  pathLength: isActive && isAnimating ? 1 : 0,
                  opacity: isActive && isAnimating ? 1 : 0,
                }}
                transition={{ duration: 0.75 }} // mais lento (era 0.3, 2.5x)
              />

              {/* Pulso de energia */}
              {isActive && isAnimating && (
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
                    duration: 2.5, // mais lento (era 1, 2.5x)
                    repeat: Infinity,
                    repeatDelay: 5, // mais lento (era 2, 2.5x)
                    delay: i * 0.5, // mais lento (era 0.2, 2.5x)
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
            {isFinal && showFinalGlow && isAnimating && (
              <motion.div
                className="absolute inset-0 bg-green-500 rounded-xl blur-xl"
                initial={{ opacity: 0, scale: 1 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 5, repeat: Infinity }} // mais lento (era 2, 2.5x)
              />
            )}

            {/* Caixa do nó */}
            <motion.div
              className={`relative px-3 py-2 bg-gradient-to-br ${node.color} rounded-xl shadow-lg flex flex-col items-center gap-1 ${
                isFinal ? 'scale-110' : ''
              }`}
              animate={isVisible && isAnimating ? {
                boxShadow: isFinal && showFinalGlow
                  ? ['0 0 0 rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.5)', '0 0 0 rgba(16, 185, 129, 0)']
                  : undefined,
              } : {}}
              transition={{ duration: 3.75, repeat: Infinity }} // mais lento (era 1.5, 2.5x)
            >
              {/* Efeito de preenchimento */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isVisible && isAnimating ? 1 : 0 }}
                transition={{ delay: 0.5, duration: 0.75 }} // mais lento (era 0.2 delay e 0.3 duration, 2.5x)
                style={{ originX: 0 }}
              />

              {/* Ícone */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible && isAnimating ? 1 : 0 }}
                transition={{ delay: 0.75 }} // mais lento (era 0.3, 2.5x)
              >
                <Icon className="w-4 h-4 text-white" />
              </motion.div>

              {/* Label */}
              <span className="text-[9px] text-white font-medium whitespace-nowrap">{node.label}</span>

              {/* Badge para nó final */}
              {isFinal && showFinalGlow && isAnimating && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.75 }} // mais lento (era 0.3, 2.5x)
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
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isAnimating ? 1 : 0.3, y: 0 }}
        transition={{ delay: isAnimating ? 8.75 : 0, duration: 1.25 }} // mais lento (era 3.5 delay, 2.5x)
      >
        <p className="text-base font-medium text-emerald-300/80">
          {phase === 'waiting' ? 'Aguardando...' : 'Fluxo automatizado ativo'}
        </p>
      </motion.div>

      {/* Indicador de status */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0.3 }}
        transition={{ delay: isAnimating ? 2.5 : 0 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ opacity: isAnimating ? [1, 0.5, 1] : 0.3 }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <span className="text-[10px] text-green-400">
          {phase === 'waiting' ? 'Aguardando ativação' : 'Automação ativa'}
        </span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              visibleNodes > i ? 'bg-emerald-400' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAutomation;
