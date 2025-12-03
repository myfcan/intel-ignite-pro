'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XCircle, AlertCircle } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectGenericDetector - Identifica texto genérico vs específico
 */
export const CardEffectGenericDetector: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'scan' | 'detect' | 'verdict' | 'complete'>('waiting');
  const [scanLine, setScanLine] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const genericText = "Vendo produtos de qualidade. Ótimo preço. Interessados chamar privado.";
  const problems = ["Genérico", "Sem emoção", "Qualquer um"];

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('scan');
    setScanLine(0);

    // Animate scan line
    for (let i = 0; i <= 100; i += 5) {
      timersRef.current.push(setTimeout(() => setScanLine(i), i * 20));
    }

    timersRef.current.push(setTimeout(() => setPhase('detect'), 2200));
    timersRef.current.push(setTimeout(() => setPhase('verdict'), 3500));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 5000));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
      setScanLine(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30">
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Scanner Icon */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                animate={phase === 'scan' ? { rotate: 360 } : {}}
                transition={{ duration: 2, ease: 'linear' }}
              >
                <Search className="w-8 h-8 text-red-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text being scanned */}
        <motion.div
          className="relative w-full max-w-sm p-4 bg-white/5 border border-white/10 rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
        >
          <p className="text-sm text-white/70 font-mono leading-relaxed">
            {genericText}
          </p>

          {/* Scan line */}
          {phase === 'scan' && (
            <motion.div
              className="absolute left-0 w-full h-0.5 bg-red-500"
              style={{ top: `${scanLine}%` }}
            />
          )}

          {/* Problem highlights */}
          <AnimatePresence>
            {['detect', 'verdict', 'complete'].includes(phase) && (
              <motion.div
                className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <XCircle className="w-12 h-12 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Detected problems */}
        <AnimatePresence>
          {['verdict', 'complete'].includes(phase) && (
            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {problems.map((problem, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-300">{problem}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verdict */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.p
              className="mt-4 text-sm text-red-300/80 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Por que não funciona? Poderia ser <span className="font-bold">qualquer pessoa</span> vendendo <span className="font-bold">qualquer coisa</span>.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Search className="w-3 h-3 text-red-400" />
        <span className="text-[9px] text-red-300">Análise</span>
      </motion.div>
    </div>
  );
};

export default CardEffectGenericDetector;
