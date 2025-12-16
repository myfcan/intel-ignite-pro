// V7ActComparison - 100% Cinematic side-by-side comparison
// Features: Animated cards, color-coded values, hover effects, glow borders

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonCard {
  label: string;
  value: string;
  isPositive: boolean;
  details: string[];
  icon?: string;
}

interface V7ActComparisonProps {
  title: string;
  subtitle?: string;
  leftCard: ComparisonCard;
  rightCard: ComparisonCard;
  onCardHover?: (side: "left" | "right" | null) => void;
}

export const V7ActComparison = ({
  title,
  subtitle,
  leftCard,
  rightCard,
  onCardHover,
}: V7ActComparisonProps) => {
  const [hoveredCard, setHoveredCard] = useState<"left" | "right" | null>(null);
  const [revealedDetails, setRevealedDetails] = useState<{left: boolean; right: boolean}>({
    left: false,
    right: false,
  });

  const handleHover = (side: "left" | "right" | null) => {
    setHoveredCard(side);
    onCardHover?.(side);
  };

  const renderCard = (
    card: ComparisonCard,
    side: "left" | "right",
    delay: number
  ) => {
    const isHovered = hoveredCard === side;
    const isPro = card.isPositive;
    const isRevealed = revealedDetails[side];

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: side === "left" ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        onHoverStart={() => handleHover(side)}
        onHoverEnd={() => handleHover(null)}
        onClick={() => setRevealedDetails(prev => ({ ...prev, [side]: !prev[side] }))}
      >
        {/* Glow effect behind card */}
        <motion.div
          className="absolute -inset-2 rounded-3xl opacity-0"
          style={{
            background: isPro
              ? "linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.1))"
              : "linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 107, 107, 0.1))",
            filter: "blur(20px)",
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Card */}
        <motion.div
          className={`
            relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 sm:p-8
            border-2 cursor-pointer overflow-hidden
            ${isPro
              ? "border-[rgba(78,205,196,0.5)]"
              : "border-[rgba(255,107,107,0.3)]"
            }
          `}
          animate={{
            scale: isHovered ? 1.02 : 1,
            borderColor: isHovered
              ? isPro ? "rgba(78, 205, 196, 0.8)" : "rgba(255, 107, 107, 0.8)"
              : isPro ? "rgba(78, 205, 196, 0.5)" : "rgba(255, 107, 107, 0.3)",
          }}
          transition={{ duration: 0.2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? ["0%", "100%"] : "0%",
            }}
            transition={{ duration: 0.6 }}
          />

          {/* Icon/Badge */}
          {card.icon && (
            <motion.div
              className="text-4xl mb-4"
              animate={{ scale: isHovered ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {card.icon}
            </motion.div>
          )}

          {/* Label */}
          <div className="text-sm text-white/50 mb-2 uppercase tracking-wider">
            {card.label}
          </div>

          {/* Value with animated count */}
          <motion.div
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 ${
              card.isPositive ? "text-[#4ecdc4]" : "text-[#ff6b6b]"
            }`}
            style={{
              textShadow: card.isPositive
                ? "0 0 30px rgba(78, 205, 196, 0.5)"
                : "0 0 30px rgba(255, 107, 107, 0.5)",
            }}
            animate={{
              scale: isHovered ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {card.value}
          </motion.div>

          {/* Details */}
          <div className="space-y-2">
            {card.details.map((detail, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2 text-sm sm:text-base text-white/70"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 * index + 0.3 }}
              >
                <span
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    card.isPositive ? "bg-[#4ecdc4]" : "bg-[#ff6b6b]"
                  }`}
                />
                <span>{detail}</span>
              </motion.div>
            ))}
          </div>

          {/* Expanded details on click */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                className="mt-4 pt-4 border-t border-white/10"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-white/60">
                  {card.isPositive
                    ? "✓ Este é o caminho recomendado"
                    : "✗ Evite este padrão"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner accent */}
          <div
            className={`absolute top-0 right-0 w-20 h-20 ${
              card.isPositive ? "bg-[#4ecdc4]/10" : "bg-[#ff6b6b]/10"
            }`}
            style={{
              clipPath: "polygon(100% 0, 0 0, 100% 100%)",
            }}
          />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Title */}
      <motion.div
        className="text-center mb-8 sm:mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3"
          style={{
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/60 text-sm sm:text-base">{subtitle}</p>
        )}
      </motion.div>

      {/* VS Badge */}
      <motion.div
        className="absolute z-20 bg-white/10 backdrop-blur-md rounded-full w-16 h-16 
                   flex items-center justify-center border border-white/20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <span className="text-xl font-bold text-white/80">VS</span>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full max-w-5xl">
        {renderCard(leftCard, "left", 0)}
        {renderCard(rightCard, "right", 0.3)}
      </div>

      {/* Hint */}
      <motion.p
        className="mt-6 text-white/40 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Toque nos cards para mais detalhes
      </motion.p>
    </div>
  );
};
