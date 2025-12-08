'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XCircle, AlertCircle, Eye, Ban } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectGenericDetector - Identifica texto genérico vs específico
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. Ícone de scanner aparecendo
 * 2. Texto genérico sendo escaneado
 * 3. Problemas detectados: Genérico, Sem emoção
 * 4. X vermelho sobre o texto
 * 5. Veredito: "Poderia ser qualquer pessoa vendendo qualquer coisa"
 *
 * Roda 2x automaticamente
 */
export const CardEffectGenericDetector: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [scanLine, setScanLine] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const genericText = "Vendo produtos de qualidade. Ótimo preço. Interessados chamar privado.";
  const problems = ["Genérico", "Sem emoção", "Impessoal"];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScanLine(0);
    setScene(1); // Scanner aparece

    // Animate scan line during scene 2
    timersRef.current.push(setTimeout(() => {
      setScene(2);
      for (let i = 0; i <= 100; i += 3) {
        timersRef.current.push(setTimeout(() => setScanLine(i), i * 25));
      }
    }, 3000));

    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Problemas detectados
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // X vermelho
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Veredito

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setScanLine(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 15000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setScanLine(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '25px 25px'
        }} />
      </div>

      {/* Warning pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)' }}
        animate={scene >= 3 ? { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ========== CENA 1: Scanner Icon ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="mb-5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150, duration: 0.8 }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600"
                animate={scene === 2 ? { rotate: 360 } : {}}
                transition={{ duration: 3, ease: 'linear' }}
              >
                <Search className={`w-8 h-8 transition-colors duration-700 ${scene >= 3 ? 'text-red-400' : 'text-slate-400'}`} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.h3
              className="text-lg sm:text-xl font-bold text-white mb-5 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Análise de Texto
            </motion.h3>
          )}
        </AnimatePresence>

        {/* ========== CENA 2: Text being scanned ========== */}
        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="relative w-full max-w-sm p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm text-white/70 font-mono leading-relaxed">
                {genericText}
              </p>

              {/* Scan line */}
              {scene === 2 && (
                <motion.div
                  className="absolute left-0 w-full h-0.5 bg-red-500"
                  style={{ top: `${scanLine}%` }}
                />
              )}

              {/* ========== CENA 4: Red X overlay ========== */}
              <AnimatePresence>
                {scene >= 4 && (
                  <motion.div
                    className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 150 }}
                    >
                      <XCircle className="w-16 h-16 text-red-500" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 3: Detected problems ========== */}
        <AnimatePresence>
          {scene >= 3 && scene < 5 && (
            <motion.div
              className="mt-5 flex flex-wrap justify-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {problems.map((problem, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2, duration: 0.4 }}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-300 font-medium">{problem}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Verdict ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6 max-w-sm text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="flex items-center justify-center gap-2 mb-3"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <Ban className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-bold text-sm">TEXTO REPROVADO</span>
              </motion.div>
              <motion.p
                className="text-sm text-red-200/80 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Por que não funciona? Poderia ser <span className="font-bold text-white">qualquer pessoa</span> vendendo <span className="font-bold text-white">qualquer coisa</span>.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Eye className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[10px] text-red-300 font-medium">Análise</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#ef4444' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectGenericDetector;
