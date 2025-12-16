import { motion } from "framer-motion";

interface V7MinimalTimelineProps {
  currentAct: number;
  totalActs: number;
  currentTime: string;
  totalTime: string;
  isVisible?: boolean;
}

export const V7MinimalTimeline = ({
  currentAct,
  totalActs,
  currentTime,
  totalTime,
  isVisible = true
}: V7MinimalTimelineProps) => {
  const percentage = (currentAct / totalActs) * 100;

  return (
    <motion.div
      className="absolute top-5 left-1/2 -translate-x-1/2 w-4/5 max-w-[600px] z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1, delay: 2 }}
    >
      {/* Progress Bar */}
      <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
        <motion.div
          className="h-full rounded-sm"
          style={{
            background: "linear-gradient(90deg, #FF6B6B, #4ECDC4)",
            boxShadow: "0 0 10px rgba(78, 205, 196, 0.5)"
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Time Labels */}
      <div className="flex justify-between mt-1.5 text-xs text-white/50">
        <span>{currentTime}</span>
        <span>{totalTime}</span>
      </div>
    </motion.div>
  );
};
