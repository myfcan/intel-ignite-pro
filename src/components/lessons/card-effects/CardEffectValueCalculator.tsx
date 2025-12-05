'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, DollarSign, FileText, BarChart, CheckCircle } from 'lucide-react';

interface CardEffectValueCalculatorProps {
  isActive?: boolean;
}

export const CardEffectValueCalculator: React.FC<CardEffectValueCalculatorProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [calculatedServices, setCalculatedServices] = useState<number[]>([]);
  const [total, setTotal] = useState(0);

  const services = [
    { name: 'Currículo', value: 100, icon: FileText },
    { name: 'Planilha', value: 100, icon: BarChart },
    { name: 'Textos Site', value: 100, icon: FileText },
    { name: 'Roteiro', value: 100, icon: FileText },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => { setScene(2); setCalculatedServices([0]); setTotal(100); }, 1500),
      setTimeout(() => { setCalculatedServices([0, 1]); setTotal(200); }, 2300),
      setTimeout(() => { setCalculatedServices([0, 1, 2]); setTotal(300); }, 3100),
      setTimeout(() => { setCalculatedServices([0, 1, 2, 3]); setTotal(400); }, 3900),
      setTimeout(() => setScene(3), 5000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-green-900/30 to-slate-900 border border-green-500/30">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(34, 197, 94, 0.1) 20px, rgba(34, 197, 94, 0.1) 21px)',
        }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Calculadora de Valor</h3>
          <p className="text-[10px] text-green-300">Quanto cobrar por serviço</p>
        </motion.div>

        {/* Display da calculadora */}
        <motion.div
          className="w-full max-w-xs bg-slate-800/50 border border-green-400/30 rounded-xl p-3 mb-3"
          animate={{
            boxShadow: scene >= 2 ? '0 0 20px rgba(34, 197, 94, 0.2)' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Calculator className="w-4 h-4 text-green-400" />
            <span className="text-[9px] text-slate-400">Serviços Simples</span>
          </div>
          
          <motion.div
            className="text-2xl font-bold text-green-400 text-center"
            key={total}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            R$ {total.toLocaleString('pt-BR')}
          </motion.div>
          
          <p className="text-[9px] text-slate-400 text-center mt-1">
            {calculatedServices.length} serviço(s) calculado(s)
          </p>
        </motion.div>

        {/* Lista de serviços */}
        <div className="w-full max-w-xs space-y-1.5">
          {services.map((service, index) => {
            const isCalculated = calculatedServices.includes(index);
            const Icon = service.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all ${
                  isCalculated 
                    ? 'bg-green-500/20 border border-green-400/30' 
                    : 'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3 h-3 ${isCalculated ? 'text-green-400' : 'text-slate-500'}`} />
                  <span className={`text-[10px] ${isCalculated ? 'text-green-300' : 'text-slate-500'}`}>
                    {service.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium ${isCalculated ? 'text-green-400' : 'text-slate-500'}`}>
                    R$ {service.value}
                  </span>
                  {isCalculated && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1.5"
            >
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300 font-medium">
                R$100 por serviço = meta alcançável!
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
                backgroundColor: scene >= s ? '#22c55e' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/20 border border-green-400/30 rounded-full px-2 py-0.5"
      >
        <DollarSign className="w-3 h-3 text-green-400" />
        <span className="text-[9px] text-green-300 font-medium">Valor</span>
      </motion.div>
    </div>
  );
};

export default CardEffectValueCalculator;
