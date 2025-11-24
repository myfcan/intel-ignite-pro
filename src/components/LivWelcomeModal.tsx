import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LivWelcomeModalProps {
  onClose: () => void;
}

export const LivWelcomeModal = ({ onClose }: LivWelcomeModalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Verificar se já mostrou a Liv (chave global)
    const hasSeenLiv = localStorage.getItem('liv-welcome-shown');
    
    if (!hasSeenLiv) {
      // Delay para dar tempo da página carregar
      const timer = setTimeout(() => {
        setOpen(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    // Marcar como visto globalmente
    localStorage.setItem('liv-welcome-shown', 'true');
    setTimeout(onClose, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden border-none bg-transparent"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: `
              0 0 60px rgba(139, 92, 246, 0.3),
              0 0 100px rgba(139, 92, 246, 0.15),
              inset 0 0 80px rgba(139, 92, 246, 0.05)
            `
          }}
        >
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Purple Gradient Glow */}
          <div 
            className="absolute inset-x-0 bottom-0 h-64 opacity-30"
            style={{
              background: 'linear-gradient(to top, rgba(139, 92, 246, 0.6) 0%, transparent 100%)'
            }}
          />

          {/* Floating Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(167, 139, 250, 0.8) 0%, rgba(139, 92, 246, 0.3) 70%)',
                boxShadow: '0 0 10px rgba(167, 139, 250, 0.6)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}

          <div className="relative z-10 p-8 sm:p-10">
            {/* Avatar com Glow */}
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.8 
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                    width: '180px',
                    height: '180px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Avatar */}
                <div className="relative">
                  <img 
                    src="/liv-avatar.png" 
                    alt="Liv Avatar"
                    className="w-32 h-32 rounded-full border-4 border-purple-400/30 shadow-2xl"
                  />
                  
                  {/* Sparkle */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Texto de boas-vindas */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl font-bold mb-3 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Olá! Sou a Liv 👋
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Bem-vindo(a) ao seu primeiro contato com Inteligência Artificial! 
                Estou aqui para te guiar nessa jornada incrível de aprendizado. 🚀
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="text-2xl">💡</span>
                <span className="text-sm text-purple-300">
                  Vamos aprender algo incrível juntos!
                </span>
                <span className="text-2xl">✨</span>
              </motion.div>
            </motion.div>

            {/* Botão CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Button
                onClick={handleClose}
                className="w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #6366F1 0%, #A78BFA 50%, #EC4899 100%)',
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.5)';
                }}
              >
                Entendi, vamos começar! →
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
