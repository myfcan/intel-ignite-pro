// V7ActInteraction - 100% Cinematic Quiz/Interaction Act
// Features: Animated checkboxes, ripple effects, instant feedback, sound triggers

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InteractionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  isDefault?: boolean;
}

interface V7ActInteractionProps {
  title: string;
  subtitle?: string;
  options: InteractionOption[];
  buttonText: string;
  onReveal: (selectedIds: string[], isCorrect: boolean) => void;
  allowMultiple?: boolean;
  showFeedback?: boolean;
  onSoundTrigger?: (type: "click" | "correct" | "wrong") => void;
}

export const V7ActInteraction = ({
  title,
  subtitle,
  options,
  buttonText,
  onReveal,
  allowMultiple = false,
  showFeedback = true,
  onSoundTrigger,
}: V7ActInteractionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    options.filter((o) => o.isDefault).map((o) => o.id)
  );
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add ripple effect
  const addRipple = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  const toggleOption = useCallback((id: string, e: React.MouseEvent) => {
    if (isRevealed) return;
    
    addRipple(e);
    onSoundTrigger?.("click");

    if (allowMultiple) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  }, [allowMultiple, isRevealed, addRipple, onSoundTrigger]);

  const handleReveal = useCallback(() => {
    // Calculate correctness
    const correctOptions = options.filter((o) => o.isCorrect);
    const selectedCorrectCount = selectedIds.filter((id) =>
      correctOptions.some((o) => o.id === id)
    ).length;

    const correct =
      correctOptions.length > 0
        ? selectedCorrectCount === correctOptions.length &&
          selectedIds.length === correctOptions.length
        : selectedIds.length > 0;

    setIsCorrect(correct);
    setIsRevealed(true);
    onSoundTrigger?.(correct ? "correct" : "wrong");
    onReveal(selectedIds, correct);
  }, [options, selectedIds, onReveal, onSoundTrigger]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-3xl">
        {/* Question Box */}
        <motion.div
          className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 sm:p-10 mb-6 sm:mb-8 
                     border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
            }}
            animate={{
              background: [
                "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                "linear-gradient(135deg, rgba(118, 75, 162, 0.1), rgba(102, 126, 234, 0.1))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />

          {/* Lightning icon */}
          <motion.div
            className="absolute top-4 right-4 text-3xl"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center mb-4 sm:mb-6 relative z-10">
            {title}
          </h2>

          {subtitle && (
            <p className="text-center text-white/60 mb-6 sm:mb-8 relative z-10">
              {subtitle}
            </p>
          )}

          {/* Options */}
          <div className="space-y-3 sm:space-y-4 relative z-10">
            {options.map((option, index) => {
              const isSelected = selectedIds.includes(option.id);
              const showCorrect = isRevealed && option.isCorrect;
              const showWrong = isRevealed && isSelected && !option.isCorrect;

              return (
                <motion.div
                  key={option.id}
                  className={`
                    relative bg-white/[0.02] border-2 rounded-xl p-4 sm:p-5 cursor-pointer
                    flex items-center gap-4 transition-colors overflow-hidden
                    ${isRevealed ? "pointer-events-none" : ""}
                    ${showCorrect
                      ? "border-[#4ecdc4] bg-[#4ecdc4]/10"
                      : showWrong
                        ? "border-[#ff6b6b] bg-[#ff6b6b]/10"
                        : isSelected
                          ? "border-[#667eea] bg-[#667eea]/10"
                          : "border-white/10 hover:border-white/30 hover:bg-white/[0.05]"
                    }
                  `}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={(e) => toggleOption(option.id, e)}
                  whileHover={{ x: isRevealed ? 0 : 4 }}
                  whileTap={{ scale: isRevealed ? 1 : 0.98 }}
                >
                  {/* Ripple container */}
                  {ripples.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="absolute rounded-full bg-white/20 pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, opacity: 0.5 }}
                      animate={{ width: 200, height: 200, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  ))}

                  {/* Checkbox */}
                  <motion.div
                    className={`
                      w-7 h-7 border-2 rounded-lg flex items-center justify-center
                      transition-all flex-shrink-0
                      ${showCorrect
                        ? "bg-[#4ecdc4] border-[#4ecdc4]"
                        : showWrong
                          ? "bg-[#ff6b6b] border-[#ff6b6b]"
                          : isSelected
                            ? "bg-[#667eea] border-[#667eea]"
                            : "border-white/30"
                      }
                    `}
                    animate={{
                      scale: isSelected ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatePresence>
                      {(isSelected || showCorrect) && (
                        <motion.span
                          className="text-white font-bold text-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          {showCorrect ? "✓" : showWrong ? "✗" : "✓"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <span className="text-white/90 text-sm sm:text-base flex-1">
                    {option.text}
                  </span>

                  {/* Correct/Wrong indicator */}
                  {isRevealed && (
                    <motion.span
                      className="text-lg"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      {showCorrect ? "✨" : showWrong ? "❌" : ""}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Feedback message */}
        <AnimatePresence>
          {isRevealed && showFeedback && (
            <motion.div
              className={`mb-6 p-4 rounded-xl text-center ${
                isCorrect
                  ? "bg-[#4ecdc4]/20 border border-[#4ecdc4]/50"
                  : "bg-[#ff6b6b]/20 border border-[#ff6b6b]/50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-lg">
                {isCorrect ? "🎉 Excelente! Você acertou!" : "💪 Continue tentando!"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal Button */}
        <motion.button
          className="w-full sm:w-auto mx-auto block px-12 sm:px-16 py-4 sm:py-5 
                     text-lg sm:text-xl text-white rounded-full cursor-pointer
                     relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isRevealed
              ? isCorrect
                ? "linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
          }}
          onClick={handleReveal}
          disabled={selectedIds.length === 0 || isRevealed}
          whileHover={{
            scale: selectedIds.length > 0 && !isRevealed ? 1.02 : 1,
            boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Button shimmer */}
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <span className="relative z-10">
            {isRevealed ? (isCorrect ? "Correto! ✓" : "Próximo →") : buttonText}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
