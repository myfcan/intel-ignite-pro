import React from 'react';

interface NavBreadcrumbProps {
  from: string;
  to: string;
  how: string;
}

const NavBreadcrumb: React.FC<NavBreadcrumbProps> = ({ from, to, how }) => {
  return (
    <div className="rounded-lg p-4 bg-[#F0F4FF] border border-[#C7D2FE]">
      <div className="flex items-center gap-2 flex-wrap text-sm">
        <span className="font-bold text-indigo-700">{from}</span>
        <svg
          className="w-4 h-4 text-indigo-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="font-bold text-indigo-700">{to}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{how}</p>
    </div>
  );
};

export default NavBreadcrumb;
