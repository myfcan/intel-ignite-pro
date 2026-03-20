import React from 'react';

interface MockupInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  highlight?: boolean;
  barColor?: string;
}

const MockupInput: React.FC<MockupInputProps> = ({
  label,
  value,
  placeholder,
  highlight = false,
  barColor,
}) => {
  const highlightColor = barColor || '#6366F1';

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 3 }}>
        {label}
      </div>
      <div
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
        {value ? (
          <span style={{ color: '#111827' }}>{value}</span>
        ) : (
          <span style={{ color: '#9CA3AF' }}>{placeholder || ''}</span>
        )}
      </div>
    </div>
  );
};

export default MockupInput;
