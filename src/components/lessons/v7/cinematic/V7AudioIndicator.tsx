import { motion } from "framer-motion";
import { V7_COLORS, V7_SPACING, V7_LAYERS } from "../v7-design-tokens";

interface V7AudioIndicatorProps {
  isPlaying?: boolean;
  barCount?: number;
}

export const V7AudioIndicator = ({
  isPlaying = true,
  barCount = 5
}: V7AudioIndicatorProps) => {
  return (
    <div 
      className="absolute flex gap-[3px]"
      style={{ 
        bottom: V7_SPACING.safeArea.bottom,
        left: V7_SPACING.safeArea.left,
        zIndex: V7_LAYERS.controls,
        display: isPlaying ? "flex" : "none" 
      }}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-sm"
          style={{ backgroundColor: V7_COLORS.accent.muted }}
          animate={{
            height: isPlaying ? [20, 40, 20] : 20
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};
