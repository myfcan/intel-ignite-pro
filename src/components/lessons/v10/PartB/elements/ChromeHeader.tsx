import React from 'react';

interface ChromeHeaderProps {
  url: string;
}

const ChromeHeader: React.FC<ChromeHeaderProps> = ({ url }) => {
  return (
    <div
      className="flex items-center"
      style={{
        padding: '5px 10px',
        gap: '6px',
        background: '#F0F1F3',
        borderBottom: '1px solid #E2E4E8',
      }}
    >
      {/* Window dots */}
      <div className="flex shrink-0" style={{ gap: '4px' }}>
        <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#FF5F57' }} />
        <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#FFBD2E' }} />
        <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#28C840' }} />
      </div>

      {/* Navigation arrows */}
      <div className="flex shrink-0" style={{ gap: '3px', marginLeft: 4 }}>
        <span style={{ fontSize: 9, color: '#B0B3B8', lineHeight: 1 }}>‹</span>
        <span style={{ fontSize: 9, color: '#B0B3B8', lineHeight: 1 }}>›</span>
      </div>

      {/* Address bar */}
      <div
        className="flex items-center flex-1 min-w-0"
        style={{
          background: '#FFFFFF',
          borderRadius: 6,
          padding: '3px 8px',
          border: '1px solid #E2E4E8',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 8, lineHeight: 1, flexShrink: 0 }}>🔒</span>
        <span
          className="truncate"
          style={{ fontSize: 9, color: '#6B7280', fontFamily: 'monospace' }}
        >
          {url}
        </span>
      </div>
    </div>
  );
};

export default ChromeHeader;
