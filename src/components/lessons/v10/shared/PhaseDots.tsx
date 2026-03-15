import React from 'react';

interface PhaseDotsProps {
  phases: string[];
  currentPhase: number;
}

const PhaseDots: React.FC<PhaseDotsProps> = ({ phases, currentPhase }) => {
  return (
    <div className="flex items-center gap-1 w-full">
      {phases.map((phase, i) => {
        const isDone = i < currentPhase;
        const isActive = i === currentPhase;

        let barColor: string;
        if (isDone) {
          barColor = '#34D399';
        } else if (isActive) {
          barColor = '#6366F1';
        } else {
          barColor = 'transparent';
        }

        const isFuture = !isDone && !isActive;

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1"
            title={phase}
          >
            <div
              className={`w-full rounded-full ${isFuture ? 'border border-gray-300' : ''}`}
              style={{
                height: '3px',
                backgroundColor: isFuture ? undefined : barColor,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PhaseDots;
