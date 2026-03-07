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
  const isMobile = useIsMobile();

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
          const cxBase = (x1 + x2) / 2;
          const segmentBias = getXOffset(i) + getXOffset(i + 1);
          const cx = cxBase - segmentBias * (isMobile ? 42 : 24);
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
          const isLockedSegment = !isCompleted && !nextAvailable;

          const pathD = `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;

          const strokeColor = isCompleted
            ? "hsl(var(--primary))"
            : nextAvailable
              ? "hsl(var(--primary) / 0.62)"
              : "hsl(var(--muted-foreground) / 0.42)";
          const glowColor = isCompleted || nextAvailable
            ? "hsl(var(--primary) / 0.24)"
            : "hsl(var(--muted-foreground) / 0.18)";
          const strokeWidth = isCompleted
            ? isMobile
              ? 4.25
              : 3.1
            : nextAvailable
              ? isMobile
                ? 3.35
                : 2.6
              : isMobile
                ? 2.8
                : 2.1;
          const strokeOpacity = isCompleted ? 0.95 : nextAvailable ? 0.84 : isMobile ? 0.72 : 0.55;
          const dashArray = isLockedSegment ? (isMobile ? "10 7" : "8 6") : undefined;

          return (
            <g key={`conn-${i}`}>
              {/* Ambient glow */}
              <path
                d={pathD}
                fill="none"
                stroke={glowColor}
                strokeWidth={strokeWidth + (isMobile ? 2.2 : 1.6)}
                strokeLinecap="round"
                opacity={isMobile ? 0.38 : 0.28}
              />

              {/* Main path */}
              {isActiveSegment ? (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={isMobile ? "14 8" : "12 8"}
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
                  {...(dashArray ? { strokeDasharray: dashArray } : {})}
                />
              )}

              {/* Checkpoint dots on completed segments */}
              {isCompleted && [0.25, 0.5, 0.75].map((t, di) => {
                const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
                const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
                return (
                  <g key={`cp-${di}`}>
                    <circle cx={px} cy={py} r={isMobile ? 5.25 : 4.5} fill="hsl(var(--background))" />
                    <circle cx={px} cy={py} r={isMobile ? 4.15 : 3.5} fill="hsl(var(--primary))" opacity={0.92} />
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
      className={`relative z-20 px-3 py-1.5 rounded-xl border border-border/60 bg-card/95 shadow-sm w-[220px] sm:w-[280px] ${align === "right" ? "mr-0 text-right" : "ml-0 text-left"}`}
    >
      {isFirst && (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary mb-1">
          Início
        </span>
      )}
      <p className={`text-sm font-semibold leading-tight line-clamp-2 ${
        isLocked ? "text-muted-foreground/60" : "text-foreground"
      }`}>
        {lesson.title}
      </p>
      {lesson.estimatedTime && (
        <p className={`text-sm mt-0.5 ${isLocked ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          {lesson.estimatedTime} min
        </p>
      )}
    </motion.div>
  );
}
