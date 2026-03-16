import React from 'react';

interface MockupChromeProps {
  barText: string;
  barSub: string;
  barColor: string;
  tip?: { text: string } | null;
  action?: string | null;
  check?: string | null;
  accentColor?: string;
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
        className="px-2 py-1.5"
        style={{ backgroundColor: barColor }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <div className="flex gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#FF5F57' }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#FFBD2E' }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#28C840' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded px-2 py-0.5">
            <span className="text-[9px] font-mono text-white/90 truncate block">
              {barText}
            </span>
          </div>
        </div>
        {barSub && (
          <p className="text-[10px] text-white/70 mt-1 leading-snug">
            {barSub}
          </p>
        )}
      </div>

      {/* Content body */}
      <div className="bg-white p-2 flex flex-col gap-1.5">
        {children}
      </div>
    </div>
  );
};

export default MockupChrome;
