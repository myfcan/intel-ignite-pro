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
      className={`inline-flex items-center justify-center gap-2 px-3 min-h-[32px] rounded-lg text-xs font-medium transition-colors ${
        primary
          ? 'text-white shadow-sm'
          : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
      }`}
      style={primary ? { backgroundColor: barColor || '#6366F1' } : undefined}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

export default MockupButton;
