'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, FileText, GraduationCap, Building, Copy, CheckCircle } from 'lucide-react';

interface CardEffectTemplateGalleryProps {
  isActive?: boolean;
}

export const CardEffectTemplateGallery: React.FC<CardEffectTemplateGalleryProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const templates = [
    { icon: Building, name: 'Condomínio', items: ['Atas', 'Comunicados', 'Regras'] },
    { icon: GraduationCap, name: 'Professores', items: ['Planos', 'Exercícios', 'Avaliações'] },
    { icon: FileText, name: 'Negócios', items: ['Descrições', 'Posts', 'E-mails'] },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1200),
      setTimeout(() => setSelectedTemplate(0), 2000),
      setTimeout(() => setSelectedTemplate(1), 3000),
      setTimeout(() => setSelectedTemplate(2), 4000),
      setTimeout(() => setScene(3), 5500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900 border border-violet-500/30">
      {/* Grid de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)',
          backgroundSize: '25px 25px'
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
          <h3 className="text-base font-bold text-white mb-1">Galeria de Templates</h3>
          <p className="text-[10px] text-violet-300">Modelos prontos para usar</p>
        </motion.div>

        {/* Grid de templates */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          {templates.map((template, index) => {
            const isSelected = selectedTemplate === index;
            const Icon = template.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isSelected ? 1.05 : 1,
                }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-2 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-violet-500/30 border border-violet-400/50'
                    : 'bg-slate-800/50 border border-slate-700/30'
                }`}
              >
                <motion.div
                  animate={{
                    boxShadow: isSelected ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                  }}
                  className="flex flex-col items-center"
                >
                  <Icon className={`w-6 h-6 mb-1 ${isSelected ? 'text-violet-300' : 'text-slate-500'}`} />
                  <span className={`text-[9px] font-medium ${isSelected ? 'text-violet-300' : 'text-slate-500'}`}>
                    {template.name}
                  </span>
                </motion.div>

                {/* Items do template */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 space-y-0.5"
                    >
                      {template.items.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-[7px] text-violet-400/70 flex items-center gap-0.5"
                        >
                          <div className="w-1 h-1 rounded-full bg-violet-400" />
                          {item}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Indicador de seleção */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Preview do template selecionado */}
        <AnimatePresence>
          {selectedTemplate !== null && scene >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-xs mt-3 bg-slate-800/50 border border-violet-400/30 rounded-lg p-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-violet-300 font-medium">
                  Template: {templates[selectedTemplate].name}
                </span>
                <div className="flex items-center gap-1 text-[8px] text-violet-400">
                  <Copy className="w-3 h-3" />
                  <span>Usar</span>
                </div>
              </div>
              <div className="h-8 bg-violet-500/10 rounded border border-violet-400/20 flex items-center justify-center">
                <span className="text-[8px] text-violet-400/70">Pronto para personalizar</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 rounded-lg px-3 py-1.5"
            >
              <Layout className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium">
                +50 templates disponíveis!
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
                backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-violet-500/20 border border-violet-400/30 rounded-full px-2 py-0.5"
      >
        <Layout className="w-3 h-3 text-violet-400" />
        <span className="text-[9px] text-violet-300 font-medium">Gallery</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTemplateGallery;
