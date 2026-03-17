import React from 'react';
import type { V10LessonStep } from '../../../../types/v10.types';
import FrameRenderer from './FrameRenderer';

interface StepContentProps {
  step: V10LessonStep;
  currentFrame: number;
  totalSteps: number;
  onFrameChange: (frame: number) => void;
  accentColor: string;
}

const StepContent: React.FC<StepContentProps> = ({
  step,
  currentFrame,
  totalSteps,
  onFrameChange,
  accentColor,
}) => {
  const frame = step.frames?.[currentFrame];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <div className="flex flex-col gap-1.5 max-w-[420px] md:max-w-[680px] mx-auto">
        {/* Step number label */}
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          Passo {step.step_number} de {totalSteps}
        </span>

        {/* Step title */}
        <h2 className="text-lg font-bold text-gray-900 leading-snug">
          {step.title}
        </h2>

        {/* Step description (1-line) */}
        {step.description && (
          <p className="text-xs text-gray-500 line-clamp-1">
            {step.description}
          </p>
        )}

        {/* Tool badge */}
        {step.app_name && (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: step.app_badge_bg,
                color: step.app_badge_color,
              }}
            >
              {step.app_icon && <span>{step.app_icon}</span>}
              <span>{step.app_name}</span>
            </span>
          </div>
        )}

        {/* Frame content */}
        {frame && (
          <FrameRenderer frame={frame} accentColor={accentColor} />
        )}

        {/* Frame dots */}
        {step.frames?.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            {step.frames.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFrameChange(i)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Frame ${i + 1} de ${step.frames?.length ?? 0}`}
              >
                <span
                  className={`rounded-full transition-all block ${
                    i === currentFrame
                      ? 'w-6 h-2'
                      : 'w-2 h-2'
                  }`}
                  style={{
                    backgroundColor:
                      i === currentFrame ? accentColor : '#D1D5DB',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepContent;
