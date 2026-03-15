import React from 'react';

interface CelebrationCardProps {
  text: string;
  next?: string;
}

const CelebrationCard: React.FC<CelebrationCardProps> = ({ text, next }) => {
  return (
    <div className="rounded-lg p-5 bg-[#ECFDF5] border border-[#A7F3D0] text-center">
      <div className="flex justify-center mb-3">
        <div className="w-10 h-10 rounded-full bg-[#34D399] flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <p className="text-base font-bold text-green-700 leading-snug">{text}</p>
      {next && (
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{next}</p>
      )}
    </div>
  );
};

export default CelebrationCard;
