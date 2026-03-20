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
      <div style={{ padding: '8px 12px', backgroundColor: barColor }}>
        <p className="text-white" style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
          {barText}
        </p>
        {barSub && (
          <p className="text-white" style={{ fontSize: 9, opacity: 0.6, lineHeight: 1.3, marginTop: 2 }}>
            {barSub}
          </p>
        )}
      </div>

      {/* Content body */}
      <div style={{ padding: 6, minHeight: 120, background: '#FFF', display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
        {children}
      </div>
    </div>
  );
};

export default MockupChrome;
