import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { V8SkillNode, type NodeStatus } from "./V8SkillNode";
import { useRef, useState, useEffect } from "react";

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

/** Single source of truth for node X position (%) */
const getNodeXPercent = (index: number, isMobile: boolean): number => {
  const pattern = [0, 1, 0, -1];
  const amplitude = isMobile ? 13 : 12;
  return 50 + pattern[index % 4] * amplitude;
};

const NODE_SIZE = 72;
const ROW_HEIGHT = 150;

export const V8SkillTree = ({ lessons, onLessonClick, allCompleted }: V8SkillTreeProps) => {
  const isMobile = useIsMobile();
  const totalHeight = lessons.length * ROW_HEIGHT + 60;
  const firstAvailableIndex = lessons.findIndex(l => l.status === "available" || l.status === "in_progress");
  const completedCount = lessons.filter(l => l.status === "completed").length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  // Measure actual container width for SVG sync
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeWidth, setTreeWidth] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTreeWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setTreeWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  /** Convert node index → absolute X pixel in the SVG coordinate system */
  const getNodeX = (index: number) => (getNodeXPercent(index, isMobile) / 100) * treeWidth;
  /** Y for the bottom-center of a node (connector start) */
  const getNodeBottomY = (index: number) => 20 + index * ROW_HEIGHT + NODE_SIZE / 2 + 8;
  /** Y for the top-center of a node (connector end) */
  const getNodeTopY = (index: number) => 20 + index * ROW_HEIGHT - 4;

  return (
    <div className="relative w-full flex flex-col items-center">
      <ProgressHeader completedCount={completedCount} totalLessons={lessons.length} progressPercent={progressPercent} />

      <div ref={containerRef} className="relative w-full flex flex-col items-center pt-4">
        {/* SVG connectors — viewBox matches real pixel width */}
        <svg
          className="absolute inset-0 w-full pointer-events-none z-0"
          style={{ height: totalHeight }}
          viewBox={`0 0 ${treeWidth} ${totalHeight}`}
          preserveAspectRatio="none"
        >
          {lessons.map((_, i) => {
            if (i === lessons.length - 1) return null;

            const x1 = getNodeX(i);
            const y1 = getNodeBottomY(i);
            const x2 = getNodeX(i + 1);
            const y2 = getNodeTopY(i + 1);
            const midY = (y1 + y2) / 2;

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
                {/* Base rail (always visible, even for locked) */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="hsl(var(--muted-foreground) / 0.15)"
                  strokeWidth={strokeWidth + 4}
                  strokeLinecap="round"
                  opacity={0.3}
                />
                {/* Glow for active segments */}
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

        {/* Nodes + labels */}
        <div className="relative w-full z-10" style={{ height: totalHeight }}>
          {lessons.map((lesson, i) => {
            const xPercent = getNodeXPercent(i, isMobile);
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

                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 + 0.15 }}
                  className="relative z-20 mt-2 w-[172px] sm:w-[210px] px-1"
                >
                  <div className="rounded-md bg-background/85 backdrop-blur-[1px] py-1">
                    <p className={`text-xs font-semibold leading-snug line-clamp-2 text-center ${
                      lesson.status === "locked" ? "text-muted-foreground/60" : "text-foreground"
                    }`}>
                      {lesson.title}
                    </p>
                    {lesson.estimatedTime && (
                      <p className={`text-[10px] mt-0.5 text-center ${
                        lesson.status === "locked" ? "text-muted-foreground/45" : "text-muted-foreground"
                      }`}>
                        {lesson.estimatedTime} min
                      </p>
                    )}
                  </div>
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
