import React from 'react';

interface NavBreadcrumbProps {
  from: string;
  to: string;
  how: string;
}

const NavBreadcrumb: React.FC<NavBreadcrumbProps> = ({ from, to, how }) => {
  return (
    <div
      style={{
        padding: '8px 10px',
        fontSize: 10,
        background: 'linear-gradient(135deg, #F0F4FF, #EEF0FF)',
        border: '1px solid #C7D2FE',
        borderRadius: 8,
      }}
    >
      <div className="flex items-center flex-wrap" style={{ gap: 4 }}>
        <span style={{ fontSize: 11 }}>📁</span>
        <span style={{ fontWeight: 700, color: '#6366F1' }}>{from}</span>
        <svg
          className="shrink-0"
          style={{ width: 10, height: 10, color: '#A5B4FC', opacity: 0.8 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span style={{ fontWeight: 700, color: '#6366F1' }}>{to}</span>
      </div>
      <p style={{ color: '#6B7280', marginTop: 3, lineHeight: 1.4 }}>{how}</p>
    </div>
  );
};

export default NavBreadcrumb;
