import React from 'react';

interface MockupInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  highlight?: boolean;
}

const MockupInput: React.FC<MockupInputProps> = ({
  label,
  value,
  placeholder,
  highlight = false,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div
        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
          highlight
            ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50'
            : 'border-gray-200 bg-[#F9FAFB]'
        }`}
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
