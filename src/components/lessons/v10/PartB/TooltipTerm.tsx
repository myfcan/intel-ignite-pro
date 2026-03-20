import React, { useState, useEffect, useCallback } from 'react';

interface TooltipTermProps {
  term: string;
  tip: string;
}

const TooltipTerm: React.FC<TooltipTermProps> = ({ term, tip }) => {
  const [visible, setVisible] = useState(false);

  const toggle = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <span className="inline-flex items-center relative" style={{ gap: 2 }}>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
        style={{ gap: 2, padding: '0 2px' }}
      >
        <span style={{ color: '#6366F1', borderBottom: '1px dashed #6366F1', fontSize: 10 }}>
          {term}
        </span>
        <span style={{ color: '#6366F1', fontSize: 9, fontWeight: 700 }} aria-hidden="true">
          ⓘ
        </span>
      </button>
      {visible && (
        <span
          role="tooltip"
          className="inline-block ml-1 shadow-lg"
          style={{
            background: '#1E293B',
            color: '#F8FAFC',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 10,
            width: 200,
            lineHeight: 1.4,
          }}
        >
          {tip}
        </span>
      )}
    </span>
  );
};

export default TooltipTerm;
