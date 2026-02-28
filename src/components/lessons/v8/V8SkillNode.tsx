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
    shadow: "0 6px 20px rgba(124, 58, 237, 0.35)",
    border: "2.5px solid hsl(258, 70%, 75%)",
  },
  in_progress: {
    bg: "linear-gradient(135deg, hsl(258 90% 56%), hsl(270 76% 68%))",
    shadow: "0 6px 24px rgba(124, 58, 237, 0.45)",
    border: "2.5px solid hsl(258, 80%, 70%)",
  },
  available: {
    bg: "hsl(258, 40%, 85%)",
    shadow: "0 3px 10px rgba(124, 58, 237, 0.12)",
    border: "2px solid hsl(258, 30%, 88%)",
  },
  locked: {
    bg: "hsl(250, 15%, 92%)",
    shadow: "0 2px 4px rgba(0,0,0,0.04)",
    border: "1.5px solid hsl(250, 10%, 88%)",
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
    className={`relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{
        background: style.bg,
        boxShadow: style.shadow,
        border: style.border,
      }}
      aria-label={`Aula ${index + 1}: ${title}`}
    >
      <IconComponent className={`w-8 h-8 ${isLocked ? "text-gray-400" : status === "available" ? "text-violet-600" : "text-white"}`} />

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
