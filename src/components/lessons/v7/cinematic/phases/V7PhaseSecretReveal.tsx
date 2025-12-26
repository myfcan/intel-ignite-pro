// V7PhaseSecretReveal - Fase de revelação do segredo com efeitos cinematográficos
// FLUXO COMPLETO:
// Etapa 1: Narração via ElevenLabs TTS ("Agora vou te mostrar o segredo dos 2%...")
// Etapa 2: Efeitos visuais (explosão → interrogação + SEGREDO → chuva de dinheiro)
// Etapa 3: Anchor text em "inteligente" → Tela MÉTODO PERFEITO com botão

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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
  narrationAudioUrl?: string; // ✅ V7-v6: URL do áudio pré-gerado (se disponível)
  pauseKeyword?: string;
  sceneIndex: number;
  onComplete?: () => void;
  onSecretClick?: () => void;
  audioControl?: AudioControl;
  isPausedByAnchor?: boolean;
}

// Componente de nota de dinheiro caindo
// ✅ V7-v8: Animação mais lenta e fluida
const FallingMoney = ({ delay, left }: { delay: number; left: number }) => (
  <motion.div
    className="absolute text-4xl sm:text-5xl pointer-events-none select-none"
    style={{ left: `${left}%`, top: '-10%' }}
    initial={{ y: 0, opacity: 0, rotate: 0 }}
    animate={{
      y: ['0vh', '120vh'],
      opacity: [0, 1, 1, 1, 0.7, 0],
      rotate: [0, -15, 15, -10, 10, 0],
    }}
    transition={{
      // ✅ Duração mais longa para movimento mais fluido
      duration: 6 + Math.random() * 3,
      delay: delay,
      repeat: Infinity,
      ease: 'easeInOut', // ✅ Easing mais suave
    }}
  >
    💵
  </motion.div>
);

// Partículas de explosão douradas
const GoldParticle = ({ angle, distance, delay = 0 }: { angle: number; distance: number; delay?: number }) => (
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
    transition={{ duration: 1.5, ease: 'easeOut', delay }}
  />
);

// ✅ V7-v21: Partículas flutuantes douradas contínuas
const FloatingGoldSparkle = ({ delay, left, top }: { delay: number; left: number; top: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${left}%`, top: `${top}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1.5, 1, 0],
      y: [-20, -60],
      rotate: [0, 180],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <span className="text-xl sm:text-2xl">✨</span>
  </motion.div>
);

// ✅ V7-v21: Anel de energia pulsante
const EnergyRing = ({ size, delay }: { size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
      border: '2px solid rgba(255, 215, 0, 0.6)',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
    }}
    initial={{ scale: 0, opacity: 1 }}
    animate={{
      scale: [0, 2, 3],
      opacity: [0.8, 0.4, 0],
    }}
    transition={{
      duration: 2.5,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

export const V7PhaseSecretReveal = ({
  narrationText,
  narrationAudioUrl, // ✅ V7-v6: URL do áudio pré-gerado
  pauseKeyword = '10X mais inteligente',
  sceneIndex,
  onComplete,
  onSecretClick,
  audioControl,
  isPausedByAnchor = false,
}: V7PhaseSecretRevealProps) => {
  // Estados das etapas - V7-v20: Inicia em 'effects' para mostrar cinematografia imediatamente
  const [currentStage, setCurrentStage] = useState<'loading' | 'narrating' | 'effects' | 'method-screen'>('effects');
  
  // Estados visuais - V7-v20: Efeitos iniciam TRUE para cinematografia imediata
  const [showExplosion, setShowExplosion] = useState(true);
  const [showQuestionMark, setShowQuestionMark] = useState(true);
  const [showMoneyRain, setShowMoneyRain] = useState(false);
  const [showMethodScreen, setShowMethodScreen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [particles, setParticles] = useState<{ angle: number; distance: number }[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [audioLoading, setAudioLoading] = useState(true); // Novo: loading separado do stage visual
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);
  const hasPausedMainAudioRef = useRef(false);

  // ✅ V7-v17: Reset state quando sceneIndex muda (ex: navegação para trás)
  useEffect(() => {
    // Quando o componente é remontado ou sceneIndex muda para -1 e volta, resetar
    return () => {
      hasStartedRef.current = false;
      hasPausedMainAudioRef.current = false;
    };
  }, []);

  // ✅ CRÍTICO: Pausar áudio principal IMEDIATAMENTE ao entrar na fase
  useEffect(() => {
    if (!hasPausedMainAudioRef.current && audioControl) {
      console.log('[V7PhaseSecretReveal] ⏸️ ENTRADA NA FASE - Pausando áudio principal IMEDIATAMENTE');
      hasPausedMainAudioRef.current = true;
      
      if (audioControl.pauseWithFade) {
        audioControl.pauseWithFade(300);
      } else {
        audioControl.pause();
      }
    }
  }, [audioControl]);

  // ETAPA 2: Disparar efeitos visuais de explosão (MOVIDO para antes de startNarration)
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

    // ✅ V7-v8: Iniciar chuva de dinheiro após 2.5s (mais devagar/fluido)
    setTimeout(() => {
      setShowMoneyRain(true);
    }, 2500);

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

  // ETAPA 3: Transição para tela do MÉTODO PERFEITO (MOVIDO para antes de startNarration)
  const transitionToMethodScreen = useCallback(() => {
    console.log('[V7PhaseSecretReveal] 🏆 ETAPA 3: Mostrando tela MÉTODO PERFEITO');
    setCurrentStage('method-screen');
    
    // Fade out dos efeitos anteriores
    setTimeout(() => {
      setShowQuestionMark(false);
      setShowMoneyRain(false);
    }, 300);
    
    // Mostrar tela do método
    setTimeout(() => {
      setShowMethodScreen(true);
    }, 500);
  }, []);

  // ETAPA 1 + 2: Gerar narração via ElevenLabs e disparar efeitos
  const startNarration = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsNarrating(true);
    setAudioLoading(true);

    // ✅ V7-v20: Disparar efeitos imediatamente (não esperar áudio)
    triggerExplosion();

    try {
      // Garantir que o áudio principal está pausado
      if (audioControl && !hasPausedMainAudioRef.current) {
        if (audioControl.pauseWithFade) {
          await audioControl.pauseWithFade(300);
        } else {
          audioControl.pause();
        }
        hasPausedMainAudioRef.current = true;
      }

      let audioUrl: string;

      // ✅ V7-v6: Usar URL pré-gerada se disponível
      if (narrationAudioUrl) {
        console.log('[V7PhaseSecretReveal] 🎤 ETAPA 1: Usando áudio PRÉ-GERADO do banco');
        audioUrl = narrationAudioUrl;
        setLoadingProgress(90);
      } else {
        console.log('[V7PhaseSecretReveal] 🎤 ETAPA 1: Gerando narração via ElevenLabs...');
        console.log('[V7PhaseSecretReveal] 📝 Texto:', narrationText.substring(0, 60) + '...');
        setLoadingProgress(30);

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
              whisper: false,
            }),
          }
        );

        setLoadingProgress(70);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[V7PhaseSecretReveal] ❌ Erro na API:', response.status, errorText);
          throw new Error(`Falha ao gerar áudio: ${response.status}`);
        }

        const data = await response.json();
        setLoadingProgress(90);
        
        if (!data.audioBase64) {
          throw new Error('Nenhum áudio retornado');
        }
        
        audioUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
      }

      console.log('[V7PhaseSecretReveal] ✅ Áudio pronto, iniciando reprodução...');
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.volume = 1.0; // ✅ Volume máximo para narração principal

      // ETAPA 2: Áudio pronto - efeitos já estão rodando
      audio.onplay = () => {
        console.log('[V7PhaseSecretReveal] 🎆 ETAPA 2: Áudio iniciado, efeitos já em andamento');
        setCurrentStage('narrating');
        setAudioLoading(false);
        setLoadingProgress(100);
      };

      audio.onerror = (e) => {
        console.error('[V7PhaseSecretReveal] ❌ Erro ao tocar áudio:', e);
        setAudioLoading(false);
        setTimeout(() => transitionToMethodScreen(), 4000);
      };

      audio.onended = () => {
        console.log('[V7PhaseSecretReveal] ✅ Narração concluída - indo para ETAPA 3');
        setIsNarrating(false);
        transitionToMethodScreen();
      };

      await audio.play();
      setCurrentStage('narrating');
    } catch (error) {
      console.error('[V7PhaseSecretReveal] ❌ Erro na narração:', error);
      setIsNarrating(false);
      setAudioLoading(false);
      setTimeout(() => transitionToMethodScreen(), 4000);
    }
  }, [narrationText, narrationAudioUrl, audioControl, triggerExplosion, transitionToMethodScreen]);

  // Iniciar quando a cena começar
  useEffect(() => {
    if (sceneIndex >= 0 && !hasStartedRef.current) {
      const timer = setTimeout(() => {
        startNarration();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex, startNarration]);

  // Verificar anchorText para ir direto para ETAPA 3
  useEffect(() => {
    if (isPausedByAnchor && currentStage !== 'method-screen') {
      console.log('[V7PhaseSecretReveal] ⏸️ Anchor text detectado - indo para ETAPA 3');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      transitionToMethodScreen();
    }
  }, [isPausedByAnchor, currentStage, transitionToMethodScreen]);

  // Handler do clique no botão "Quero descobrir agora"
  const handleDiscoverClick = useCallback(async () => {
    console.log('[V7PhaseSecretReveal] 🔓 "Quero descobrir agora" clicked!');
    
    // Explosão final de celebração
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00FF00', '#00D4FF', '#FF00FF', '#FFFFFF'],
      startVelocity: 60,
    });

    // ✅ V7-v17: Retomar narração principal CORRETAMENTE
    // O resumeWithFade espera que o áudio esteja pausado, então usamos isso
    if (audioControl?.resumeWithFade) {
      await audioControl.resumeWithFade(500);
      console.log('[V7PhaseSecretReveal] ▶️ Áudio retomado com fade');
    } else if (audioControl?.play) {
      audioControl.play();
      console.log('[V7PhaseSecretReveal] ▶️ Áudio retomado direto');
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
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden pb-28">
      {/* Estado de loading enquanto gera áudio */}
      <AnimatePresence>
        {currentStage === 'loading' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ✅ V7-v9: Gift box opening animation instead of crystal ball */}
            <motion.div
              className="text-6xl mb-6 relative"
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: [0.8, 1.1, 1],
              }}
              transition={{ duration: 0.6 }}
            >
              {/* Gift box base */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                🎁
              </motion.div>
              {/* Sparkles around gift */}
              <motion.div
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                  rotate: [0, 15, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-2 text-xl"
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              >
                ⭐
              </motion.div>
            </motion.div>
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-white/90 mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparando algo especial...
            </motion.h2>
            <motion.div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background glow dourado com múltiplas camadas */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showExplosion ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        {/* Camada 1: Glow central */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 50%)',
          }}
        />
        {/* Camada 2: Glow externo */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 165, 0, 0.2) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* ✅ V7-v21: Anéis de energia pulsantes */}
      <AnimatePresence>
        {showExplosion && !showMethodScreen && (
          <>
            <EnergyRing size={100} delay={0} />
            <EnergyRing size={100} delay={0.5} />
            <EnergyRing size={100} delay={1} />
            <EnergyRing size={100} delay={1.5} />
          </>
        )}
      </AnimatePresence>

      {/* ✅ V7-v21: Partículas flutuantes douradas */}
      <AnimatePresence>
        {showExplosion && !showMethodScreen && (
          <>
            {Array.from({ length: 15 }, (_, i) => (
              <FloatingGoldSparkle
                key={`sparkle-${i}`}
                delay={i * 0.2}
                left={10 + (i * 6) % 80}
                top={20 + (i * 7) % 60}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Partículas de explosão */}
      <AnimatePresence>
        {showExplosion && particles.map((p, i) => (
          <GoldParticle key={i} angle={p.angle} distance={p.distance} delay={i * 0.02} />
        ))}
      </AnimatePresence>

      {/* Chuva de dinheiro (ETAPA 2) */}
      <AnimatePresence>
        {showMoneyRain && !showMethodScreen && moneyNotes.map((note) => (
          <FallingMoney key={note.id} delay={note.delay} left={note.left} />
        ))}
      </AnimatePresence>

      {/* Ponto de interrogação gigante + SEGREDO (ETAPA 2) */}
      <AnimatePresence>
        {showQuestionMark && !showMethodScreen && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            {/* ✅ V7-v21: Glow atrás da interrogação */}
            <motion.div
              className="absolute w-[50vw] h-[50vw] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Interrogação gigante */}
            <motion.div
              className="text-[30vw] sm:text-[25vw] font-black leading-none select-none relative z-10"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
              }}
              animate={{
                scale: [1, 1.08, 1],
                rotate: [-2, 2, -2],
                filter: [
                  'drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
                  'drop-shadow(0 0 120px rgba(255, 215, 0, 1))',
                  'drop-shadow(0 0 60px rgba(255, 215, 0, 0.8))',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ?
            </motion.div>

            {/* ✅ V7-v21: Texto "SEGREDO" com efeito glitch/pulsante */}
            <motion.div className="relative mt-6">
              {/* Camada de sombra/glow */}
              <motion.h2
                className="absolute inset-0 text-3xl sm:text-5xl md:text-7xl font-black tracking-[0.3em] blur-sm"
                style={{ color: '#FFD700' }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                SEGREDO
              </motion.h2>
              
              {/* Texto principal */}
              <motion.h2
                className="relative text-3xl sm:text-5xl md:text-7xl font-black tracking-[0.3em]"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFFFFF 50%, #FFD700 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ y: 40, opacity: 0, scale: 0.8 }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  scale: 1,
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  y: { delay: 0.5, duration: 0.6, ease: 'easeOut' },
                  opacity: { delay: 0.5, duration: 0.6 },
                  scale: { delay: 0.5, duration: 0.6, ease: 'easeOut' },
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                }}
              >
                SEGREDO
              </motion.h2>
            </motion.div>

            {/* ✅ V7-v21: Subtítulo animado */}
            <motion.p
              className="text-lg sm:text-xl text-white/70 mt-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              O que os <span className="text-yellow-400 font-bold">2%</span> sabem
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ETAPA 3: Tela MÉTODO PERFEITO */}
      <AnimatePresence>
        {showMethodScreen && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-50 px-6 pb-28"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Background gradient para a tela */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
              }}
            />

            {/* Título principal: MÉTODO PERFEITO */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl font-black text-center mb-4 relative z-10"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(255, 165, 0, 0.6))',
              }}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              MÉTODO PERFEITO
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl text-white/90 font-medium text-center mb-8 relative z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              O segredo que os <span className="text-yellow-400 font-bold">2%</span> dominam!
            </motion.p>

            {/* Frase de pergunta */}
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/80 text-center mb-12 italic relative z-10"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Quer <span className="text-yellow-400 font-semibold">DESCOBRIR</span> esse <span className="text-yellow-400 font-semibold">SEGREDO</span>?
            </motion.p>

            {/* Botão principal com efeito de piscar */}
            <motion.button
              className="relative px-10 py-6 sm:px-14 sm:py-8 rounded-2xl text-xl sm:text-2xl md:text-3xl font-black tracking-wide cursor-pointer border-0 overflow-hidden z-10"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
                color: '#1a1a1a',
              }}
              initial={{ scale: 0, y: 50 }}
              animate={{ 
                scale: 1, 
                y: 0,
                boxShadow: [
                  '0 0 40px rgba(255, 165, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.4), 0 10px 40px rgba(0, 0, 0, 0.4)',
                  '0 0 80px rgba(255, 165, 0, 1), 0 0 150px rgba(255, 215, 0, 0.8), 0 15px 50px rgba(0, 0, 0, 0.5)',
                  '0 0 40px rgba(255, 165, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.4), 0 10px 40px rgba(0, 0, 0, 0.4)',
                ],
              }}
              whileHover={{
                scale: 1.08,
                boxShadow: '0 0 100px rgba(255, 165, 0, 1), 0 0 180px rgba(255, 215, 0, 0.9), 0 20px 60px rgba(0, 0, 0, 0.6)',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                delay: 0.8,
                type: 'spring',
                stiffness: 300,
                damping: 20,
                boxShadow: {
                  delay: 1.2,
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              onClick={handleDiscoverClick}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              
              {/* ✅ Blink overlay effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  delay: 1.5,
                  duration: 0.4,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: 'easeInOut',
                }}
              />
              
              <span className="relative z-10 flex items-center gap-3">
                🚀 Quero descobrir agora
              </span>
            </motion.button>

            {/* Partículas decorativas flutuando */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400/40"
                style={{
                  left: `${15 + (i * 10)}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de carregamento durante narração */}
      <AnimatePresence>
        {isNarrating && !showMethodScreen && (
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
