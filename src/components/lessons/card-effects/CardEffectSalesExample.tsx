import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, BarChart3, TrendingUp } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectSalesExample: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Exemplo real: vendas do pequeno negócio!",
  subtitle = "Visualizando o ritmo de vendas com I.A."
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneDuration = ((duration || 14) * 1000) / 4;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const floatingItems = [
    { icon: Package, x: 20, y: 15 },
    { icon: ShoppingBag, x: 70, y: 25 },
    { icon: Package, x: 40, y: 60 },
    { icon: ShoppingBag, x: 80, y: 70 },
    { icon: Package, x: 15, y: 75 },
  ];

  const salesData = [
    { day: "Seg", value: 45 },
    { day: "Ter", value: 72 },
    { day: "Qua", value: 38 },
    { day: "Qui", value: 85 },
    { day: "Sex", value: 95 },
    { day: "Sáb", value: 60 },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Pedidos soltos flutuando */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64"
          >
            {floatingItems.map((item, i) => (
              <motion.div
                key={i}
                className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  delay: i * 0.15,
                  y: { duration: 2, repeat: Infinity, delay: i * 0.2 },
                  rotate: { duration: 3, repeat: Infinity, delay: i * 0.1 }
                }}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </motion.div>
            ))}
            <motion.p
              className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-blue-600 dark:text-blue-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Pedidos soltos sem organização...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 2: Ícones são puxados para dentro da planilha */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-64 sm:w-80 relative overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {floatingItems.slice(0, 3).map((item, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"
                  initial={{ x: -100 + i * 50, y: -50 + i * 20, opacity: 1, scale: 1 }}
                  animate={{ x: 80 + i * 30, y: 40, opacity: 0, scale: 0.5 }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                >
                  <item.icon className="w-4 h-4 text-blue-500" />
                </motion.div>
              ))}
              
              <div className="h-24 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <Package className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Organizando pedidos...</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Colunas aparecem */}
        {currentScene === 2 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96"
            >
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Data", "Produto", "Canal", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-1 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-[10px] sm:text-xs font-medium text-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="space-y-1">
                {[
                  ["01/03", "Camiseta", "Loja", "R$ 89"],
                  ["01/03", "Tênis", "Online", "R$ 299"],
                  ["02/03", "Boné", "Loja", "R$ 49"],
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-4 gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                  >
                    {row.map((cell, j) => (
                      <div key={j} className="text-[10px] text-slate-600 dark:text-slate-300 text-center truncate">
                        {cell}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Gráfico de colunas */}
        {currentScene === 3 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Vendas por dia</span>
              </div>
              
              <div className="flex items-end justify-between h-32 px-2">
                {salesData.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <motion.div
                      className={`w-6 sm:w-8 rounded-t ${
                        item.value > 80 ? 'bg-emerald-500' : item.value > 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${item.value}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                    <span className="text-[10px] text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Sexta foi o melhor dia! 🎉</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentScene === i ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectSalesExample;
