import React from 'react';

interface MockupButtonProps {
  label: string;
  primary: boolean;
  icon?: string;
  barColor?: string;
}

const MockupButton: React.FC<MockupButtonProps> = ({ label, primary, icon, barColor }) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        padding: 10,
        fontSize: 12,
        fontWeight: primary ? 700 : 600,
        borderRadius: 8,
        gap: 6,
        ...(primary
          ? {
              background: `linear-gradient(135deg, ${barColor || '#6366F1'}, #8B5CF6)`,
              color: '#FFF',
            }
          : {
              background: '#FFF',
              border: '1px solid #D1D5DB',
              color: '#374151',
            }),
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

export default MockupButton;
