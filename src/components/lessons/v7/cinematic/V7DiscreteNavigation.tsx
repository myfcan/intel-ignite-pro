import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface V7DiscreteNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  showSkip?: boolean;
}

export const V7DiscreteNavigation = ({
  onPrevious,
  onNext,
  onSkip,
  canGoPrevious = true,
  canGoNext = true,
  showSkip = true
}: V7DiscreteNavigationProps) => {
  const buttonBase = `
    backdrop-blur-md border border-white/20 text-white 
    px-6 py-3 sm:px-8 sm:py-4 rounded-full cursor-pointer 
    transition-all duration-300 text-sm sm:text-base
    hover:bg-white/20 hover:-translate-y-0.5
    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0
  `;

  return (
    <>
      {/* Main Navigation */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-5 z-[100]">
        <motion.button
          className={`${buttonBase} bg-white/10`}
          onClick={onPrevious}
          disabled={!canGoPrevious}
          whileHover={{ scale: canGoPrevious ? 1.02 : 1 }}
          whileTap={{ scale: canGoPrevious ? 0.98 : 1 }}
        >
          <span className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </span>
        </motion.button>

        <motion.button
          className={`${buttonBase} border-none`}
          style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
          onClick={onNext}
          disabled={!canGoNext}
          whileHover={{ scale: canGoNext ? 1.02 : 1 }}
          whileTap={{ scale: canGoNext ? 0.98 : 1 }}
        >
          <span className="flex items-center gap-1">
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        </motion.button>
      </div>

      {/* Skip Intro Button */}
      {showSkip && onSkip && (
        <motion.button
          className="absolute bottom-10 right-10 bg-white/10 border border-white/20 
                     text-white/70 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full cursor-pointer 
                     text-xs sm:text-sm z-[200] hover:bg-white/20 hover:text-white
                     transition-all duration-300"
          onClick={onSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        >
          Pular Intro →
        </motion.button>
      )}
    </>
  );
};
