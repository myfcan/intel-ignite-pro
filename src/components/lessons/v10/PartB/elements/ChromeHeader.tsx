import React from 'react';

interface ChromeHeaderProps {
  url: string;
}

const ChromeHeader: React.FC<ChromeHeaderProps> = ({ url }) => {
  return (
    <div
      className="flex items-center"
      style={{ padding: '6px 10px', gap: '4px', background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}
    >
      <div className="flex shrink-0" style={{ gap: '4px' }}>
        <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#FF5F57' }} />
        <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#FFBD2E' }} />
        <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#28C840' }} />
      </div>
      <span
        className="truncate"
        style={{ fontSize: 9, color: '#9CA3AF', fontFamily: 'monospace', marginLeft: 8 }}
      >
        {url}
      </span>
    </div>
  );
};

export default ChromeHeader;
