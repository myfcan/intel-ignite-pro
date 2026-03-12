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

/** Zigzag X offset pattern: center → right → center → left */
const getXOffset = (index: number): number => {
  const pattern = [0, 1, 0, -1];
  return pattern[index % 4];
};

const ROW_HEIGHT = 150;

export const V8SkillTree = ({ lessons, onLessonClick, allCompleted }: V8SkillTreeProps) => {
  const isMobile = useIsMobile();
  const totalHeight = lessons.length * ROW_HEIGHT + 60;
  const firstAvailableIndex = lessons.findIndex(l => l.status === "available" || l.status === "in_progress");
  const completedCount = lessons.filter(l => l.status === "completed").length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Progress bar top */}
      <ProgressHeader completedCount={completedCount} totalLessons={lessons.length} progressPercent={progressPercent} />

      {/* Tree */}
      <div className="relative w-full flex flex-col items-center pt-4">
        {/* SVG connectors */}
        <svg
          className="absolute inset-0 w-full pointer-events-none z-0"
          style={{ height: totalHeight }}
          viewBox={`0 0 400 ${totalHeight}`}
          preserveAspectRatio="xMidYMin meet"
        >
        {lessons.map((_, i) => {
            if (i === lessons.length - 1) return null;
            // Match CSS: xPercent = 50 + offset * amplitude_css
            // SVG viewBox=400, so SVG_x = (xPercent/100) * 400
            const ampCss = isMobile ? 16 : 17;
            const x1 = (50 + getXOffset(i) * ampCss) / 100 * 400;
            const y1 = 20 + i * ROW_HEIGHT + 40;
            const x2 = (50 + getXOffset(i + 1) * ampCss) / 100 * 400;
            const y2 = 20 + (i + 1) * ROW_HEIGHT + 4;
            const midY = (y1 + y2) / 2;
            const cx = x1;
            const cy = midY;

            const isCompleted = lessons[i].status === "completed";
            const nextAvailable = lessons[i + 1].status !== "locked";
            const isLockedSegment = !isCompleted && !nextAvailable;

            const pathD = `M ${x1},${y1} C ${x1},${midY} ${x2},${midY} ${x2},${y2}`;

            const strokeColor = isCompleted
              ? "hsl(var(--primary))"
              : nextAvailable
                ? "hsl(var(--primary) / 0.5)"
                : "hsl(var(--muted-foreground) / 0.3)";

            const strokeWidth = isCompleted
              ? isMobile ? 6 : 5.5
              : nextAvailable
                ? isMobile ? 4.5 : 4
                : isMobile ? 3 : 2.5;

            const strokeOpacity = isCompleted ? 1 : nextAvailable ? 0.7 : 0.45;
            const dashArray = isLockedSegment ? (isMobile ? "8 6" : "7 5") : undefined;

            return (
              <g key={`conn-${i}`}>
                {/* Glow */}
                {(isCompleted || nextAvailable) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="hsl(var(--primary) / 0.15)"
                    strokeWidth={strokeWidth + 3}
                    strokeLinecap="round"
                    opacity={0.4}
                  />
                )}
                {/* Main path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  opacity={strokeOpacity}
                  {...(dashArray ? { strokeDasharray: dashArray } : {})}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes + labels below */}
        <div className="relative w-full z-10" style={{ height: totalHeight }}>
          {lessons.map((lesson, i) => {
            const amplitude = isMobile ? 16 : 17;
            const xPercent = 50 + getXOffset(i) * amplitude;
            const yPx = 20 + i * ROW_HEIGHT;
            const isFirst = i === firstAvailableIndex;

            return (
              <div
                key={lesson.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${xPercent}%`,
                  top: yPx,
                  transform: "translateX(-50%)",
                }}
              >
                <V8SkillNode
                  title={lesson.title}
                  status={lesson.status}
                  index={i}
                  isFirst={isFirst}
                  onClick={() => lesson.status !== "locked" && onLessonClick(lesson.id)}
                />
                {/* Label below node */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 + 0.15 }}
                  className="mt-2 text-center max-w-[140px] sm:max-w-[180px]"
                >
                  <p className={`text-xs font-semibold leading-tight line-clamp-2 ${
                    lesson.status === "locked" ? "text-muted-foreground/50" : "text-foreground"
                  }`}>
                    {lesson.title}
                  </p>
                  {lesson.estimatedTime && (
                    <p className={`text-[10px] mt-0.5 ${
                      lesson.status === "locked" ? "text-muted-foreground/40" : "text-muted-foreground"
                    }`}>
                      {lesson.estimatedTime} min
                    </p>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Horizontal progress bar at the top */
function ProgressHeader({ completedCount, totalLessons, progressPercent }: {
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
}) {
  return (
    <div className="w-full max-w-xs mx-auto px-2">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-foreground">{completedCount}/{totalLessons} aulas</span>
        <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
