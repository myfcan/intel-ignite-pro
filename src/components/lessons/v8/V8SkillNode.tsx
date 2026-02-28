import { motion } from "framer-motion";
import { CheckCircle2, Lock, Play } from "lucide-react";
import { getLessonIcon } from "@/utils/lessonIconMap";

export type NodeStatus = "completed" | "in_progress" | "available" | "locked";

interface V8SkillNodeProps {
  title: string;
  status: NodeStatus;
  index: number;
  isFirst?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

const STATUS_STYLES: Record<NodeStatus, { bg: string; shadow: string; border: string }> = {
  completed: {
    bg: "linear-gradient(135deg, hsl(258 90% 56%), hsl(270 76% 68%))",
    shadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
    border: "2px solid hsl(258, 70%, 75%)",
  },
  in_progress: {
    bg: "linear-gradient(135deg, hsl(258 90% 56%), hsl(270 76% 68%))",
    shadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
    border: "2px solid hsl(258, 80%, 70%)",
  },
  available: {
    bg: "linear-gradient(135deg, hsl(258 75% 62%), hsl(270 65% 72%))",
    shadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
    border: "2px solid hsl(258, 50%, 80%)",
  },
  locked: {
    bg: "linear-gradient(135deg, hsl(220 10% 88%), hsl(220 10% 92%))",
    shadow: "0 2px 6px rgba(0,0,0,0.06)",
    border: "1.5px solid hsl(220, 14%, 85%)",
  },
};

export const V8SkillNode = ({ title, status, index, isFirst, onClick }: V8SkillNodeProps) => {
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
      transition={{ duration: 0.35, delay: index * 0.06, type: "spring", stiffness: 220 }}
      whileHover={!isLocked ? { scale: 1.08 } : undefined}
      whileTap={!isLocked ? { scale: 0.94 } : undefined}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{
        background: style.bg,
        boxShadow: style.shadow,
        border: style.border,
      }}
      aria-label={`Aula ${index + 1}: ${title}`}
    >
      <IconComponent className={`w-6 h-6 ${isLocked ? "text-gray-500" : "text-white"}`} />

      {/* Pulse ring for in-progress */}
      {isInProgress && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: "2px solid hsl(258, 70%, 70%)" }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Completion check ring */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: "2px solid hsl(258, 60%, 72%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
};
