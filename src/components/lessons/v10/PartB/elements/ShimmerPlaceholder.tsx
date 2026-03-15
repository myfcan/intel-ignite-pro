import React from 'react';

interface ShimmerPlaceholderProps {
  height: number;
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({ height }) => {
  return (
    <div
      className="w-full rounded-lg bg-gray-200 overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div
        className="h-full w-full animate-pulse"
        style={{
          background:
            'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ShimmerPlaceholder;
