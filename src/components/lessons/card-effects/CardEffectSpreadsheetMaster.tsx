import { motion, AnimatePresence } from "framer-motion";
import { Table, Boxes, Calculator, ClipboardList, User, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectSpreadsheetMasterProps {
  isActive?: boolean;
}

export const CardEffectSpreadsheetMaster = ({ isActive = false }: CardEffectSpreadsheetMasterProps) => {
  const [scene, setScene] = useState(0);
  const [activeSheet, setActiveSheet] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const sheets = [
    { icon: Boxes, label: "Controle de Estoque", color: "purple" },
    { icon: Calculator, label: "Fluxo de Caixa", color: "green" },
    { icon: ClipboardList, label: "Lista de Tarefas", color: "blue" }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActiveSheet(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 2500));
    timersRef.current.push(setTimeout(() => setActiveSheet(0), 3500));
    timersRef.current.push(setTimeout(() => setActiveSheet(1), 5500));
    timersRef.current.push(setTimeout(() => setActiveSheet(2), 7500));
    timersRef.current.push(setTimeout(() => setScene(3), 10000));
    timersRef.current.push(setTimeout(() => setScene(4), 12500));

    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), 15000));
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActiveSheet(null);
    }
    return () => clearTimers();
  }, [isActive]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
      purple: { bg: 'bg-purple-900/40', border: 'border-purple-500/40', icon: 'text-purple-400', text: 'text-purple-300' },
      green: { bg: 'bg-green-900/40', border: 'border-green-500/40', icon: 'text-green-400', text: 'text-green-300' },
      blue: { bg: 'bg-blue-900/40', border: 'border-blue-500/40', icon: 'text-blue-400', text: 'text-blue-300' }
    };
    return colors[color];
  };

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-950 via-violet-950 to-fuchsia-950">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Character */}
          {scene >= 1 && (
            <motion.div
              key="character"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="text-purple-300 font-semibold">Moça das Planilhas</p>
              <p className="text-purple-400/60 text-xs">Gosta de organização</p>
            </motion.div>
          )}

          {/* Scene 2: Spreadsheets */}
          {scene >= 2 && (
            <motion.div
              key="sheets"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-4"
            >
              {sheets.map((sheet, i) => {
                const Icon = sheet.icon;
                const colors = getColorClasses(sheet.color);
                const isActive = activeSheet !== null && activeSheet >= i;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: activeSheet === i ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.15 }}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all w-28 ${
                      isActive ? `${colors.bg} ${colors.border}` : 'bg-gray-900/30 border-gray-700/30'
                    }`}
                  >
                    {/* Mini spreadsheet visual */}
                    <div className={`w-16 h-20 rounded-lg mb-2 overflow-hidden ${isActive ? 'bg-white/10' : 'bg-gray-800'}`}>
                      <div className="grid grid-cols-3 gap-px p-1">
                        {[...Array(9)].map((_, j) => (
                          <motion.div
                            key={j}
                            className={`h-2 rounded-sm ${isActive ? colors.bg : 'bg-gray-700'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isActive ? 1 : 0.5 }}
                            transition={{ delay: j * 0.05 }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <Icon className={`w-5 h-5 ${isActive ? colors.icon : 'text-gray-600'}`} />
                      </div>
                    </div>
                    
                    <p className={`text-xs text-center font-medium ${isActive ? colors.text : 'text-gray-500'}`}>
                      {sheet.label}
                    </p>

                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Scene 3: Adaptation */}
          {scene >= 3 && (
            <motion.div
              key="adapt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-purple-900/40 backdrop-blur-sm px-5 py-3 rounded-xl border border-purple-500/30"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <p className="text-purple-300 font-medium">
                  Adapta para cada pequeno negócio
                </p>
              </div>
            </motion.div>
          )}

          {/* Scene 4: Insight */}
          {scene >= 4 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-purple-400/70 text-sm text-center">
                Organização + I.A. = Soluções sob medida
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-purple-400' : 'bg-purple-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-purple-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-400/30"
      >
        <span className="text-purple-300 text-xs font-medium">Exemplo 2</span>
      </motion.div>
    </div>
  );
};
