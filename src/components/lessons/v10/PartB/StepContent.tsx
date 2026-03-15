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
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-3 max-w-[420px] mx-auto">
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

        {/* Step description */}
        {step.description && (
          <p className="text-sm text-gray-500 leading-relaxed">
            {step.description}
          </p>
        )}

        {/* Tool chip badge */}
        {step.app_name && (
          <div className="flex items-center gap-0">
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

        {/* Warning badge */}
        {step.warnings && step.warnings.warn && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-amber-500 shrink-0 mt-0.5">&#x26A0;</span>
            <span className="text-sm text-amber-800">{step.warnings.warn}</span>
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
                className={`rounded-full transition-all ${
                  i === currentFrame
                    ? 'w-6 h-2'
                    : 'w-2 h-2'
                }`}
                style={{
                  backgroundColor:
                    i === currentFrame ? accentColor : '#D1D5DB',
                }}
                aria-label={`Frame ${i + 1} de ${step.frames.length}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepContent;
