import React from 'react';

interface ChromeHeaderProps {
  url: string;
}

const ChromeHeader: React.FC<ChromeHeaderProps> = ({ url }) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-md">
      <div className="flex gap-1.5 shrink-0">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: '#FF5F57' }}
        />
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: '#FFBD2E' }}
        />
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: '#28C840' }}
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] font-mono text-gray-500 truncate border border-gray-200 hover:text-indigo-600 transition-colors"
      >
        {url}
      </a>
    </div>
  );
};

export default ChromeHeader;
