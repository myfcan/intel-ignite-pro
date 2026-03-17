import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Rocket } from "lucide-react";
import { V8TrailCard } from "@/components/lessons/v8/V8TrailCard";

interface TrailSectionCourse {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  trail_id: string;
  completedLessons: number;
  totalLessons: number;
}

interface TrailSectionProps {
  trailTitle: string;
  courses: TrailSectionCourse[];
  sectionId?: string;
  isMaestria?: boolean;
}

const ITEMS_PER_PAGE = 3;

export function TrailSection({ trailTitle, courses, sectionId, isMaestria = false }: TrailSectionProps) {
  const navigate = useNavigate();
  
  // Pagination (desktop)
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(courses.length / ITEMS_PER_PAGE));
  const visibleCourses = courses.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  // Snap carousel (mobile)
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || courses.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.snapIndex);
          if (Number.isNaN(idx)) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { idx, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.6) {
          setActiveIndex(best.idx);
        }
      },
      { root, threshold: [0.5, 0.8] }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [courses]);

  const scrollToIndex = (idx: number) => {
    const el = itemRefs.current[idx];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const SectionIcon = isMaestria ? Crown : Rocket;
  const accentColor = isMaestria ? 'amber' : 'blue';
  const textColor = isMaestria ? 'text-indigo-800' : 'text-blue-800';
  const iconColor = isMaestria ? 'text-amber-500' : 'text-blue-500';
  const pillBg = isMaestria
    ? 'hsl(226 100% 97%)'
    : 'hsl(214 100% 97%)';
  const pillColor = isMaestria
    ? 'hsl(239 84% 67%)'
    : 'hsl(217 91% 60%)';
  const pillBorder = isMaestria
    ? '1px solid hsl(224 76% 90%)'
    : '1px solid hsl(214 76% 90%)';
  const arrowActiveClass = isMaestria
    ? 'text-indigo-600 hover:bg-indigo-50'
    : 'text-blue-600 hover:bg-blue-50';
  const dotActiveColor = isMaestria
    ? 'rgba(99,102,241,1)'
    : 'rgba(59,130,246,1)';

  return (
    <motion.div
      id={sectionId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mb-6 rounded-[20px] p-5 sm:p-6"
      style={{
        background: 'white',
        border: '1px solid hsl(230 15% 92%)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <SectionIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
          <h2 className={`text-base sm:text-lg font-bold ${textColor} tracking-tight whitespace-nowrap truncate`}>
            {trailTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/all-trails')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 whitespace-nowrap flex-shrink-0"
            style={{ background: pillBg, color: pillColor, border: pillBorder }}
          >
            Ver todos ›
          </button>
          {/* Pagination arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${page === 0 ? 'text-slate-300 cursor-not-allowed' : arrowActiveClass}`}
              style={{ background: pillBg, border: pillBorder }}
            >
              ‹
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${page >= totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : arrowActiveClass}`}
              style={{ background: pillBg, border: pillBorder }}
            >
              ›
            </button>
            <span className="text-xs text-slate-400 font-medium ml-1">
              {page + 1}/{totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="sm:hidden">
        <div
          ref={scrollerRef}
          className="snap-carousel flex gap-4 overflow-x-auto overflow-y-hidden"
          style={{
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: 20,
            scrollPaddingRight: 20,
            padding: '0 20px 10px 20px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            touchAction: 'pan-x',
          }}
          aria-label={`Carrossel ${trailTitle}`}
        >
          {courses.map((course, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={course.id}
                ref={(el) => { itemRefs.current[idx] = el; }}
                data-snap-index={idx}
                className="snap-item relative flex-shrink-0"
                style={{
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always',
                  flex: '0 0 82%',
                  maxWidth: 360,
                  transform: isActive ? 'scale(1)' : 'scale(0.94)',
                  filter: isActive ? 'saturate(1)' : 'saturate(0.92)',
                  opacity: isActive ? 1 : 0.96,
                  transition: 'transform 220ms ease, filter 220ms ease, opacity 220ms ease',
                }}
              >
                <V8TrailCard
                  trailId={course.trail_id}
                  title={course.title}
                  description={course.description || ''}
                  icon={course.icon || '📘'}
                  lessonCount={course.totalLessons}
                  completedCount={course.completedLessons}
                  orderIndex={course.order_index}
                  navigateToId={course.id}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          {courses.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className="rounded-full transition-all duration-200"
              style={{
                width: idx === activeIndex ? 10 : 7,
                height: idx === activeIndex ? 10 : 7,
                background: idx === activeIndex ? dotActiveColor : 'rgba(148,163,184,0.45)',
                transform: idx === activeIndex ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label={`Ir para jornada ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden sm:grid sm:grid-cols-3 gap-4"
        >
          {visibleCourses.map((course) => (
            <div key={course.id} className="flex-1 min-w-0">
              <V8TrailCard
                trailId={course.trail_id}
                title={course.title}
                description={course.description || ''}
                icon={course.icon || '📘'}
                lessonCount={course.totalLessons}
                completedCount={course.completedLessons}
                orderIndex={course.order_index}
                navigateToId={course.id}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
