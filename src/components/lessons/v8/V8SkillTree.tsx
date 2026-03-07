import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
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

const ROW_HEIGHT = 160;

export const V8SkillTree = ({ lessons, onLessonClick, allCompleted }: V8SkillTreeProps) => {
  const totalHeight = lessons.length * ROW_HEIGHT + 40;

  // Find first available lesson index
  const firstAvailableIndex = lessons.findIndex(l => l.status === "available" || l.status === "in_progress");

  return (
    <div className="relative w-full flex flex-col items-center py-4">
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 w-full pointer-events-none z-0"
        style={{ height: totalHeight }}
        viewBox={`0 0 400 ${totalHeight}`}
        preserveAspectRatio="xMidYMin meet"
      >
        {lessons.map((_, i) => {
          if (i === lessons.length - 1) return null;
          const x1 = 200 + getXOffset(i) * 70;
          const y1 = 20 + i * ROW_HEIGHT + 34;
          const x2 = 200 + getXOffset(i + 1) * 70;
          const y2 = 20 + (i + 1) * ROW_HEIGHT;
          const cx = (x1 + x2) / 2;
          const cy = y1 + (y2 - y1) * 0.5;

          const isCompleted = lessons[i].status === "completed";
          const nextStatus = lessons[i + 1].status;
          const nextAvailable = nextStatus !== "locked";
          const currentStatus = lessons[i].status;
          const isActiveSegment =
            nextAvailable &&
            ((currentStatus === "completed" && nextStatus !== "completed") ||
              currentStatus === "available" ||
              currentStatus === "in_progress");

          const pathD = `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;

          const strokeColor = isCompleted
            ? "hsl(258, 70%, 58%)"
            : nextAvailable
              ? "hsl(258, 50%, 70%)"
              : "hsl(220, 10%, 82%)";
          const strokeWidth = isCompleted ? 3 : nextAvailable ? 2.5 : 2;
          const strokeOpacity = isCompleted ? 0.9 : nextAvailable ? 0.8 : 0.5;

          return (
            <g key={`conn-${i}`}>
              {/* Main path */}
              {isActiveSegment ? (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray="12 8"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -40 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  opacity={strokeOpacity}
                />
              ) : (
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  opacity={strokeOpacity}
                  {...(!isCompleted && !nextAvailable ? { strokeDasharray: "8 6" } : {})}
                />
              )}

              {/* Checkpoint dots on completed segments */}
              {isCompleted && [0.25, 0.5, 0.75].map((t, di) => {
                const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
                const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
                return (
                  <g key={`cp-${di}`}>
                    <circle cx={px} cy={py} r={4.5} fill="white" />
                    <circle cx={px} cy={py} r={3.5} fill="hsl(258, 70%, 58%)" opacity={0.9} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Nodes with labels */}
      <div className="relative w-full z-10" style={{ height: totalHeight }}>
        {lessons.map((lesson, i) => {
          const xPercent = 50 + getXOffset(i) * 20;
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
              <div className="flex items-center gap-1">
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
      className={`relative z-20 px-3 py-1.5 rounded-xl bg-[#FAFBFC] w-[220px] sm:w-[280px] ${align === "right" ? "mr-0 text-right" : "ml-0 text-left"}`}
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
        <p className={`text-sm mt-0.5 ${isLocked ? "text-gray-300" : "text-gray-400"}`}>
          {lesson.estimatedTime} min
        </p>
      )}
    </motion.div>
  );
}
