/**
 * V7PerfeitoDragDrop - Exercício Drag-and-Drop para o método PERFEITO
 * Arrastar cada significado para a letra correta
 * 
 * P = Persona
 * E = Estrutura
 * R = Resultado
 * F = Formato
 * E = Exemplos
 * I = Iteração
 * T = Tom
 * O = Otimização
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Check, X, GripHorizontal, Trophy, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useV7SoundEffects } from '../useV7SoundEffects';

interface PerfeitoItem {
  id: string;
  letter: string;
  meaning: string;
  position: number;
}

interface V7PerfeitoDragDropProps {
  onComplete: (score: number, total: number) => void;
}

const PERFEITO_DATA: PerfeitoItem[] = [
  { id: 'p', letter: 'P', meaning: 'Persona', position: 0 },
  { id: 'e1', letter: 'E', meaning: 'Estrutura', position: 1 },
  { id: 'r', letter: 'R', meaning: 'Resultado', position: 2 },
  { id: 'f', letter: 'F', meaning: 'Formato', position: 3 },
  { id: 'e2', letter: 'E', meaning: 'Exemplos', position: 4 },
  { id: 'i', letter: 'I', meaning: 'Iteração', position: 5 },
  { id: 't', letter: 'T', meaning: 'Tom', position: 6 },
  { id: 'o', letter: 'O', meaning: 'Otimização', position: 7 },
];

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const V7PerfeitoDragDrop = ({ onComplete }: V7PerfeitoDragDropProps) => {
  // Sound effects
  const { playSound, unlockAudio } = useV7SoundEffects(0.6, true);
  
  // Slots state: which meaning id is in each slot (null if empty)
  const [slots, setSlots] = useState<(string | null)[]>(Array(8).fill(null));
  // Available draggable cards (shuffled meanings)
  const [availableCards, setAvailableCards] = useState<PerfeitoItem[]>(() => 
    shuffleArray(PERFEITO_DATA)
  );
  // Feedback state for each slot: 'correct' | 'incorrect' | null
  const [slotFeedback, setSlotFeedback] = useState<(string | null)[]>(Array(8).fill(null));
  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  // Touch state for mobile
  const [touchDragging, setTouchDragging] = useState<string | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  // Animation state
  const [isEntering, setIsEntering] = useState(true);
  const [lastPlacedSlot, setLastPlacedSlot] = useState<number | null>(null);

  // Unlock audio on mount
  useEffect(() => {
    unlockAudio();
    // Entrance animation complete after delay
    const timer = setTimeout(() => setIsEntering(false), 1000);
    return () => clearTimeout(timer);
  }, [unlockAudio]);

  const launchConfetti = useCallback(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
    
    // Play completion sound
    playSound('completion');
  }, [playSound]);

  const checkAllCorrect = useCallback((currentSlots: (string | null)[]) => {
    const allFilled = currentSlots.every((s) => s !== null);
    if (!allFilled) return;

    let correctCount = 0;
    const newFeedback: (string | null)[] = [];

    currentSlots.forEach((slotItemId, index) => {
      const correctItem = PERFEITO_DATA[index];
      const isCorrect = slotItemId === correctItem.id;
      newFeedback.push(isCorrect ? 'correct' : null);
      if (isCorrect) correctCount++;
    });

    if (correctCount === 8) {
      setSlotFeedback(newFeedback);
      setScore(correctCount);
      setIsComplete(true);
      launchConfetti();
    }
  }, [launchConfetti]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(itemId);
    playSound('click-soft');
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    // Check if slot is already filled
    if (slots[slotIndex] !== null) {
      // Shake animation feedback
      playSound('error');
      const newFeedback = [...slotFeedback];
      newFeedback[slotIndex] = 'shake';
      setSlotFeedback(newFeedback);
      setTimeout(() => {
        const resetFeedback = [...newFeedback];
        resetFeedback[slotIndex] = null;
        setSlotFeedback(resetFeedback);
      }, 500);
      setDragOverSlot(null);
      setDraggingId(null);
      return;
    }

    // Get the correct item for this slot
    const correctItem = PERFEITO_DATA[slotIndex];
    const isCorrect = itemId === correctItem.id;

    if (isCorrect) {
      // 🎯 Play satisfying snap sound + ascending sparkle based on progress
      const filledCount = slots.filter(s => s !== null).length;
      playSound('snap-success'); // Som de encaixe satisfatório
      playSound('letter-reveal', { pitch: filledCount }); // Tom mais agudo conforme progresso
      
      // Place the card in the slot
      const newSlots = [...slots];
      newSlots[slotIndex] = itemId;
      setSlots(newSlots);
      setLastPlacedSlot(slotIndex);

      // Remove from available cards
      setAvailableCards((prev) => prev.filter((c) => c.id !== itemId));

      // Show correct feedback
      const newFeedback = [...slotFeedback];
      newFeedback[slotIndex] = 'correct';
      setSlotFeedback(newFeedback);

      // Clear last placed after animation
      setTimeout(() => setLastPlacedSlot(null), 800);

      // Check if all correct
      checkAllCorrect(newSlots);
    } else {
      // ❌ Play error snap sound - clear but not aggressive
      playSound('snap-error');
      
      // Show incorrect feedback and return card
      const newFeedback = [...slotFeedback];
      newFeedback[slotIndex] = 'incorrect';
      setSlotFeedback(newFeedback);
      setTimeout(() => {
        const resetFeedback = [...newFeedback];
        resetFeedback[slotIndex] = null;
        setSlotFeedback(resetFeedback);
      }, 600);
    }

    setDragOverSlot(null);
    setDraggingId(null);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setTouchDragging(itemId);
    playSound('click-soft');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = element?.closest('[data-slot-index]');
    
    if (slotElement) {
      const slotIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
      if (slotIndex >= 0) {
        setDragOverSlot(slotIndex);
      }
    } else {
      setDragOverSlot(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDragging) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = element?.closest('[data-slot-index]');

    if (slotElement) {
      const slotIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
      if (slotIndex >= 0) {
        // Simulate drop
        const fakeEvent = {
          preventDefault: () => {},
          dataTransfer: { getData: () => touchDragging }
        } as unknown as React.DragEvent;
        handleDrop(fakeEvent, slotIndex);
      }
    }

    setTouchDragging(null);
    setDragOverSlot(null);
    touchStartPos.current = null;
  };

  const getSlotBorderColor = (index: number) => {
    const feedback = slotFeedback[index];
    if (feedback === 'correct') return 'border-green-500 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.5)]';
    if (feedback === 'incorrect' || feedback === 'shake') return 'border-red-500 bg-red-500/20 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    if (dragOverSlot === index) return 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-[1.02]';
    if (slots[index]) return 'border-green-500/50 bg-green-500/10';
    return 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10';
  };

  const getCardById = (id: string) => PERFEITO_DATA.find((item) => item.id === id);

  const handleContinue = () => {
    playSound('click-confirm');
    onComplete(score, 8);
  };

  return (
    <motion.div 
      className="w-full h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header - Compact with staggered entrance */}
      <motion.div
        className="text-center py-3 px-4 shrink-0"
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
        >
          <motion.span 
            className="text-base"
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            🧩
          </motion.span>
          <span className="text-xs font-bold text-purple-300">EXERCÍCIO FINAL</span>
        </motion.div>
        <motion.h2 
          className="text-base sm:text-lg font-bold text-white mb-0.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Monte o Método PERFEITO
        </motion.h2>
        <motion.p 
          className="text-white/60 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Arraste cada significado para a letra correta
        </motion.p>
      </motion.div>

      {/* Main content - Side by side layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 pb-3 min-h-0">
        {/* LEFT: PERFEITO slots - More compact */}
        <motion.div
          className="lg:flex-1 order-1 min-h-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1.5 text-center">
            Método PERFEITO
          </div>
          {/* 2-column grid for desktop, single column for mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 h-auto">
            {PERFEITO_DATA.map((item, index) => (
              <motion.div
                key={item.id}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200
                  ${getSlotBorderColor(index)}
                `}
                data-slot-index={index}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
              >
                {/* Letter badge - Smaller */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shrink-0
                  ${slots[index] 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  }
                `}>
                  {item.letter}
                </div>

                {/* Slot area - Compact */}
                <div className="flex-1 min-w-0 h-8 rounded-md bg-black/20 border border-dashed border-white/20 flex items-center justify-center px-2">
                  {slots[index] ? (
                    <motion.div
                      className="flex items-center gap-1 text-white font-medium text-xs truncate"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Check className="w-3 h-3 text-green-400 shrink-0" />
                      <span className="truncate">{getCardById(slots[index]!)?.meaning}</span>
                    </motion.div>
                  ) : (
                    <span className="text-white/30 text-xs">Arraste</span>
                  )}
                </div>

                {/* Feedback icon - Only show for correct */}
                <AnimatePresence>
                  {slotFeedback[index] === 'incorrect' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: Draggable cards - Horizontal wrap */}
        <motion.div
          className="lg:w-72 order-2 shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1.5 text-center">
            Significados
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <AnimatePresence mode="popLayout">
              {availableCards.map((item) => (
                <motion.div
                  key={item.id}
                  className={`
                    px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none
                    bg-gradient-to-r from-slate-700 to-slate-600 border border-white/20
                    text-white font-medium text-sm
                    hover:from-slate-600 hover:to-slate-500 hover:border-cyan-400/50
                    transition-colors touch-none
                    ${draggingId === item.id || touchDragging === item.id ? 'opacity-50 scale-95' : ''}
                  `}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-1.5">
                    <GripHorizontal className="w-3 h-3 text-white/40" />
                    <span>{item.meaning}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {availableCards.length === 0 && !isComplete && (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <p className="text-white/60 text-xs">Todos posicionados!</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-green-500/30 rounded-2xl p-8 max-w-md mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h3
                className="text-2xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                🎉 Perfeito!
              </motion.h3>

              <motion.p
                className="text-white/70 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Você fixou o método PERFEITO!<br />
                <span className="text-green-400 font-bold">{score}/{8} corretas</span>
              </motion.p>

              <motion.button
                onClick={handleContinue}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continuar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </motion.div>
  );
};

export default V7PerfeitoDragDrop;
