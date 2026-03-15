import React from 'react';

interface MockupChromeProps {
  barText: string;
  barSub: string;
  barColor: string;
  children: React.ReactNode;
}

const MockupChrome: React.FC<MockupChromeProps> = ({
  barText,
  barSub,
  barColor,
  children,
}) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
      {/* Title bar */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: barColor }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#FF5F57' }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#FFBD2E' }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#28C840' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded px-3 py-1">
            <span className="text-xs font-mono text-white/90 truncate block">
              {barText}
            </span>
          </div>
        </div>
        {barSub && (
          <p className="text-xs text-white/70 mt-1.5 leading-snug">
            {barSub}
          </p>
        )}
      </div>

      {/* Content body */}
      <div className="bg-white p-4">{children}</div>
    </div>
  );
};

export default MockupChrome;
