import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, ArrowRight, Clock, Sparkles, Trophy } from "lucide-react";
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

        {/* Certificate card */}
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
              transition={{ duration: 0.5, delay: lessons.length * 0.08, type: "spring", stiffness: 180 }}
              className="relative flex flex-col items-center"
            >
              {/* Glow ring for unlocked */}
              {allCompleted && (
                <>
                  <motion.div
                    className="absolute -inset-3 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(234,179,8,0.25) 0%, transparent 70%)" }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -inset-1 rounded-full border-2 border-amber-400/50"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </>
              )}

              {/* Main circle */}
              <div
                className={`relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full flex items-center justify-center ${
                  allCompleted
                    ? "ring-2 ring-amber-300/70"
                    : "ring-1 ring-gray-300/50 opacity-50"
                }`}
                style={{
                  background: allCompleted
                    ? "linear-gradient(135deg, hsl(38 92% 50%), hsl(45 93% 58%), hsl(38 92% 50%))"
                    : "linear-gradient(135deg, hsl(220 14% 80%), hsl(220 14% 86%))",
                  boxShadow: allCompleted
                    ? "0 0 30px rgba(234, 179, 8, 0.5), 0 8px 24px rgba(234, 179, 8, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {allCompleted ? (
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
                    style={{ perspective: 200 }}
                  >
                    <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-lg" />
                  </motion.div>
                ) : (
                  <Lock className="w-6 h-6 text-gray-500" />
                )}
              </div>

              {/* Sparkle accents when unlocked */}
              {allCompleted && (
                <>
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-0.5 -left-1.5"
                    animate={{ scale: [1, 0.7, 1], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Label card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: lessons.length * 0.08 + 0.2 }}
              className={`mt-3 px-4 py-2 rounded-xl text-center ${
                allCompleted
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 shadow-md"
                  : "bg-gray-50 border border-gray-200/60"
              }`}
              style={allCompleted ? { boxShadow: "0 4px 16px rgba(234,179,8,0.15)" } : {}}
            >
              <p className={`text-xs font-bold ${allCompleted ? "text-amber-700" : "text-gray-400"}`}>
                {allCompleted ? "🎉 Certificado disponível!" : "🔒 Certificado"}
              </p>
              {!allCompleted && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Complete todas as aulas
                </p>
              )}
              {allCompleted && (
                <motion.p
                  className="text-[10px] text-amber-600 mt-0.5 font-medium"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Toque para resgatar
                </motion.p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
