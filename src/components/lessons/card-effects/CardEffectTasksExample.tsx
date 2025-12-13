import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, CheckSquare, Calendar, ListTodo } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectTasksExample: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Exemplo real: agenda organizada!",
  subtitle = "Tarefas soltas viram um painel claro da semana"
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

  const stickyNotes = [
    { text: "Ligar cliente", x: 10, y: 20, rotate: -5 },
    { text: "Enviar email", x: 60, y: 15, rotate: 8 },
    { text: "Reunião 15h", x: 30, y: 55, rotate: -3 },
    { text: "Pagar conta", x: 70, y: 60, rotate: 6 },
    { text: "Comprar", x: 15, y: 75, rotate: -8 },
  ];

  const tasks = [
    { task: "Ligar cliente", prazo: "Seg", prioridade: "Alta", status: "done" },
    { task: "Enviar email", prazo: "Seg", prioridade: "Média", status: "done" },
    { task: "Reunião 15h", prazo: "Ter", prioridade: "Alta", status: "late" },
    { task: "Pagar conta", prazo: "Qua", prioridade: "Alta", status: "pending" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Cena 1: Bilhetes e lembretes sobrepostos (caos) */}
        {currentScene === 0 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-72 sm:w-96 h-48 sm:h-64"
          >
            {stickyNotes.map((note, i) => (
              <motion.div
                key={i}
                className="absolute w-20 sm:w-24 h-16 sm:h-20 bg-yellow-200 dark:bg-yellow-300 shadow-md p-2 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0, rotate: note.rotate }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -5, 0]
                }}
                transition={{ 
                  delay: i * 0.1,
                  y: { duration: 2, repeat: Infinity, delay: i * 0.2 }
                }}
                style={{ 
                  left: `${note.x}%`, 
                  top: `${note.y}%`,
                  transform: `rotate(${note.rotate}deg)`
                }}
              >
                <StickyNote className="absolute top-1 right-1 w-3 h-3 text-yellow-600" />
                <span className="text-[10px] sm:text-xs text-yellow-800 font-medium text-center">{note.text}</span>
              </motion.div>
            ))}
            <motion.p
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm text-violet-600 dark:text-violet-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Caos de lembretes...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 2: Tudo puxado para tabela */}
        {currentScene === 1 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 w-72 sm:w-96"
            >
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Tarefa", "Prazo", "Prior.", "Status"].map((col, i) => (
                  <motion.div
                    key={col}
                    className="px-1 py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded text-[10px] sm:text-xs font-medium text-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {col}
                  </motion.div>
                ))}
              </div>
              <div className="space-y-1">
                {tasks.map((t, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-4 gap-2 py-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                  >
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">{t.task}</div>
                    <div className="text-[10px] text-slate-500 text-center">{t.prazo}</div>
                    <div className="text-[10px] text-slate-500 text-center">{t.prioridade}</div>
                    <div className="text-[10px] text-center">⬜</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 3: Status com cores */}
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
                {["Tarefa", "Prazo", "Prior.", "Status"].map((col) => (
                  <div
                    key={col}
                    className="px-1 py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded text-[10px] sm:text-xs font-medium text-center"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {tasks.map((t, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-4 gap-2 py-1 items-center"
                    initial={{ backgroundColor: "transparent" }}
                    animate={{ 
                      backgroundColor: t.status === 'done' 
                        ? "rgba(34, 197, 94, 0.1)" 
                        : t.status === 'late' 
                          ? "rgba(249, 115, 22, 0.1)" 
                          : "transparent"
                    }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">{t.task}</div>
                    <div className="text-[10px] text-slate-500 text-center">{t.prazo}</div>
                    <div className="text-[10px] text-slate-500 text-center">{t.prioridade}</div>
                    <motion.div 
                      className="text-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.2 }}
                    >
                      {t.status === 'done' && <span className="text-green-500">✅</span>}
                      {t.status === 'late' && <span className="text-orange-500">⚠️</span>}
                      {t.status === 'pending' && <span className="text-slate-400">⏳</span>}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cena 4: Visão semanal como calendário */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-violet-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Semana</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day, i) => (
                  <motion.div
                    key={day}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-[10px] font-medium text-slate-500 mb-2">{day}</div>
                    <div className={`h-16 rounded-lg border-2 p-1 flex flex-col gap-0.5 ${
                      i === 0 ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-600'
                    }`}>
                      {i === 0 && (
                        <>
                          <div className="text-[8px] bg-green-200 dark:bg-green-800 rounded px-1 truncate">✓ Ligar</div>
                          <div className="text-[8px] bg-green-200 dark:bg-green-800 rounded px-1 truncate">✓ Email</div>
                        </>
                      )}
                      {i === 1 && (
                        <div className="text-[8px] bg-orange-200 dark:bg-orange-800 rounded px-1 truncate">⚠ Reunião</div>
                      )}
                      {i === 2 && (
                        <div className="text-[8px] bg-violet-200 dark:bg-violet-800 rounded px-1 truncate">⏳ Conta</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-violet-600 dark:text-violet-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <ListTodo className="w-5 h-5" />
              <span className="text-sm font-medium">Visão clara da semana! ✨</span>
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
              currentScene === i ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectTasksExample;
