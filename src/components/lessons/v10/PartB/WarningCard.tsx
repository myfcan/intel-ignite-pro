import React from 'react';

interface WarningCardProps {
  text: string;
}

const WarningCard: React.FC<WarningCardProps> = ({ text }) => {
  // Bold the first sentence
  const dotIndex = text.indexOf('.');
  const firstSentence = dotIndex > 0 ? text.slice(0, dotIndex + 1) : '';
  const rest = dotIndex > 0 ? text.slice(dotIndex + 1) : text;

  return (
    <div
      className="flex"
      style={{
        padding: '8px 10px',
        fontSize: 10,
        color: '#92400E',
        lineHeight: 1.5,
        background: '#FEF3C7',
        borderLeft: '3px solid #F59E0B',
        borderRadius: '0 8px 8px 0',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, flexShrink: 0, lineHeight: 1.5 }}>⚠️</span>
      <span>
        {firstSentence && <strong>{firstSentence}</strong>}
        {rest}
      </span>
    </div>
  );
};

export default WarningCard;
