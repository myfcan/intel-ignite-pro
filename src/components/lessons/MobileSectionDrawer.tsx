import React from 'react';
import { List, Check, Play, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LivAvatar } from '@/components/LivAvatar';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface Section {
  id: string;
  title?: string;
  type?: string;
}

interface MobileSectionDrawerProps {
  sections: Section[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  isPlaying?: boolean;
}

export function MobileSectionDrawer({
  sections,
  currentSection,
  onSectionChange,
  isPlaying = false,
}: MobileSectionDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSectionClick = (index: number, isRenderable: boolean) => {
    if (!isRenderable) return;
    onSectionChange(index);
    setIsOpen(false);
  };

  const isSectionRenderable = (section: Section) => {
    return !section.type || section.type === 'text' || section.type === 'end-audio';
  };

  const isSpecialSection = (section: Section) => {
    return section.type === 'playground' || section.type === 'end-audio';
  };

  const completedSections = sections
    .slice(0, currentSection)
    .filter((s) => isSectionRenderable(s)).length;

  const totalRenderableSections = sections.filter((s) => isSectionRenderable(s)).length;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div
          className="fixed bottom-32 right-4 z-[60] flex flex-col items-center gap-3 touch-manipulation"
          aria-label="Navegação de seções"
        >
          {/* Liv Avatar em cima - com espaço do botão */}
          <div className="relative active:scale-95 transition-transform cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center shadow-xl border-2 border-white overflow-hidden"
              style={{
                boxShadow: '0 8px 24px rgba(34, 211, 238, 0.3), 0 4px 12px rgba(139, 92, 246, 0.2)',
              }}
            >
              <LivAvatar 
                size="small"
                isPlaying={isPlaying}
                showHalo={false}
                state={isPlaying ? 'speaking' : 'idle'}
                theme="fundamentos"
              />
            </div>
            {/* Indicador de playing - no topo esquerdo */}
            {isPlaying && (
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white" />
            )}
          </div>
          
          {/* Botão de lista com badge de seção */}
          <div className="relative">
            <button 
              className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              style={{
                boxShadow: '0 4px 16px rgba(34, 211, 238, 0.4), 0 2px 8px rgba(139, 92, 246, 0.3)',
              }}
            >
              <List className="w-5 h-5" />
            </button>
            {/* Badge de progresso no botão */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full text-[10px] font-bold text-purple-600 flex items-center justify-center shadow-lg border border-purple-200">
              {currentSection + 1}
            </span>
          </div>
        </div>
      </DrawerTrigger>

      <DrawerContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-cyan-500/30 max-h-[70vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-600 mb-4" />
        
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-white text-lg font-bold flex items-center justify-between">
            <span>Seções da Aula</span>
            <span className="text-sm font-normal text-cyan-400">
              {completedSections}/{totalRenderableSections}
            </span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 overflow-y-auto max-h-[50vh]">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sections.map((section, index) => {
                const isRenderable = isSectionRenderable(section);
                const isSpecial = isSpecialSection(section);
                const isCurrent = currentSection === index;
                const isPast = index < currentSection && isRenderable;
                const isFuture = index > currentSection;

                return (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSectionClick(index, isRenderable)}
                    disabled={!isRenderable}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 text-white shadow-lg'
                        : isPast
                        ? 'bg-slate-700/50 text-slate-300 border border-green-500/30'
                        : isSpecial
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : isFuture
                        ? 'bg-slate-800/50 text-slate-500 border border-slate-700'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700'
                    } ${!isRenderable ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                  >
                    {/* Indicador de estado */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        isCurrent
                          ? 'bg-gradient-to-br from-cyan-400 to-purple-500 text-white'
                          : isPast
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : isSpecial
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-4 h-4" />
                      ) : isCurrent && isPlaying ? (
                        <Play className="w-4 h-4" />
                      ) : isSpecial ? (
                        '🎮'
                      ) : isFuture && index > currentSection + 1 ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Título da seção */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isCurrent ? 'font-semibold' : ''}`}>
                        {section.title || `Seção ${index + 1}`}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-cyan-400 mt-0.5">
                          Reproduzindo agora
                        </p>
                      )}
                    </div>

                    {/* Indicador visual de progresso */}
                    {isPast && (
                      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    )}
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer com progresso visual */}
        <div className="px-4 pb-6">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            Toque em uma seção para navegar
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
