import { motion } from "framer-motion";
import { V8SkillNode, type NodeStatus } from "./V8SkillNode";

interface LessonItem {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: number;
  imageUrl?: string;
  status: NodeStatus;
}

interface V8SkillTreeProps {
  lessons: LessonItem[];
  onLessonClick: (lessonId: string) => void;
  allCompleted: boolean;
}

/** Zigzag X offset pattern: center → right → center → left → center ... */
const getXOffset = (index: number): number => {
  const pattern = [0, 1, 0, -1];
  return pattern[index % 4];
};

const ROW_HEIGHT = 120;

export const V8SkillTree = ({ lessons, onLessonClick, allCompleted }: V8SkillTreeProps) => {
  const totalHeight = lessons.length * ROW_HEIGHT + 40;

  // Find first available lesson index
  const firstAvailableIndex = lessons.findIndex(l => l.status === "available" || l.status === "in_progress");

  return (
    <div className="relative w-full flex flex-col items-center py-4">
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 w-full pointer-events-none"
        style={{ height: totalHeight }}
        viewBox={`0 0 300 ${totalHeight}`}
        preserveAspectRatio="xMidYMin meet"
      >
        {lessons.map((_, i) => {
          if (i === lessons.length - 1) return null;
          const x1 = 150 + getXOffset(i) * 50;
          const y1 = 20 + i * ROW_HEIGHT + 34;
          const x2 = 150 + getXOffset(i + 1) * 50;
          const y2 = 20 + (i + 1) * ROW_HEIGHT;
          const cpy = y1 + (y2 - y1) * 0.5;

          const isCompleted = lessons[i].status === "completed";
          const nextAvailable = lessons[i + 1].status !== "locked";
          const isActiveSegment = isCompleted && nextAvailable && lessons[i + 1].status !== "completed";
          const pathD = `M ${x1} ${y1} C ${x1} ${cpy}, ${x2} ${cpy}, ${x2} ${y2}`;

          return (
            <motion.path
              key={`line-${i}`}
              d={pathD}
              fill="none"
              stroke={isCompleted ? "hsl(258, 70%, 55%)" : nextAvailable ? "hsl(258, 50%, 65%)" : "hsl(220, 10%, 82%)"}
              strokeWidth={isCompleted ? 4.5 : nextAvailable ? 3.5 : 2.5}
              strokeLinecap="round"
              strokeDasharray={isActiveSegment ? "8 4" : "none"}
              opacity={!isCompleted && !nextAvailable ? 0.6 : 1}
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: 1,
                ...(isActiveSegment ? { strokeDashoffset: [0, -24] } : {})
              }}
              transition={isActiveSegment 
                ? { pathLength: { duration: 0.6, delay: i * 0.06 }, strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: "linear" } }
                : { duration: 0.6, delay: i * 0.06 }
              }
            />
          );
        })}
      </svg>

      {/* Nodes with labels */}
      <div className="relative w-full" style={{ height: totalHeight }}>
        {lessons.map((lesson, i) => {
          const xPercent = 50 + getXOffset(i) * 16;
          const yPx = 20 + i * ROW_HEIGHT;
          const labelSide = getXOffset(i) >= 0 ? "left" : "right";
          const isFirst = i === firstAvailableIndex;

          return (
            <div
              key={lesson.id}
              className="absolute"
              style={{
                left: `${xPercent}%`,
                top: yPx,
                transform: "translateX(-50%)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Label on left side */}
                {labelSide === "right" && (
                  <LessonLabel lesson={lesson} isFirst={isFirst} align="right" />
                )}

                {/* Node */}
                <V8SkillNode
                  title={lesson.title}
                  status={lesson.status}
                  index={i}
                  isFirst={isFirst}
                  onClick={() => lesson.status !== "locked" && onLessonClick(lesson.id)}
                />

                {/* Label on right side */}
                {labelSide === "left" && (
                  <LessonLabel lesson={lesson} isFirst={isFirst} align="left" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Inline label shown next to each node */
function LessonLabel({ lesson, isFirst, align }: { lesson: LessonItem; isFirst: boolean; align: "left" | "right" }) {
  const isLocked = lesson.status === "locked";
  
  return (
    <motion.div
      initial={{ opacity: 0, x: align === "left" ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`w-[140px] sm:w-[170px] ${align === "right" ? "text-right" : "text-left"}`}
    >
      {isFirst && (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-600 mb-1">
          Início
        </span>
      )}
      <p className={`text-sm font-semibold leading-tight line-clamp-2 ${
        isLocked ? "text-gray-400" : "text-gray-800"
      }`}>
        {lesson.title}
      </p>
      {lesson.estimatedTime && (
        <p className={`text-[11px] mt-0.5 ${isLocked ? "text-gray-300" : "text-gray-400"}`}>
          {lesson.estimatedTime} min
        </p>
      )}
    </motion.div>
  );
}
