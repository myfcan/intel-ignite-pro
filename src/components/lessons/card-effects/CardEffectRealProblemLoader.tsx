import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, AlertCircle, CheckCircle, Target, FileText, Brain, Lightbulb, Zap, ArrowRight, Settings, Wrench } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectRealProblemLoader = ({ isActive = true, duration = 33 }: CardEffectProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(0);

    for (let i = 1; i < totalScenes; i++) {
      const timer = setTimeout(() => {
        setScene(i);
        if (i === totalScenes - 1) {
          loopCountRef.current += 1;
          if (loopCountRef.current < maxLoops) {
            const restartTimer = setTimeout(() => startAnimation(), sceneTime);
            timersRef.current.push(restartTimer);
          }
        }
      }, i * sceneTime);
      timersRef.current.push(timer);
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
    }
    return () => clearTimers();
  }, [isActive]);

  const problems = [
    { icon: AlertCircle, text: "Problema genérico", quality: "Ruim", color: "text-red-400" },
    { icon: FileText, text: "Com contexto real", quality: "Bom", color: "text-amber-400" },
    { icon: Target, text: "Específico e detalhado", quality: "Excelente", color: "text-emerald-400" },
  ];

  const loadSteps = [
    { icon: Upload, text: "Carregue o problema", color: "text-cyan-400" },
    { icon: Brain, text: "IA analisa", color: "text-violet-400" },
    { icon: Lightbulb, text: "Solução sob medida", color: "text-amber-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-teal-950 to-emerald-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-cyan-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Carregador de Problemas</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Carregue Seu <span className="text-cyan-400">Problema Real</span>
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Problem Quality Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {problems.map((problem, idx) => {
                const Icon = problem.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      y: shouldShow ? 0 : 20,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`p-4 rounded-xl border flex items-center gap-4 ${
                      idx === 0 ? 'bg-red-500/10 border-red-500/30' :
                      idx === 1 ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${problem.color}`} />
                    </motion.div>
                    <p className="text-white font-medium flex-1">{problem.text}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      idx === 0 ? 'bg-red-500/20 text-red-300' :
                      idx === 1 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {problem.quality}
                    </span>
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-cyan-300 text-lg font-medium">Quanto mais contexto, melhor!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 2: Full Screen Effects (Scenes 5-10) */}
          {scene === 5 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-32 h-32 rounded-2xl bg-cyan-500/20 border-2 border-cyan-500 border-dashed flex items-center justify-center">
                  <Upload className="w-12 h-12 text-cyan-400" />
                </div>
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="text-cyan-400 text-sm">Carregando...</div>
                </motion.div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mt-8">Upload do Problema</h3>
            </motion.div>
          )}

          {scene === 6 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Processo</h3>
              <div className="flex items-center gap-2 w-full max-w-md">
                {loadSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={idx}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.3 }}
                        className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-center"
                      >
                        <Icon className={`w-6 h-6 ${step.color} mx-auto mb-1`} />
                        <p className="text-white text-xs">{step.text}</p>
                      </motion.div>
                      {idx < loadSteps.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.3 + 0.15 }}
                        >
                          <ArrowRight className="w-4 h-4 text-white/50" />
                        </motion.div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}

          {scene === 7 && (
            <motion.div
              key="scene7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                className="relative w-32 h-32"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-full h-full text-cyan-400/30" />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Wrench className="w-12 h-12 text-cyan-400" />
                </motion.div>
              </motion.div>
              <p className="text-white text-lg mt-6">Processando Contexto</p>
            </motion.div>
          )}

          {scene === 8 && (
            <motion.div
              key="scene8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="grid grid-cols-2 gap-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
                >
                  <p className="text-3xl font-bold text-red-400">Genérico</p>
                  <p className="text-red-300 text-sm mt-2">Resposta vaga</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-3xl font-bold text-emerald-400">Específico</p>
                  <p className="text-emerald-300 text-sm mt-2">Solução precisa</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {scene === 9 && (
            <motion.div
              key="scene9"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <Target className="w-16 h-16 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Contexto é Tudo</h3>
              <p className="text-cyan-300 text-center max-w-sm">Carregue seu problema real para obter soluções reais</p>
            </motion.div>
          )}

          {scene >= 10 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(34, 211, 238, 0.6)', '0 0 0px rgba(34, 211, 238, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center max-w-md"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Problema Carregado!</h3>
                <p className="text-cyan-300">
                  Agora a IA pode trabalhar com seu contexto real e entregar soluções precisas
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-cyan-400' : 'bg-cyan-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
