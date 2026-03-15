import React from 'react';

interface ChromeHeaderProps {
  url: string;
}

const ChromeHeader: React.FC<ChromeHeaderProps> = ({ url }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
      <div className="flex gap-1.5 shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: '#FF5F57' }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: '#FFBD2E' }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: '#28C840' }}
        />
      </div>
      <div className="flex-1 bg-white rounded px-3 py-1 text-xs font-mono text-gray-500 truncate border border-gray-200">
        {url}
      </div>
    </div>
  );
};

export default ChromeHeader;
