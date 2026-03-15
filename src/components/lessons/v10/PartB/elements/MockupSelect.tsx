import React from 'react';

interface MockupSelectProps {
  label: string;
  options: string[];
  selected: number;
  highlight?: boolean;
}

const MockupSelect: React.FC<MockupSelectProps> = ({
  label,
  options,
  selected,
  highlight = false,
}) => {
  const selectedValue = options[selected] ?? '';

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors ${
          highlight
            ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50'
            : 'border-gray-200 bg-[#F9FAFB]'
        }`}
      >
        <span className="text-gray-900">{selectedValue}</span>
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default MockupSelect;
