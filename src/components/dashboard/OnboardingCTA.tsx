import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, ChevronRight } from 'lucide-react';

interface OnboardingCTAProps {
  /** Current active trail info, if any */
  activeTrail?: {
    id: string;
    title: string;
  } | null;
  /** Whether user has started any lesson */
  hasProgress: boolean;
  /** V8 trail ID — always the default destination */
  v8TrailId?: string | null;
}

export function OnboardingCTA({ activeTrail, hasProgress, v8TrailId }: OnboardingCTAProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (hasProgress && activeTrail) {
      navigate(`/trail/${activeTrail.id}`);
    } else if (v8TrailId) {
      navigate(`/v8-trail/${v8TrailId}`);
    } else {
      // Fallback: scroll to trails
      const el = document.getElementById('tour-trilhas');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const label = hasProgress && activeTrail
    ? `Continue: ${activeTrail.title}`
    : 'Comece sua primeira trilha';

  const sublabel = hasProgress && activeTrail
    ? 'Volte de onde parou'
    : 'Sua jornada começa aqui';

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-3 text-left transition-all active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, hsl(38 80% 55%), hsl(30 75% 52%))',
        boxShadow: '0 2px 12px hsl(38 80% 55% / 0.25)',
      }}
    >
      {/* Pulsing icon */}
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          <Rocket className="w-4.5 h-4.5 text-white" />
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
          animate={{ scale: [1, 1.25, 1.25], opacity: [0.4, 0, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[13px] truncate leading-tight">
          {label}
        </p>
        <p className="text-white/70 text-[11px] mt-0.5">
          {sublabel}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0" />
    </motion.button>
  );
}
