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
  tip,
  action,
  check,
  accentColor = '#6366F1',
  children,
}) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
      {/* Title bar */}
      <div
        className="px-3 py-2"
        style={{ backgroundColor: barColor }}
      >
        <div className="flex items-center gap-2 mb-1">
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
      <div className="bg-white p-3 flex flex-col gap-2.5">
        {children}

        {/* Tip inline */}
        {tip?.text && (
          <div className="rounded-md px-2.5 py-1.5 bg-indigo-50 border border-indigo-100">
            <p className="text-xs text-indigo-700 leading-snug">
              💡 {tip.text}
            </p>
          </div>
        )}

        {/* Action inline */}
        {action && (
          <div
            className="rounded-md px-2.5 py-1.5"
            style={{ backgroundColor: `${accentColor}10`, borderLeft: `3px solid ${accentColor}` }}
          >
            <p className="text-xs leading-snug" style={{ color: accentColor }}>
              👆 {action}
            </p>
          </div>
        )}

        {/* Check inline */}
        {check && (
          <div className="rounded-md px-2.5 py-1.5 bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-emerald-700 leading-snug">
              ✅ {check}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockupChrome;
