import React from 'react';

interface WarningCardProps {
  text: string;
}

const WarningCard: React.FC<WarningCardProps> = ({ text }) => {
  return (
    <div
      style={{
        padding: '8px 10px',
        fontSize: 10,
        color: '#92400E',
        lineHeight: 1.5,
        background: '#FEF3C7',
        border: '1px solid #FDE68A',
        borderRadius: 8,
      }}
    >
      {text}
    </div>
  );
};

export default WarningCard;
