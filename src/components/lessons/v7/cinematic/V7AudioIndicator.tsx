import { motion } from "framer-motion";

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
      className="absolute bottom-10 left-10 flex gap-[3px] z-[100]"
      style={{ display: isPlaying ? "flex" : "none" }}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-sm"
          style={{ backgroundColor: "rgba(78, 205, 196, 0.7)" }}
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
