import { motion } from "framer-motion";
import { CheckCircle2, Lock, Play, Star } from "lucide-react";
import { getLessonIcon } from "@/utils/lessonIconMap";

export type NodeStatus = "completed" | "in_progress" | "available" | "locked";

interface V8SkillNodeProps {
  title: string;
  status: NodeStatus;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_STYLES: Record<NodeStatus, { bg: string; shadow: string; ring: string }> = {
  completed: {
    bg: "linear-gradient(135deg, hsl(258 90% 56%), hsl(270 76% 68%))",
    shadow: "0 0 20px rgba(124, 58, 237, 0.4), 0 4px 12px rgba(124, 58, 237, 0.3)",
    ring: "ring-2 ring-violet-300/50",
  },
  in_progress: {
    bg: "linear-gradient(135deg, hsl(258 90% 56%), hsl(270 76% 68%))",
    shadow: "0 0 24px rgba(124, 58, 237, 0.5), 0 4px 16px rgba(124, 58, 237, 0.35)",
    ring: "ring-2 ring-violet-400/60",
  },
  available: {
    bg: "linear-gradient(135deg, hsl(258 80% 62%), hsl(270 70% 72%))",
    shadow: "0 4px 16px rgba(124, 58, 237, 0.25)",
    ring: "ring-2 ring-violet-200/40",
  },
  locked: {
    bg: "linear-gradient(135deg, hsl(220 14% 80%), hsl(220 14% 86%))",
    shadow: "0 2px 8px rgba(0,0,0,0.08)",
    ring: "ring-1 ring-gray-300/50",
  },
};

export const V8SkillNode = ({ title, status, index, isSelected, onClick }: V8SkillNodeProps) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const style = STATUS_STYLES[status];

  const IconComponent = isLocked
    ? Lock
    : isCompleted
      ? CheckCircle2
      : isInProgress
        ? Play
        : getLessonIcon(title);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, type: "spring", stiffness: 200 }}
      whileHover={!isLocked ? { scale: 1.12 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`relative w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center transition-all duration-300 ${style.ring} ${
        isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${isSelected ? "ring-4 ring-violet-400 ring-offset-2 ring-offset-[#FAFBFC]" : ""}`}
      style={{
        background: style.bg,
        boxShadow: isSelected
          ? `${style.shadow}, 0 0 0 4px rgba(124, 58, 237, 0.15)`
          : style.shadow,
      }}
      aria-label={`Aula ${index + 1}: ${title}`}
    >
      <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${isLocked ? "text-gray-500" : "text-white"}`} />

      {isInProgress && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-violet-300"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {isCompleted && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-violet-400"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-violet-300"
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Small index badge */}
      <span
        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
          isLocked
            ? "bg-gray-200 text-gray-500"
            : isCompleted
              ? "bg-emerald-500 text-white"
              : "bg-white text-violet-700 shadow-sm border border-violet-200"
        }`}
      >
        {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
      </span>
    </motion.button>
  );
};
