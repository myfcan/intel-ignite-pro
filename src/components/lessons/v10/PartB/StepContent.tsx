import React, { useState } from 'react';
import type { V10LessonStep } from '../../../../types/v10.types';
import FrameRenderer from './FrameRenderer';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showDesc, setShowDesc] = useState(false);

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

        {/* Collapsible description */}
        {step.description && (
          <div>
            <button
              type="button"
              onClick={() => setShowDesc((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
            >
              <span>📄</span>
              <span>Ver contexto</span>
              {showDesc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showDesc && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-1 pl-5">
                {step.description}
              </p>
            )}
          </div>
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

        {/* Warning chip → Popover */}
        {step.warnings && step.warnings.warn && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors min-h-[36px] max-w-full text-left"
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
