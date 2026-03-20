import React from 'react';

interface MockupButtonProps {
  label: string;
  primary: boolean;
  icon?: string;
  barColor?: string;
  disabled?: boolean;
}

const MockupButton: React.FC<MockupButtonProps> = ({ label, primary, icon, barColor, disabled }) => {
  const color = barColor || '#6366F1';

  return (
    <div
      className="flex items-center justify-center"
      style={{
        padding: 10,
        fontSize: 12,
        fontWeight: primary ? 700 : 600,
        borderRadius: 10,
        gap: 6,
        transition: 'box-shadow 0.15s ease',
        opacity: disabled ? 0.5 : 1,
        ...(primary
          ? {
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              color: '#FFF',
              boxShadow: `0 2px 8px ${color}33, 0 1px 2px rgba(0,0,0,0.06)`,
            }
          : {
              background: '#FFFFFF',
              border: '1.5px solid #D1D5DB',
              color: '#374151',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }),
      }}
    >
      {icon && (
        <span style={{ fontSize: 14, color: primary ? '#FFF' : color }}>
          {icon}
        </span>
      )}
      <span>{label}</span>
    </div>
  );
};

export default MockupButton;
