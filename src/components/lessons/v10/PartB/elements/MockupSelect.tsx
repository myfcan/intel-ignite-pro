import React from 'react';

interface MockupSelectProps {
  label: string;
  options: string[];
  selected: number;
  highlight?: boolean;
  barColor?: string;
}

const MockupSelect: React.FC<MockupSelectProps> = ({
  label,
  options,
  selected,
  highlight = false,
  barColor,
}) => {
  const selectedValue = options[selected] ?? '';
  const highlightColor = barColor || '#6366F1';

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 3 }}>
        {label}
      </div>
      <div
        className="flex items-center justify-between"
        style={{
          padding: '8px 10px',
          fontSize: 11,
          borderRadius: 8,
          background: '#F9FAFB',
          ...(highlight
            ? { border: `2px solid ${highlightColor}`, boxShadow: `0 0 0 3px ${highlightColor}1A` }
            : { border: '1px solid #D1D5DB' }),
        }}
      >
        <span style={{ color: '#111827' }}>{selectedValue}</span>
        <svg
          className="shrink-0"
          style={{ width: 12, height: 12, color: '#9CA3AF', marginLeft: 8 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default MockupSelect;
