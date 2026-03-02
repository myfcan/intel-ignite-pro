import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface V8LivTrailWelcomeProps {
  trailId: string;
  trailTitle: string;
  onContinue: () => void;
}

export const V8LivTrailWelcome = ({ trailId, trailTitle, onContinue }: V8LivTrailWelcomeProps) => {
  const storageKey = `liv-trail-welcome-${trailId}`;
  const [open, setOpen] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      const showTimer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(showTimer);
    }
  }, [storageKey]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setButtonEnabled(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleContinue = () => {
    localStorage.setItem(storageKey, 'true');
    setOpen(false);
    setTimeout(onContinue, 300);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden border-none bg-transparent"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.3), 0 0 100px rgba(139, 92, 246, 0.15), inset 0 0 80px rgba(139, 92, 246, 0.05)',
          }}
        >
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Purple glow */}
          <div
            className="absolute inset-x-0 bottom-0 h-64 opacity-30"
            style={{ background: 'linear-gradient(to top, rgba(139,92,246,0.6) 0%, transparent 100%)' }}
          />

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(167,139,250,0.8) 0%, rgba(139,92,246,0.3) 70%)',
                boxShadow: '0 0 10px rgba(167,139,250,0.6)',
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{ y: [0, -25, 0], opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            />
          ))}

          <div className="relative z-10 p-8 sm:p-10">
            {/* Avatar */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)',
                    width: '160px', height: '160px',
                    left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                  }}
                />
                <div className="relative">
                  <img src="/liv-avatar.png" alt="Liv" className="w-28 h-28 rounded-full border-4 border-purple-400/30 shadow-2xl" />
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                Oi! Sou a Liv 👋
              </h2>
              <p className="text-gray-300 text-base leading-relaxed max-w-md mx-auto">
                Que bom te ver aqui na trilha <strong className="text-purple-300">{trailTitle}</strong>!
                Preparei tudo com carinho pra você aprender no seu ritmo. 🚀
              </p>
              <motion.div
                className="flex items-center justify-center gap-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="text-xl">💡</span>
                <span className="text-sm text-purple-300">Vamos aprender algo incrível juntos!</span>
                <span className="text-xl">✨</span>
              </motion.div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Button
                onClick={handleContinue}
                disabled={!buttonEnabled}
                className="w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: buttonEnabled
                    ? 'linear-gradient(90deg, #6366F1 0%, #A78BFA 50%, #EC4899 100%)'
                    : 'linear-gradient(90deg, #4B5563 0%, #6B7280 100%)',
                  boxShadow: buttonEnabled ? '0 0 30px rgba(139,92,246,0.5)' : 'none',
                }}
              >
                {buttonEnabled ? 'Vamos lá! →' : 'Leia com carinho...'}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
