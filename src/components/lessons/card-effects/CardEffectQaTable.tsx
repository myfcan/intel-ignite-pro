import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, DollarSign, Home, Table, HelpCircle, Lightbulb, ArrowDown, CheckCircle, Sparkles, Grid3X3 } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectQaTable: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 36,
  title = "Planilha como perguntas e respostas!",
  subtitle = "Cada linha é uma situação real, não só números"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const BASE_DURATION = 36;
  const scale = useMemo(() => (duration || BASE_DURATION) / BASE_DURATION, [duration]);
  const sceneDuration = ((duration || BASE_DURATION) * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const tableRows = [
    { text: "Compra no mercado", icon: ShoppingCart, color: "text-emerald-600" },
    { text: "Venda do dia", icon: DollarSign, color: "text-blue-600" },
    { text: "Pagamento de aluguel", icon: Home, color: "text-amber-600" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* FASE 1: ELEMENTOS EMPILHADOS (Cenas 0-5) */}
        
        {/* Cena 0: Ícone de tabela inicial */}
        {currentScene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0]
              }}
              transition={{ duration: 2 * scale, repeat: Infinity }}
            >
              <Table className="w-10 h-10 text-white" />
            </motion.div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Cada linha conta uma história</p>
          </motion.div>
        )}

        {/* Cena 1: Primeira linha surge */}
        {currentScene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
            >
              <motion.div
                className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border-l-4 border-emerald-500"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 * scale }}
              >
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{tableRows[0].text}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 2: Segunda linha aparece */}
        {currentScene === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96 space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border-l-4 border-emerald-500 opacity-70">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{tableRows[0].text}</span>
              </div>
              <motion.div
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * scale }}
              >
                <DollarSign className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{tableRows[1].text}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Terceira linha - todas visíveis */}
        {currentScene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 w-72 sm:w-96 space-y-2">
              {tableRows.map((row, i) => (
                <motion.div
                  key={row.text}
                  className={`flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-l-4 ${i === 0 ? 'border-emerald-500' : i === 1 ? 'border-blue-500' : 'border-amber-500'}`}
                  initial={i === 2 ? { opacity: 0, x: -50 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i === 2 ? 0.2 * scale : 0 }}
                >
                  <row.icon className={`w-5 h-5 ${row.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{row.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Perguntas label aparece */}
        {currentScene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-700 dark:text-purple-300">PERGUNTAS</span>
            </motion.div>
            
            <motion.div 
              className="w-1 h-12 bg-gradient-to-b from-purple-400 to-teal-400"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 * scale }}
            />
            
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 w-64 sm:w-80 space-y-2">
              {tableRows.map((row, i) => (
                <div
                  key={row.text}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded text-sm"
                >
                  <row.icon className={`w-4 h-4 ${row.color}`} />
                  <span className="text-slate-600 dark:text-slate-300">{row.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Cena 5: Respostas label aparece */}
        {currentScene === 5 && (
          <motion.div
            key="scene5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">PERGUNTAS</span>
            </div>
            
            <ArrowDown className="w-5 h-5 text-slate-400" />
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 w-56 space-y-1">
              {tableRows.map((row) => (
                <div key={row.text} className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-700/50 rounded text-xs">
                  <row.icon className={`w-3 h-3 ${row.color}`} />
                  <span className="text-slate-500">{row.text}</span>
                </div>
              ))}
            </div>
            
            <ArrowDown className="w-5 h-5 text-slate-400" />
            
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/50 rounded-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 * scale }}
            >
              <Lightbulb className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-teal-700 dark:text-teal-300">RESPOSTAS</span>
            </motion.div>
          </motion.div>
        )}

        {/* FASE 2: TELA LIMPA (Cenas 6-10) */}

        {/* Cena 6: Zoom em uma linha */}
        {currentScene === 6 && (
          <motion.div
            key="scene6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 border-2 border-emerald-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <motion.div
                className="flex items-center gap-4"
                animate={{ boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.4)", "0 0 0 rgba(16,185,129,0)"] }}
                transition={{ duration: 2 * scale, repeat: Infinity }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">Compra no mercado</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Situação → Informação organizada</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 7: Grid de colunas */}
        {currentScene === 7 && (
          <motion.div
            key="scene7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Grid3X3 className="w-8 h-8 text-emerald-500" />
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Data", "Descrição", "Categoria", "Valor"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-1 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-[10px] sm:text-xs font-medium text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 * scale }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 8: Linhas preenchidas */}
        {currentScene === 8 && (
          <motion.div
            key="scene8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Data", "Descrição", "Categoria", "Valor"].map((col) => (
                  <div
                    key={col}
                    className="px-1 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-[10px] sm:text-xs font-medium text-center"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {[
                  ["01/03", "Mercado", "Alimentação", "R$ 250"],
                  ["02/03", "Venda", "Receita", "R$ 500"],
                  ["03/03", "Aluguel", "Moradia", "R$ 1.200"],
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-4 gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 * scale }}
                  >
                    {row.map((cell, j) => (
                      <div key={j} className="text-[10px] text-slate-600 dark:text-slate-300 text-center py-1 bg-slate-50 dark:bg-slate-700 rounded">
                        {cell}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 9: Destaque de uma linha específica */}
        {currentScene === 9 && (
          <motion.div
            key="scene9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96">
              <div className="space-y-1">
                {[
                  { row: ["01/03", "Mercado", "Alimentação", "R$ 250"], highlight: false },
                  { row: ["02/03", "Venda", "Receita", "R$ 500"], highlight: true },
                  { row: ["03/03", "Aluguel", "Moradia", "R$ 1.200"], highlight: false },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={`grid grid-cols-4 gap-2 p-1 rounded ${item.highlight ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400' : ''}`}
                    animate={item.highlight ? { 
                      boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 15px rgba(16,185,129,0.4)", "0 0 0 rgba(16,185,129,0)"]
                    } : {}}
                    transition={{ duration: 1.5 * scale, repeat: Infinity }}
                  >
                    {item.row.map((cell, j) => (
                      <div key={j} className={`text-[10px] text-center py-1 ${item.highlight ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>
                        {cell}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.p
              className="text-sm text-emerald-600 dark:text-emerald-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 * scale }}
            >
              Cada linha conta uma história!
            </motion.p>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final */}
        {currentScene === 10 && (
          <motion.div
            key="scene10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 * scale }}
            >
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Perguntas viram respostas!</p>
              <p className="text-sm text-slate-500 mt-1">Situações reais, não só números</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[...Array(totalScenes)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              currentScene === i ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectQaTable;
