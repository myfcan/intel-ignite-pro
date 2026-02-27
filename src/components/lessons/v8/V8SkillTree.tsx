import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, ArrowRight, Clock } from "lucide-react";
import { V8SkillNode, type NodeStatus } from "./V8SkillNode";

interface LessonItem {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: number;
  status: NodeStatus;
}

interface V8SkillTreeProps {
  lessons: LessonItem[];
  onLessonClick: (lessonId: string) => void;
  allCompleted: boolean;
}

/** Zigzag X offset pattern: center → right → center → left → center ... */
const getXOffset = (index: number): number => {
  const pattern = [0, 1, 0, -1]; // center, right, center, left
  return pattern[index % 4];
};

const OFFSET_PX = 80; // desktop lateral offset
const OFFSET_PX_SM = 50; // mobile lateral offset
const ROW_HEIGHT = 110;

export const V8SkillTree = ({ lessons, onLessonClick, allCompleted }: V8SkillTreeProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalHeight = (lessons.length + 1) * ROW_HEIGHT + 60; // +1 for certificate

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center py-6 sm:py-10">
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 w-full pointer-events-none"
        style={{ height: totalHeight }}
        viewBox={`0 0 300 ${totalHeight}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lessons.map((_, i) => {
          if (i === lessons.length - 1) return null;
          const x1 = 150 + getXOffset(i) * OFFSET_PX_SM;
          const y1 = 30 + i * ROW_HEIGHT + 34;
          const x2 = 150 + getXOffset(i + 1) * OFFSET_PX_SM;
          const y2 = 30 + (i + 1) * ROW_HEIGHT + 0;
          const cp1y = y1 + (y2 - y1) * 0.5;
          const cp2y = y1 + (y2 - y1) * 0.5;

          const isCompleted = lessons[i].status === "completed";
          const nextAvailable = lessons[i + 1].status !== "locked";
          const pathD = `M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`;

          return (
            <g key={`line-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={isCompleted ? "hsl(258, 90%, 56%)" : nextAvailable ? "hsl(258, 60%, 75%)" : "hsl(220, 14%, 85%)"}
                strokeWidth={isCompleted ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={isCompleted ? "none" : "6 4"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
              />
              {isCompleted && (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="hsl(258, 90%, 66%)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  filter="url(#line-glow)"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </g>
          );
        })}

        {/* Line to certificate */}
        {lessons.length > 0 && (() => {
          const lastI = lessons.length - 1;
          const x1 = 150 + getXOffset(lastI) * OFFSET_PX_SM;
          const y1 = 30 + lastI * ROW_HEIGHT + 34;
          const x2 = 150;
          const y2 = 30 + lessons.length * ROW_HEIGHT;
          const cp1y = y1 + (y2 - y1) * 0.5;
          return (
            <motion.path
              d={`M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp1y}, ${x2} ${y2}`}
              fill="none"
              stroke={allCompleted ? "hsl(258, 90%, 56%)" : "hsl(220, 14%, 85%)"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={allCompleted ? "none" : "6 4"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: lessons.length * 0.08 }}
            />
          );
        })()}
      </svg>

      {/* Nodes */}
      <div className="relative w-full" style={{ height: totalHeight }}>
        {lessons.map((lesson, i) => {
          const xPercent = 50 + getXOffset(i) * 18; // percentage-based for responsiveness
          const yPx = 30 + i * ROW_HEIGHT;

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
                isSelected={selectedId === lesson.id}
                onClick={() => handleNodeClick(lesson.id)}
              />

              {/* Popover */}
              <AnimatePresence>
                {selectedId === lesson.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute z-50 top-[76px] sm:top-[82px] w-[240px] sm:w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
                    style={{ boxShadow: "0 12px 40px -8px rgba(124, 58, 237, 0.2), 0 4px 12px rgba(0,0,0,0.08)" }}
                  >
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 relative z-10">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{lesson.description}</p>
                    )}
                    {lesson.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.estimatedTime} min
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonClick(lesson.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, hsl(258 90% 56%), hsl(270 76% 68%))",
                        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                      }}
                    >
                      {lesson.status === "completed" ? "Revisar aula" : "Iniciar aula"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Certificate node */}
        {lessons.length > 0 && (
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: "50%",
              top: 30 + lessons.length * ROW_HEIGHT,
              transform: "translateX(-50%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: lessons.length * 0.08, type: "spring" }}
              className={`w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center ${
                allCompleted
                  ? "ring-2 ring-amber-300/60"
                  : "ring-1 ring-gray-300/50 opacity-50"
              }`}
              style={{
                background: allCompleted
                  ? "linear-gradient(135deg, hsl(38 92% 50%), hsl(45 93% 58%))"
                  : "linear-gradient(135deg, hsl(220 14% 80%), hsl(220 14% 86%))",
                boxShadow: allCompleted
                  ? "0 0 20px rgba(234, 179, 8, 0.4)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {allCompleted ? (
                <Award className="w-7 h-7 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-gray-500" />
              )}
            </motion.div>
            <p className={`mt-2 text-xs font-semibold text-center ${allCompleted ? "text-amber-600" : "text-gray-400"}`}>
              {allCompleted ? "Certificado disponível!" : "Certificado"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
