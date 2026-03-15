import React from 'react';

interface MockupButtonProps {
  label: string;
  primary: boolean;
  icon?: string;
}

const MockupButton: React.FC<MockupButtonProps> = ({ label, primary, icon }) => {
  return (
    <div
      className={`inline-flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
        primary
          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm'
          : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

export default MockupButton;
