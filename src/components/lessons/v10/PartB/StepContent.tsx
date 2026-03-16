import React from 'react';
import type { V10LessonStep } from '../../../../types/v10.types';
import FrameRenderer from './FrameRenderer';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

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
      <div className="flex flex-col gap-1.5 max-w-[420px] mx-auto">
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

        {/* Tool badge + Warning inline */}
        {(step.app_name || (step.warnings && step.warnings.warn)) && (
          <div className="flex items-center gap-2 flex-wrap">
            {step.app_name && (
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
            )}
            {step.warnings && step.warnings.warn && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors max-w-full text-left"
                  >
                    <span className="shrink-0">⚠️</span>
                    <span className="truncate">{step.warnings.warn}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" className="text-sm text-amber-900 bg-amber-50 border-amber-200 max-w-xs">
                  {step.warnings.warn}
                </PopoverContent>
              </Popover>
            )}
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
