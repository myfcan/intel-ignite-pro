import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { V10Lesson, V10UserStreak } from '../../../../types/v10.types';
import { RecapPage } from './RecapPage';
import { EngagementPage } from './EngagementPage';
import { GamificationPage } from './GamificationPage';
import { ExitButton } from '../shared/ExitButton';
import { V8LessonRating } from '../../v8/V8LessonRating';
import { useV7SoundEffects } from '../../v7/cinematic/useV7SoundEffects';

interface PartCScreenProps {
  lesson: V10Lesson;
  streak: V10UserStreak | null;
  audioUrl: string | null;
  isActive?: boolean;
  onNextLesson: () => void;
  onExit?: () => void;
}

/**
 * PartCScreen — Container for Part C (completion / gamification).
 *
 * Manages 3 sub-screens + rating modal:
 *   C1 = RecapPage
 *   C2 = EngagementPage
 *   C3 = GamificationPage
 *   → Rating modal (V8LessonRating) before navigating to next lesson
 *
 * Dark background #0F0B1E. Only active page visible via display:none/flex.
 */
export const PartCScreen: React.FC<PartCScreenProps> = ({
  lesson,
  streak,
  audioUrl,
  isActive = false,
  onNextLesson,
  onExit,
}) => {
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { playSound } = useV7SoundEffects();
  const hasPlayedRef = useRef<Record<number, boolean>>({});

  // Sound + confetti triggers per page
  useEffect(() => {
    if (!isActive) return;
    if (hasPlayedRef.current[currentPage]) return;
    hasPlayedRef.current[currentPage] = true;

    if (currentPage === 1) {
      playSound('completion');
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 }, zIndex: 9999, colors: ['#6366F1', '#8B5CF6', '#34D399', '#F59E0B', '#EC4899'] });
    } else if (currentPage === 2) {
      playSound('level-up');
    } else if (currentPage === 3) {
      playSound('combo-hit');
      const duration = 2500;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({ particleCount: 40, spread: 100, origin: { x: Math.random(), y: Math.random() * 0.4 }, zIndex: 9999, colors: ['#6366F1', '#8B5CF6', '#34D399', '#F59E0B', '#EC4899', '#3B82F6'] });
      }, 200);
    }
  }, [currentPage, playSound]);

  // Build recap items from lesson data
  const recapItems = [
    `Completou todos os ${lesson.total_steps} passos da aula`,
    `Aprendeu a usar ${lesson.tools.length > 0 ? lesson.tools.join(', ') : 'novas ferramentas'}`,
    lesson.description ?? `Dominou: ${lesson.title}`,
  ];

  const stats = {
    steps: lesson.total_steps,
    minutes: lesson.estimated_minutes,
    code: false,
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Completei: ${lesson.title}`,
        text: `Acabei de completar a aula "${lesson.title}" na AILIV! ${lesson.badge_name ? `Badge: ${lesson.badge_name}` : ''}`,
      }).catch(() => {});
    }
  };

  // When user clicks "Próxima aula" → show rating modal first
  const handleNextLessonClick = () => {
    setShowRatingModal(true);
  };

  // After rating is submitted or skipped → navigate
  const handleRatingClose = () => {
    setShowRatingModal(false);
    onNextLesson();
  };

  return (
    <div
      className="relative flex flex-col min-h-screen w-full max-w-[420px] md:max-w-none mx-auto overflow-y-auto"
      style={{ backgroundColor: '#0F0B1E' }}
    >
      {/* Exit button */}
      {onExit && <ExitButton onExit={onExit} />}
      <RecapPage
        isActive={currentPage === 1}
        items={recapItems}
        audioUrl={audioUrl}
        onContinue={() => setCurrentPage(2)}
      />

      <EngagementPage
        isActive={currentPage === 2}
        lessonTitle={lesson.title}
        stats={stats}
        onContinue={() => setCurrentPage(3)}
      />

      <GamificationPage
        isActive={currentPage === 3}
        badgeIcon={lesson.badge_icon}
        badgeName={lesson.badge_name}
        xpReward={lesson.xp_reward}
        streak={streak}
        onShare={handleShare}
        onNextLesson={handleNextLessonClick}
      />

      {/* Rating Modal — same V8 component, same DB table */}
      {showRatingModal && (
        <V8LessonRating
          lessonId={lesson.id}
          open={showRatingModal}
          onClose={handleRatingClose}
        />
      )}
    </div>
  );
};
