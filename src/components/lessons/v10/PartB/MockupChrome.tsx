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
  // Create a slightly darker shade for gradient end
  const darkerShade = `color-mix(in srgb, ${barColor} 85%, #000)`;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Title bar with gradient */}
      <div
        style={{
          padding: '8px 12px',
          background: `linear-gradient(135deg, ${barColor}, ${darkerShade})`,
          borderBottom: `1px solid rgba(0,0,0,0.15)`,
        }}
      >
        <p className="text-white" style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
          {barText}
        </p>
        {barSub && (
          <p className="text-white" style={{ fontSize: 9, opacity: 0.7, lineHeight: 1.3, marginTop: 2 }}>
            {barSub}
          </p>
        )}
      </div>

      {/* Content body with subtle depth */}
      <div
        style={{
          padding: 6,
          minHeight: 120,
          background: '#FAFBFC',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 4,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MockupChrome;
