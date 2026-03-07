import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: 'bottom' | 'top';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-trilhas',
    title: 'Suas Trilhas de Estudo',
    description: 'Aqui você encontra todas as trilhas. Cada uma te leva do zero ao domínio de IA.',
    position: 'bottom',
  },
  {
    targetId: 'tour-quick-access',
    title: 'Ferramentas Rápidas',
    description: 'Guia de bolso, Diretório de IA e Super Prompts — seus atalhos do dia a dia.',
    position: 'bottom',
  },
  {
    targetId: 'tour-missions',
    title: 'Missões Diárias',
    description: 'Complete missões todos os dias para ganhar pontos e manter sua sequência!',
    position: 'top',
  },
];

const STORAGE_KEY = 'ailiv_dashboard_tour_done';

interface DashboardTourProps {
  enabled: boolean;
}

export function DashboardTour({ enabled }: DashboardTourProps) {
  const [phase, setPhase] = useState<'idle' | 'prompt' | 'touring' | 'done'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, width: 0 });
  const [spotlightRect, setSpotlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setPhase('prompt'), 2000);
    return () => clearTimeout(timer);
  }, [enabled]);

  const updatePosition = useCallback(() => {
    if (phase !== 'touring') return;
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pad = 8;
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    const tooltipW = Math.min(320, window.innerWidth - 32);
    let tooltipLeft = rect.left + rect.width / 2 - tooltipW / 2;
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipW - 16));

    const tooltipTop = step.position === 'bottom'
      ? rect.bottom + 16
      : rect.top - 16;

    setTooltipPos({ top: tooltipTop, left: tooltipLeft, width: tooltipW });
  }, [phase, currentStep]);

  useEffect(() => {
    if (phase !== 'touring') return;

    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(updatePosition, 400);
    }

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phase, currentStep, updatePosition]);

  const startTour = () => setPhase('touring');
  const skipTour = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setPhase('done');
  };
  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, '1');
      setPhase('done');
    }
  };

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <AnimatePresence>
      {phase === 'prompt' && (
        <motion.div
          key="prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end justify-center pb-8 px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={skipTour}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-sm rounded-2xl p-5"
            style={{
              background: 'white',
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(258 90% 62%), hsl(239 84% 60%))' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[15px]" style={{ color: 'hsl(215 25% 9%)' }}>
                  Quer um tour rápido?
                </h3>
                <p className="text-[12px]" style={{ color: 'hsl(215 16% 47%)' }}>
                  30 segundos para conhecer o app
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={skipTour}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                style={{
                  background: 'hsl(220 14% 96%)',
                  color: 'hsl(215 16% 47%)',
                }}
              >
                Pular
              </button>
              <button
                onClick={startTour}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, hsl(258 90% 62%), hsl(239 84% 60%))',
                  boxShadow: '0 4px 12px hsl(258 90% 62% / 0.3)',
                }}
              >
                Vamos lá! 🚀
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {phase === 'touring' && (
        <motion.div
          key="touring"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
        >
          {/* Overlay with spotlight cutout using box-shadow */}
          <div
            className="absolute pointer-events-none"
            onClick={skipTour}
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              borderRadius: 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              pointerEvents: 'none',
              transition: 'all 0.4s ease',
              zIndex: 1,
            }}
          />
          {/* Clickable overlay behind spotlight */}
          <div
            className="absolute inset-0"
            onClick={skipTour}
            style={{ zIndex: 0 }}
          />

          {/* Spotlight ring */}
          <div
            className="absolute rounded-2xl pointer-events-none"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              border: '2px solid hsl(258 90% 70% / 0.6)',
              boxShadow: '0 0 24px hsl(258 90% 62% / 0.3)',
              transition: 'all 0.4s ease',
            }}
          />

          {/* Tooltip */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: TOUR_STEPS[currentStep].position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute rounded-2xl p-4"
            style={{
              top: TOUR_STEPS[currentStep].position === 'bottom' ? tooltipPos.top : 'auto',
              bottom: TOUR_STEPS[currentStep].position === 'top' ? `${window.innerHeight - tooltipPos.top}px` : 'auto',
              left: tooltipPos.left,
              width: tooltipPos.width,
              background: 'white',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              zIndex: 10000,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-[14px]" style={{ color: 'hsl(215 25% 9%)' }}>
                {TOUR_STEPS[currentStep].title}
              </h4>
              <button onClick={skipTour} className="p-1 -mr-1 -mt-1">
                <X className="w-4 h-4" style={{ color: 'hsl(215 16% 67%)' }} />
              </button>
            </div>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'hsl(215 16% 47%)' }}>
              {TOUR_STEPS[currentStep].description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentStep ? 20 : 8,
                      background: i === currentStep ? 'hsl(258 90% 62%)' : 'hsl(220 14% 90%)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-[12px] font-bold text-white active:scale-[0.96]"
                style={{
                  background: 'linear-gradient(135deg, hsl(258 90% 62%), hsl(239 84% 60%))',
                }}
              >
                {currentStep < TOUR_STEPS.length - 1 ? 'Próximo' : 'Concluir'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
