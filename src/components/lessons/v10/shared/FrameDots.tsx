import React from 'react';

interface FrameDotsProps {
  total: number;
  current: number;
  isLastDone: boolean;
  onDotClick: (i: number) => void;
}

const FrameDots: React.FC<FrameDotsProps> = ({
  total,
  current,
  isLastDone,
  onDotClick,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current;
        const isPast = i < current;
        const isLast = i === total - 1;
        const isDone = isPast || (isLast && isLastDone);

        let dotClass =
          'w-3 h-3 rounded-full transition-all duration-200 cursor-pointer min-h-[12px] min-w-[12px]';

        if (isCurrent) {
          dotClass += ' bg-[#6366F1] ring-2 ring-indigo-300 ring-offset-1';
        } else if (isDone) {
          dotClass += ' bg-[#34D399]';
        } else {
          dotClass += ' bg-white border-2 border-gray-300';
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onDotClick(i)}
            className={dotClass}
            aria-label={`Frame ${i + 1}`}
            aria-current={isCurrent ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
};

export default FrameDots;
