// V7PhaseSecretReveal - Fase de revelação do segredo com efeitos cinematográficos
// Features: 
// - Narração via ElevenLabs TTS
// - Efeito de explosão + interrogação gigante
// - Chuva de dinheiro
// - Botão "DESCOBRIR SEGREDO" como mini-quiz

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';

interface AudioControl {
  pause: () => void;
  play: () => void;
  togglePlayPause: () => void;
  isPlaying: boolean;
  fadeToVolume?: (volume: number, duration?: number) => Promise<void>;
  pauseWithFade?: (duration?: number) => Promise<void>;
  resumeWithFade?: (duration?: number) => Promise<void>;
}

interface V7PhaseSecretRevealProps {
  narrationText: string;
  pauseKeyword?: string; // Default: "10X mais inteligente"
  sceneIndex: number;
  onComplete?: () => void;
  onSecretClick?: () => void;
  audioControl?: AudioControl;
  isPausedByAnchor?: boolean;
}

// Componente de nota de dinheiro caindo
const FallingMoney = ({ delay, left }: { delay: number; left: number }) => (
  <motion.div
    className="absolute text-4xl sm:text-5xl pointer-events-none select-none"
    style={{ left: `${left}%`, top: '-10%' }}
    initial={{ y: 0, opacity: 0, rotate: 0 }}
    animate={{
      y: ['0vh', '120vh'],
      opacity: [0, 1, 1, 0.5, 0],
      rotate: [0, -20, 20, -10, 15, 0],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      delay: delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    💵
  </motion.div>
);

// Partículas de explosão douradas
const GoldParticle = ({ angle, distance }: { angle: number; distance: number }) => (
  <motion.div
    className="absolute w-3 h-3 rounded-full pointer-events-none"
    style={{
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      boxShadow: '0 0 10px #FFD700, 0 0 20px #FFA500',
      left: '50%',
      top: '50%',
    }}
    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
    animate={{
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
    }}
    transition={{ duration: 1.5, ease: 'easeOut' }}
  />
);

export const V7PhaseSecretReveal = ({
  narrationText,
  pauseKeyword = '10X mais inteligente',
  sceneIndex,
  onComplete,
  onSecretClick,
  audioControl,
  isPausedByAnchor = false,
}: V7PhaseSecretRevealProps) => {
  const [showExplosion, setShowExplosion] = useState(false);
  const [showQuestionMark, setShowQuestionMark] = useState(false);
  const [showMoneyRain, setShowMoneyRain] = useState(false);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [particles, setParticles] = useState<{ angle: number; distance: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  // Gerar narração via ElevenLabs e tocar
  const startNarration = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsNarrating(true);

    try {
      console.log('[V7PhaseSecretReveal] 🎤 Gerando narração via ElevenLabs...');
      
      // Pausar narração principal
      if (audioControl?.pauseWithFade) {
        await audioControl.pauseWithFade(500);
      } else {
        audioControl?.pause();
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-contextual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: narrationText,
            whisper: false, // Voz normal
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao gerar áudio');
      }

      const data = await response.json();
      
      if (data.audioBase64) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.volume = 0.9;

        // Iniciar efeitos visuais quando o áudio começar
        audio.onplay = () => {
          console.log('[V7PhaseSecretReveal] 🔊 Narração iniciada - disparando efeitos');
          triggerExplosion();
        };

        // Quando terminar, mostrar o botão
        audio.onended = () => {
          console.log('[V7PhaseSecretReveal] ✅ Narração concluída');
          setIsNarrating(false);
          setShowSecretButton(true);
        };

        await audio.play();
      }
    } catch (error) {
      console.error('[V7PhaseSecretReveal] ❌ Erro na narração:', error);
      setIsNarrating(false);
      // Fallback: mostrar efeitos mesmo sem áudio
      triggerExplosion();
      setTimeout(() => setShowSecretButton(true), 5000);
    }
  }, [narrationText, audioControl]);

  // Disparar efeitos visuais de explosão
  const triggerExplosion = useCallback(() => {
    // Explosão de confetti dourado
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5, x: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FFDF00', '#FFE135', '#D4AF37'],
      startVelocity: 45,
      gravity: 0.8,
    });

    // Mostrar interrogação gigante
    setShowExplosion(true);
    setShowQuestionMark(true);

    // Gerar partículas de explosão
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      angle: (i / 30) * Math.PI * 2,
      distance: 200 + Math.random() * 100,
    }));
    setParticles(newParticles);

    // Iniciar chuva de dinheiro após 1s
    setTimeout(() => {
      setShowMoneyRain(true);
    }, 1000);

    // Segunda explosão de confetti
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#32CD32', '#00C853'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#32CD32', '#00C853'],
      });
    }, 500);
  }, []);

  // Iniciar quando a cena começar
  useEffect(() => {
    if (sceneIndex >= 0 && !hasStartedRef.current) {
      const timer = setTimeout(() => {
        startNarration();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex, startNarration]);

  // Verificar anchorText para pausar
  useEffect(() => {
    if (isPausedByAnchor && !showSecretButton) {
      console.log('[V7PhaseSecretReveal] ⏸️ Pausado por anchorText - mostrando botão');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setShowSecretButton(true);
    }
  }, [isPausedByAnchor, showSecretButton]);

  // Handler do clique no botão
  const handleSecretClick = useCallback(() => {
    console.log('[V7PhaseSecretReveal] 🔓 DESCOBRIR SEGREDO clicked!');
    
    // Explosão final
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00FF00', '#00D4FF', '#FF00FF', '#FFFFFF'],
      startVelocity: 60,
    });

    // Retomar narração principal se necessário
    if (audioControl?.resumeWithFade) {
      audioControl.resumeWithFade(500);
    } else {
      audioControl?.play();
    }

    onSecretClick?.();
    onComplete?.();
  }, [audioControl, onSecretClick, onComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Gerar notas de dinheiro
  const moneyNotes = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    left: Math.random() * 100,
  }));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow dourado */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: showExplosion ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.3) 0%, transparent 60%)',
        }}
      />

      {/* Partículas de explosão */}
      <AnimatePresence>
        {showExplosion && particles.map((p, i) => (
          <GoldParticle key={i} angle={p.angle} distance={p.distance} />
        ))}
      </AnimatePresence>

      {/* Chuva de dinheiro */}
      <AnimatePresence>
        {showMoneyRain && moneyNotes.map((note) => (
          <FallingMoney key={note.id} delay={note.delay} left={note.left} />
        ))}
      </AnimatePresence>

      {/* Ponto de interrogação gigante */}
      <AnimatePresence>
        {showQuestionMark && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 0.8,
            }}
          >
            {/* Interrogação */}
            <motion.div
              className="text-[30vw] sm:text-[25vw] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
              }}
              animate={{
                scale: [1, 1.05, 1],
                filter: [
                  'drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
                  'drop-shadow(0 0 100px rgba(255, 215, 0, 1))',
                  'drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ?
            </motion.div>

            {/* Texto "SEGREDO" */}
            <motion.h2
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.3em] mt-4"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFFFFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              SEGREDO
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão DESCOBRIR SEGREDO */}
      <AnimatePresence>
        {showSecretButton && (
          <motion.button
            className="absolute z-50 px-12 py-8 rounded-2xl text-2xl sm:text-3xl md:text-4xl font-black tracking-wide cursor-pointer border-0"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
              boxShadow: '0 0 40px rgba(255, 165, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.4), 0 10px 40px rgba(0, 0, 0, 0.4)',
              color: '#1a1a1a',
            }}
            initial={{ scale: 0, y: 100 }}
            animate={{
              scale: 1,
              y: 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 60px rgba(255, 165, 0, 0.8), 0 0 120px rgba(255, 215, 0, 0.6), 0 15px 50px rgba(0, 0, 0, 0.5)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            onClick={handleSecretClick}
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 10px rgba(255, 255, 255, 0.5)',
                  '0 0 20px rgba(255, 255, 255, 0.8)',
                  '0 0 10px rgba(255, 255, 255, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔓 DESCOBRIR SEGREDO
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Indicador de carregamento */}
      <AnimatePresence>
        {isNarrating && !showSecretButton && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 text-white/60">
              <motion.div
                className="w-2 h-2 rounded-full bg-yellow-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-sm">Ouça com atenção...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default V7PhaseSecretReveal;
