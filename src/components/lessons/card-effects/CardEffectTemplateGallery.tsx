'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, FileText, GraduationCap, Building, CheckCircle, Sparkles, Grid, Copy, Layers, Star, Zap } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectTemplateGallery - "Galeria de Templates"
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - templates por categoria
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado
 */
export const CardEffectTemplateGallery: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const templates = [
    { icon: Building, name: 'Condomínio', items: ['Atas', 'Comunicados', 'Regras'], color: 'from-blue-500 to-cyan-500' },
    { icon: GraduationCap, name: 'Professores', items: ['Planos', 'Exercícios', 'Avaliações'], color: 'from-purple-500 to-pink-500' },
    { icon: FileText, name: 'Negócios', items: ['Descrições', 'Posts', 'E-mails'], color: 'from-orange-500 to-amber-500' },
  ];

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setSelectedTemplate(null);
    setScene(1);
    for (let i = 2; i <= 12; i++) {
      timersRef.current.push(setTimeout(() => {
        setScene(i);
        // Selecionar templates progressivamente nas cenas 2-4
        if (i === 2) setSelectedTemplate(0);
        if (i === 3) setSelectedTemplate(1);
        if (i === 4) setSelectedTemplate(2);
      }, (i - 1) * 3000 * scale));
    }
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setSelectedTemplate(null);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-violet-900/30 to-purple-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div 
              className="flex flex-col items-center gap-4 w-full max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Título */}
              <motion.div
                className="text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 * scale }}
              >
                <div className="flex items-center gap-2 justify-center mb-2">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Grid className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Galeria de Templates</h3>
                </div>
                <p className="text-violet-300 text-sm">Modelos prontos para usar</p>
              </motion.div>

              {/* Cenas 2-4: Templates aparecem progressivamente */}
              <motion.div 
                className="grid grid-cols-3 gap-3 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 * scale }}
              >
                {templates.map((template, index) => {
                  const isSelected = selectedTemplate === index;
                  const Icon = template.icon;
                  const isVisible = scene >= index + 2;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ 
                        opacity: isVisible ? 1 : 0, 
                        y: isVisible ? 0 : 20,
                        scale: isSelected ? 1.05 : (isVisible ? 1 : 0.8)
                      }}
                      transition={{ duration: 0.4 * scale }}
                      className={`relative p-3 rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-br ' + template.color + ' border-2 border-white/30' 
                          : 'bg-slate-800/50 border border-slate-700/30'
                      }`}
                    >
                      <motion.div 
                        animate={{ boxShadow: isSelected ? '0 0 25px rgba(139, 92, 246, 0.4)' : 'none' }} 
                        className="flex flex-col items-center"
                      >
                        <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                          {template.name}
                        </span>
                      </motion.div>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-violet-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Cena 5: Items do template selecionado */}
              {scene >= 5 && selectedTemplate !== null && (
                <motion.div
                  className="w-full bg-slate-800/30 rounded-xl p-4 border border-violet-500/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 * scale }}
                >
                  <p className="text-xs text-violet-300 mb-2">Inclui:</p>
                  <div className="flex flex-wrap gap-2">
                    {templates[selectedTemplate].items.map((item, i) => (
                      <motion.div
                        key={item}
                        className="flex items-center gap-1 px-2 py-1 bg-violet-500/20 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 * scale }}
                      >
                        <Copy className="w-3 h-3 text-violet-400" />
                        <span className="text-xs text-violet-200">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Cena 6: Contador */}
              {scene >= 6 && (
                <motion.div
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <Layout className="w-5 h-5 text-violet-400" />
                  <span className="text-white font-semibold text-sm">+50 templates disponíveis!</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== FASE 2: TELA LIMPA (Cenas 7-12) ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              {/* Cena 7: Grande ícone */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(139,92,246,0.3)', '0 0 60px rgba(139,92,246,0.6)', '0 0 30px rgba(139,92,246,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Layers className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Biblioteca Completa</p>
                </motion.div>
              )}

              {/* Cena 8: Stats */}
              {scene === 8 && (
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[
                    { label: 'Templates', value: '50+' },
                    { label: 'Categorias', value: '10+' },
                    { label: 'Tempo salvo', value: '80%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-violet-500/10 rounded-xl border border-violet-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <p className="text-2xl font-bold text-violet-400">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 9: Copiar e colar */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Copy className="w-20 h-20 text-violet-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Copiar, Colar, Usar</p>
                  <p className="text-sm text-violet-300 mt-1">Sem complicação</p>
                </motion.div>
              )}

              {/* Cena 10: Sparkles */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-20 h-20 text-purple-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Personalização Fácil</p>
                  <p className="text-sm text-violet-300 mt-1">Adapte ao seu estilo</p>
                </motion.div>
              )}

              {/* Cena 11: Estrelas de qualidade */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <div className="flex justify-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1 * scale, type: 'spring' }}
                      >
                        <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xl font-bold text-white">Qualidade Garantida</p>
                </motion.div>
              )}

              {/* Cena 12: Mensagem Final */}
              {scene === 12 && (
                <motion.div
                  className="text-center max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 * scale }}
                >
                  <motion.div
                    className="p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Zap className="w-6 h-6 text-violet-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      Templates prontos para <span className="text-violet-400 font-bold">acelerar seu trabalho</span> em segundos.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-1.5 mt-auto pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.5 * scale }}
      >
        <Layout className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] text-violet-300 font-medium">Gallery</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTemplateGallery;
