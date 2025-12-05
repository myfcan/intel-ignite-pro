'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, DollarSign, FileText, BarChart, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectValueCalculator: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3>(0);
  const [calculatedServices, setCalculatedServices] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const services = [
    { name: 'Currículo', value: 100, icon: FileText },
    { name: 'Planilha', value: 100, icon: BarChart },
    { name: 'Textos Site', value: 100, icon: FileText },
    { name: 'Roteiro', value: 100, icon: FileText },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setCalculatedServices([]);
    setTotal(0);
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setCalculatedServices([0]); setTotal(100); }, 2000));
    timersRef.current.push(setTimeout(() => { setCalculatedServices([0, 1]); setTotal(200); }, 3000));
    timersRef.current.push(setTimeout(() => { setCalculatedServices([0, 1, 2]); setTotal(300); }, 4000));
    timersRef.current.push(setTimeout(() => { setCalculatedServices([0, 1, 2, 3]); setTotal(400); }, 5000));
    timersRef.current.push(setTimeout(() => setScene(3), 6500));

    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setCalculatedServices([]);
        setTotal(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 9000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setCalculatedServices([]);
      setTotal(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255, 255, 255, 0.05) 20px, rgba(255, 255, 255, 0.05) 21px)',
        }} />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        {/* Título */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Calculadora de Valor</h3>
              <p className="text-orange-300 text-sm">Quanto cobrar por serviço</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display da calculadora */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="w-full max-w-sm bg-white/5 backdrop-blur border border-orange-400/30 rounded-xl p-4 mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <div className="flex items-center justify-between mb-3">
                <Calculator className="w-5 h-5 text-orange-400" />
                <span className="text-xs text-orange-200/70">Serviços Simples</span>
              </div>
              
              <motion.div
                className="text-3xl sm:text-4xl font-bold text-orange-400 text-center"
                key={total}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                R$ {total.toLocaleString('pt-BR')}
              </motion.div>
              
              <p className="text-xs text-orange-200/70 text-center mt-2">
                {calculatedServices.length} serviço(s) calculado(s)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de serviços */}
        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="w-full max-w-sm space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {services.map((service, index) => {
                const isCalculated = calculatedServices.includes(index);
                const Icon = service.icon;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                      isCalculated 
                        ? 'bg-orange-500/20 border border-orange-400/30' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isCalculated ? 'text-orange-400' : 'text-white/30'}`} />
                      <span className={`text-sm ${isCalculated ? 'text-white' : 'text-white/40'}`}>
                        {service.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isCalculated ? 'text-orange-400' : 'text-white/30'}`}>
                        R$ {service.value}
                      </span>
                      {isCalculated && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conclusão */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                animate={{
                  boxShadow: ['0 0 15px rgba(34,197,94,0.2)', '0 0 30px rgba(34,197,94,0.4)', '0 0 15px rgba(34,197,94,0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">R$100 por serviço = meta alcançável!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 }}
      >
        <DollarSign className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Valor</span>
      </motion.div>
    </div>
  );
};

export default CardEffectValueCalculator;
