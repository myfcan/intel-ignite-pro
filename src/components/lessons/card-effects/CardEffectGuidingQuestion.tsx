import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { HelpCircle, MessageCircleQuestion, Lightbulb, Brain, Sparkles, ArrowRight, CheckCircle, Target, Compass, Rocket } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectGuidingQuestion = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const questions = [
    { text: "Qual problema você quer resolver?", icon: Target, color: "text-cyan-400" },
    { text: "Que resultado você espera?", icon: Lightbulb, color: "text-amber-400" },
    { text: "O que você já tentou?", icon: Brain, color: "text-violet-400" },
  ];

  const benefits = [
    { icon: Compass, text: "Direção clara", color: "text-emerald-400" },
    { icon: Target, text: "Foco preciso", color: "text-rose-400" },
    { icon: Sparkles, text: "Resultados melhores", color: "text-amber-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-amber-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <MessageCircleQuestion className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-medium">Pergunta Guia</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          A <span className="text-amber-400">Pergunta</span> Certa
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Question Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {questions.map((question, idx) => {
                const Icon = question.icon;
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
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${question.color}`} />
                    </motion.div>
                    <p className="text-white font-medium italic">"{question.text}"</p>
                    {scene === idx && (
                      <motion.div
                        className="ml-auto"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <HelpCircle className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-amber-300 text-lg font-medium">Perguntas certas, respostas certas!</p>
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
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                  <HelpCircle className="w-16 h-16 text-amber-400" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Lightbulb className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mt-6">Pergunte com Propósito!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Benefícios</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${benefit.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{benefit.text}</p>
                    </motion.div>
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
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500/30"
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <p className="text-red-300 text-sm">"Me ajude"</p>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-amber-400" />
                </motion.div>
                <motion.div
                  className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <p className="text-emerald-300 text-sm">"Como posso resolver X para alcançar Y?"</p>
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Transformação do Pedido</p>
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
              <div className="space-y-4 w-full max-w-sm">
                {['Problema', 'Objetivo', 'Contexto'].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.2, duration: 0.5 }}
                    className="p-3 rounded-lg bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-medium">{item}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-amber-300 text-lg mt-6">Checklist da Pergunta Perfeita</p>
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
              <Brain className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Pense Antes de Perguntar</h3>
              <p className="text-amber-300 text-center max-w-sm">A qualidade da pergunta define a qualidade da resposta</p>
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
                  boxShadow: ['0 0 0px rgba(245, 158, 11, 0.3)', '0 0 40px rgba(245, 158, 11, 0.6)', '0 0 0px rgba(245, 158, 11, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center max-w-md"
              >
                <Rocket className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Pergunta Guia Ativada!</h3>
                <p className="text-amber-300">
                  Você aprendeu a fazer as perguntas certas para obter as melhores respostas da I.A.
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-amber-400' : 'bg-amber-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
