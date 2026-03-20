import React from 'react';

interface MockupInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  highlight?: boolean;
  barColor?: string;
  icon?: string;
}

const MockupInput: React.FC<MockupInputProps> = ({
  label,
  value,
  placeholder,
  highlight = false,
  barColor,
  icon,
}) => {
  const highlightColor = barColor || '#6366F1';

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 3 }}>
        {label}
      </div>
      <div
        className="flex items-center"
        style={{
          padding: '8px 10px',
          fontSize: 11,
          borderRadius: 8,
          background: '#F9FAFB',
          gap: 6,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: highlight
            ? `0 0 0 3px ${highlightColor}1A, inset 0 1px 2px rgba(0,0,0,0.04)`
            : 'inset 0 1px 2px rgba(0,0,0,0.04)',
          ...(highlight
            ? { border: `2px solid ${highlightColor}` }
            : { border: '1px solid #D1D5DB' }),
        }}
      >
        {icon && <span style={{ fontSize: 12, flexShrink: 0, lineHeight: 1 }}>{icon}</span>}
        {value ? (
          <span style={{ color: '#111827', flex: 1 }}>{value}</span>
        ) : (
          <span style={{ color: '#9CA3AF', flex: 1 }}>
            {placeholder || ''}
            <span
              style={{
                display: 'inline-block',
                width: 1,
                height: 12,
                background: '#D1D5DB',
                marginLeft: 1,
                verticalAlign: 'middle',
                animation: 'pulse 1.2s infinite',
              }}
            />
          </span>
        )}
      </div>
    </div>
  );
};

export default MockupInput;
