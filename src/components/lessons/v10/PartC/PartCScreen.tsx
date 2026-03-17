import React, { useState } from 'react';
import type { V10Lesson, V10UserStreak } from '../../../../types/v10.types';
import { RecapPage } from './RecapPage';
import { EngagementPage } from './EngagementPage';
import { GamificationPage } from './GamificationPage';
import { ExitButton } from '../shared/ExitButton';

interface PartCScreenProps {
  lesson: V10Lesson;
  streak: V10UserStreak | null;
  audioUrl: string | null;
  onNextLesson: () => void;
  onExit?: () => void;
}

/**
 * PartCScreen — Container for Part C (completion / gamification).
 *
 * Manages 3 sub-screens:
 *   C1 = RecapPage
 *   C2 = EngagementPage
 *   C3 = GamificationPage
 *
 * Dark background #0F0B1E. Only active page visible via display:none/flex.
 */
export const PartCScreen: React.FC<PartCScreenProps> = ({
  lesson,
  streak,
  audioUrl,
  onNextLesson,
  onExit,
}) => {
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);

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
    // Share via Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `Completei: ${lesson.title}`,
        text: `Acabei de completar a aula "${lesson.title}" na AILIV! ${lesson.badge_name ? `Badge: ${lesson.badge_name}` : ''}`,
      }).catch(() => {});
    }
  };

  return (
    <div
      className="relative flex flex-col min-h-screen w-full max-w-[420px] mx-auto overflow-y-auto"
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
        onNextLesson={onNextLesson}
      />
    </div>
  );
};
