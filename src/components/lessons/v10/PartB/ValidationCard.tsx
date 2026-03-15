import React from 'react';

interface ValidationCardProps {
  text: string;
}

const ValidationCard: React.FC<ValidationCardProps> = ({ text }) => {
  return (
    <div className="rounded-lg p-4 bg-[#ECFDF5] border border-[#A7F3D0]">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-full bg-[#34D399] flex items-center justify-center mt-0.5">
          <svg
            className="w-3.5 h-3.5 text-white"
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
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-green-700">
            Deu certo se
          </span>
          <p className="mt-1 text-sm text-green-800 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default ValidationCard;
