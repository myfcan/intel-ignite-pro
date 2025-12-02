'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Check, X } from 'lucide-react';

/**
 * CardEffectStrategicAdvisor - "Conselho estratégico de bolso"
 *
 * Efeito cinematográfico:
 * 1. Três painéis verticais surgem com slide-in (Conservador, Realista, Agressivo)
 * 2. Gráficos de barras/linhas se desenham em tempo real
 * 3. Números de projeção aparecem com flash
 * 4. Ícones de "Prós" e "Contras" surgem em linhas alternadas
 * 5. Um painel recebe destaque (melhor escolha) com brilho azul
 */
export const CardEffectStrategicAdvisor: React.FC = () => {
  const [phase, setPhase] = useState<'enter' | 'graphs' | 'metrics' | 'highlight' | 'complete'>('enter');
  const [visiblePanels, setVisiblePanels] = useState(0);
  const [showGraphs, setShowGraphs] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [highlightedPanel, setHighlightedPanel] = useState(-1);

  const scenarios = [
    {
      id: 1,
      name: 'Conservador',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      growth: '+15%',
      bars: [30, 35, 40, 42, 45],
      pros: ['Baixo risco', 'Previsível'],
      cons: ['Crescimento lento'],
    },
    {
      id: 2,
      name: 'Realista',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      growth: '+35%',
      bars: [25, 40, 55, 65, 75],
      pros: ['Equilibrado', 'Sustentável'],
      cons: ['Risco moderado'],
      recommended: true,
    },
    {
      id: 3,
      name: 'Agressivo',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      growth: '+80%',
      bars: [20, 45, 70, 60, 90],
      pros: ['Alto retorno'],
      cons: ['Risco elevado', 'Volátil'],
    },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Painéis aparecem
    scenarios.forEach((_, i) => {
      timers.push(setTimeout(() => setVisiblePanels(i + 1), 300 + i * 200));
    });

    // Gráficos desenham
    timers.push(setTimeout(() => {
      setPhase('graphs');
      setShowGraphs(true);
    }, 1000));

    // Métricas aparecem
    timers.push(setTimeout(() => {
      setPhase('metrics');
      setShowMetrics(true);
    }, 2200));

    // Highlight no recomendado
    timers.push(setTimeout(() => {
      setPhase('highlight');
      setHighlightedPanel(1); // Realista (índice 1)
    }, 3200));

    // Complete
    timers.push(setTimeout(() => setPhase('complete'), 4000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full h-72 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs text-slate-400 font-medium">Análise de Cenários</span>
      </motion.div>

      {/* Três painéis */}
      <div className="absolute inset-x-4 top-12 bottom-8 flex gap-3">
        {scenarios.map((scenario, i) => {
          const isVisible = visiblePanels > i;
          const isHighlighted = highlightedPanel === i;

          return (
            <motion.div
              key={scenario.id}
              className={`flex-1 rounded-xl border ${scenario.borderColor} ${scenario.bgColor} overflow-hidden relative`}
              initial={{
                x: i === 0 ? '-100%' : i === 2 ? '100%' : 0,
                opacity: 0,
              }}
              animate={{
                x: isVisible ? 0 : (i === 0 ? '-100%' : i === 2 ? '100%' : 0),
                opacity: isVisible ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              {/* Highlight glow */}
              {isHighlighted && (
                <motion.div
                  className="absolute inset-0 bg-purple-500/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Borda highlight */}
              {isHighlighted && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-purple-400/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Header do cenário */}
              <div className={`px-2 py-1.5 bg-gradient-to-r ${scenario.color} flex items-center justify-between`}>
                <span className="text-[10px] text-white font-bold">{scenario.name}</span>
                {scenario.recommended && (
                  <motion.span
                    className="text-[8px] bg-white/20 px-1 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: highlightedPanel === i ? 1 : 0 }}
                  >
                    Recomendado
                  </motion.span>
                )}
              </div>

              {/* Gráfico de barras */}
              <div className="px-2 py-2 h-20 flex items-end gap-1">
                {scenario.bars.map((height, barIdx) => (
                  <motion.div
                    key={barIdx}
                    className={`flex-1 bg-gradient-to-t ${scenario.color} rounded-t-sm`}
                    initial={{ height: 0 }}
                    animate={{ height: showGraphs ? `${height}%` : 0 }}
                    transition={{ delay: barIdx * 0.1, duration: 0.4, ease: 'easeOut' }}
                  />
                ))}
              </div>

              {/* Número de crescimento */}
              <motion.div
                className="px-2 flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: showMetrics ? 1 : 0, x: showMetrics ? 0 : -10 }}
              >
                <TrendingUp className="w-3 h-3 text-green-400" />
                <motion.span
                  className="text-sm font-bold text-white"
                  animate={showMetrics ? {
                    textShadow: ['0 0 0 transparent', '0 0 10px rgba(74, 222, 128, 0.5)', '0 0 0 transparent'],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {scenario.growth}
                </motion.span>
              </motion.div>

              {/* Prós e Contras */}
              <div className="px-2 py-1 space-y-0.5">
                {scenario.pros.map((pro, idx) => (
                  <motion.div
                    key={`pro-${idx}`}
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: showMetrics ? 1 : 0, x: showMetrics ? 0 : -5 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Check className="w-2.5 h-2.5 text-green-400" />
                    <span className="text-[8px] text-green-400">{pro}</span>
                  </motion.div>
                ))}
                {scenario.cons.map((con, idx) => (
                  <motion.div
                    key={`con-${idx}`}
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: showMetrics ? 1 : 0, x: showMetrics ? 0 : 5 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <X className="w-2.5 h-2.5 text-red-400" />
                    <span className="text-[8px] text-red-400">{con}</span>
                  </motion.div>
                ))}
              </div>

              {/* Badge de seleção */}
              {isHighlighted && (
                <motion.div
                  className="absolute bottom-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Label inferior */}
      <motion.div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-purple-300/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
      >
        Baseado em seus objetivos e perfil de risco
      </motion.div>
    </div>
  );
};

export default CardEffectStrategicAdvisor;
