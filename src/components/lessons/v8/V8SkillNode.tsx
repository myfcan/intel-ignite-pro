import { motion } from "framer-motion";
import { CheckCircle2, Lock, Play, Star } from "lucide-react";
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

export const V8SkillNode = ({ title, status, index, isFirst, onClick }: V8SkillNodeProps) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const isAvailable = status === "available";

  const IconComponent = isLocked
    ? Lock
    : isCompleted
      ? CheckCircle2
      : isInProgress
        ? Play
        : getLessonIcon(title);

  // 3D isometric colors
  const mainBg = isCompleted
    ? "linear-gradient(135deg, hsl(258 80% 58%), hsl(270 70% 62%))"
    : isInProgress
      ? "linear-gradient(135deg, hsl(258 75% 55%), hsl(270 65% 60%))"
      : isAvailable
        ? "linear-gradient(135deg, hsl(258 50% 78%), hsl(270 45% 82%))"
        : "linear-gradient(135deg, hsl(240 10% 88%), hsl(240 8% 84%))";

  const bottomBg = isCompleted
    ? "hsl(258 70% 42%)"
    : isInProgress
      ? "hsl(258 65% 40%)"
      : isAvailable
        ? "hsl(258 35% 66%)"
        : "hsl(240 8% 72%)";

  const shadowColor = isCompleted || isInProgress
    ? "rgba(124, 58, 237, 0.35)"
    : isAvailable
      ? "rgba(124, 58, 237, 0.15)"
      : "rgba(0,0,0,0.06)";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.06, type: "spring", stiffness: 200 }}
      whileHover={!isLocked ? { scale: 1.1, y: -2 } : undefined}
      whileTap={!isLocked ? { scale: 0.92 } : undefined}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`relative flex-shrink-0 ${isLocked ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
      aria-label={`Aula ${index + 1}: ${title}`}
    >
      {/* 3D bottom layer */}
      <div
        className="absolute w-[72px] h-[72px] rounded-full"
        style={{
          background: bottomBg,
          top: 5,
          left: 0,
        }}
      />

      {/* Main circle */}
      <div
        className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
        style={{
          background: mainBg,
          boxShadow: `0 6px 20px ${shadowColor}`,
          border: isCompleted || isInProgress
            ? "3px solid hsla(258, 60%, 75%, 0.6)"
            : isAvailable
              ? "3px solid hsla(258, 30%, 88%, 0.8)"
              : "2.5px solid hsla(240, 8%, 82%, 0.6)",
        }}
      >
        <IconComponent
          className={`w-8 h-8 ${
            isLocked
              ? "text-muted-foreground/60"
              : isAvailable
                ? "text-violet-700"
                : "text-white"
          }`}
        />

        {/* Completed star badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.06 + 0.3, type: "spring" }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md"
          >
            <Star className="w-4 h-4 text-white" fill="white" />
          </motion.div>
        )}
      </div>

      {/* Pulse ring for in-progress / available */}
      {(isInProgress || (isAvailable && isFirst)) && (
        <motion.div
          className="absolute inset-0 w-[72px] h-[72px] rounded-full"
          style={{ border: "2.5px solid hsl(258, 65%, 65%)" }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
};
