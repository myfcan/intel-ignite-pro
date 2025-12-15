// src/components/lessons/v7/V7Timeline.tsx
// Timeline component for V7 Cinematic Player

import { useState, useRef, useCallback } from 'react';
import { V7CinematicLesson } from '@/types/v7-cinematic.types';
import { Clock, Flag } from 'lucide-react';

interface V7TimelineProps {
  lesson: V7CinematicLesson;
  currentTime: number;
  onSeek: (time: number) => void;
  completedActs: string[];
}

export const V7Timeline = ({
  lesson,
  currentTime,
  onSeek,
  completedActs,
}: V7TimelineProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = useCallback(
    (clientX: number): number => {
      if (!timelineRef.current) return 0;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(x / rect.width, 1));
      return percentage * lesson.duration;
    },
    [lesson.duration]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    },
    [getTimeFromPosition, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      setHoverTime(time);

      if (isDragging) {
        onSeek(time);
      }
    },
    [isDragging, getTimeFromPosition, onSeek]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const progressPercentage = (currentTime / lesson.duration) * 100;

  return (
    <div className="v7-timeline absolute bottom-20 left-0 right-0 z-30 px-8">
      <div className="bg-black/60 backdrop-blur-md rounded-lg p-4">
        {/* Time display */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-white text-sm">
            <Clock size={14} />
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="text-white text-sm opacity-60">
            {formatTime(lesson.duration)}
          </div>
        </div>

        {/* Timeline bar */}
        <div
          ref={timelineRef}
          className="relative h-16 bg-gray-800 rounded-lg cursor-pointer overflow-hidden group"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Acts background */}
          <div className="absolute inset-0 flex">
            {lesson.cinematicFlow.acts.map((act) => {
              const startPercentage = (act.startTime / lesson.duration) * 100;
              const widthPercentage = (act.duration / lesson.duration) * 100;
              const isCompleted = completedActs.includes(act.id);

              // Color based on act type
              const actColors = {
                narrative: 'bg-blue-500/30',
                interactive: 'bg-purple-500/30',
                challenge: 'bg-red-500/30',
                revelation: 'bg-yellow-500/30',
                outro: 'bg-green-500/30',
              };

              return (
                <div
                  key={act.id}
                  className={`absolute h-full ${actColors[act.type]} border-r border-gray-700 transition-all ${
                    isCompleted ? 'opacity-50' : 'opacity-100'
                  }`}
                  style={{
                    left: `${startPercentage}%`,
                    width: `${widthPercentage}%`,
                  }}
                >
                  <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-white/70 truncate px-2">
                      {act.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interaction markers */}
          {lesson.interactionPoints.map((interaction) => {
            const position = (interaction.timestamp / lesson.duration) * 100;
            return (
              <div
                key={interaction.id}
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10"
                style={{ left: `${position}%` }}
                title={`Interação: ${interaction.type}`}
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <Flag size={12} className="text-yellow-400" />
                </div>
              </div>
            );
          })}

          {/* Timeline markers */}
          {lesson.cinematicFlow.timeline.markers.map((marker) => {
            const position = (marker.timestamp / lesson.duration) * 100;
            return (
              <div
                key={marker.id}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
                style={{ left: `${position}%` }}
                title={marker.label}
              />
            );
          })}

          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-40 pointer-events-none"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white z-20 pointer-events-none"
            style={{ left: `${progressPercentage}%` }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>

          {/* Hover preview */}
          {hoverTime !== null && !isDragging && (
            <div
              className="absolute -top-12 z-30 pointer-events-none transform -translate-x-1/2"
              style={{ left: `${(hoverTime / lesson.duration) * 100}%` }}
            >
              <div className="bg-black/90 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
                {formatTime(hoverTime)}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/90" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
        </div>

        {/* Act chapters (if available) */}
        {lesson.cinematicFlow.timeline.chapters && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {lesson.cinematicFlow.timeline.chapters.map((chapter) => {
              const isActive =
                currentTime >= chapter.startTime && currentTime < chapter.endTime;
              return (
                <button
                  key={chapter.id}
                  onClick={() => onSeek(chapter.startTime)}
                  className={`flex-shrink-0 px-3 py-1 rounded text-xs transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {chapter.title}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
