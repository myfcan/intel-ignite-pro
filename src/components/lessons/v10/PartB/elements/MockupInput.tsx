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
  const highlightColor = barColor || '#818CF8';
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] font-medium text-gray-700">{label}</label>
      <div
        className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
          highlight
            ? 'ring-2'
            : 'border-gray-200 bg-[#F9FAFB]'
        }`}
        style={highlight ? { borderColor: highlightColor, backgroundColor: `${highlightColor}10`, boxShadow: `0 0 0 2px ${highlightColor}20` } : undefined}
      >
        {value ? (
          <span className="text-gray-900">{value}</span>
        ) : (
          <span className="text-gray-400">{placeholder || ''}</span>
        )}
      </div>
    </div>
  );
};

export default MockupInput;
