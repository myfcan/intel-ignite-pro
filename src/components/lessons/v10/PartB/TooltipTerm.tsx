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
    <span className="inline-flex items-center gap-1 relative">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 min-h-[44px] px-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
      >
        <span className="text-indigo-600 border-b border-dashed border-indigo-400 text-sm">
          {term}
        </span>
        <span className="text-indigo-400 text-xs select-none" aria-hidden="true">
          {'\u24D8'}
        </span>
      </button>
      {visible && (
        <span
          role="tooltip"
          className="inline-block ml-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs leading-relaxed max-w-xs shadow-lg"
        >
          {tip}
        </span>
      )}
    </span>
  );
};

export default TooltipTerm;
