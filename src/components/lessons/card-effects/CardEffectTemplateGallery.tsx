'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, FileText, GraduationCap, Building, Copy, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectTemplateGallery: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const templates = [
    { icon: Building, name: 'Condomínio', items: ['Atas', 'Comunicados', 'Regras'] },
    { icon: GraduationCap, name: 'Professores', items: ['Planos', 'Exercícios', 'Avaliações'] },
    { icon: FileText, name: 'Negócios', items: ['Descrições', 'Posts', 'E-mails'] },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setSelectedTemplate(null);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setSelectedTemplate(0); }, 2500));
    timersRef.current.push(setTimeout(() => setSelectedTemplate(1), 4000));
    timersRef.current.push(setTimeout(() => setSelectedTemplate(2), 5500));
    timersRef.current.push(setTimeout(() => setScene(3), 7000));
    timersRef.current.push(setTimeout(() => setScene(4), 9500));
    
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 12000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setSelectedTemplate(null);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-950">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)',
          backgroundSize: '25px 25px'
        }} />
      </div>

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Galeria de Templates</h3>
              <p className="text-violet-300 text-sm">Modelos prontos para usar</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="grid grid-cols-3 gap-3 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {templates.map((template, index) => {
                const isSelected = selectedTemplate === index;
                const Icon = template.icon;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, scale: isSelected ? 1.05 : 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-violet-500/30 border-2 border-violet-400/50' : 'bg-slate-800/50 border border-slate-700/30'
                    }`}
                  >
                    <motion.div
                      animate={{ boxShadow: isSelected ? '0 0 25px rgba(139, 92, 246, 0.4)' : 'none' }}
                      className="flex flex-col items-center"
                    >
                      <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-violet-300' : 'text-slate-500'}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-violet-300' : 'text-slate-500'}`}>
                        {template.name}
                      </span>
                    </motion.div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1"
                        >
                          {template.items.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-[10px] text-violet-400/70 flex items-center gap-1"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              {item}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedTemplate !== null && scene >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-sm mt-4 bg-slate-800/50 border border-violet-400/30 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-violet-300 font-medium">
                  Template: {templates[selectedTemplate].name}
                </span>
                <div className="flex items-center gap-1 text-xs text-violet-400">
                  <Copy className="w-4 h-4" />
                  <span>Usar</span>
                </div>
              </div>
              <div className="h-12 bg-violet-500/10 rounded-lg border border-violet-400/20 flex items-center justify-center">
                <span className="text-xs text-violet-400/70">Pronto para personalizar</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/30"
                animate={{ boxShadow: ['0 0 15px rgba(139,92,246,0.2)', '0 0 30px rgba(139,92,246,0.4)', '0 0 15px rgba(139,92,246,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Layout className="w-5 h-5 text-violet-400" />
                <span className="text-white font-semibold text-sm">+50 templates disponíveis!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
      >
        <Layout className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] text-violet-300 font-medium">Gallery</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTemplateGallery;
