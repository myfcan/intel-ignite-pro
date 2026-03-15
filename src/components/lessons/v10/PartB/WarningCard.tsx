import React from 'react';

interface WarningCardProps {
  text: string;
}

const WarningCard: React.FC<WarningCardProps> = ({ text }) => {
  return (
    <div className="rounded-lg p-4 bg-[#FEF3C7] border border-[#FDE68A]">
      <p className="text-sm leading-relaxed" style={{ color: '#92400E' }}>
        {text}
      </p>
    </div>
  );
};

export default WarningCard;
