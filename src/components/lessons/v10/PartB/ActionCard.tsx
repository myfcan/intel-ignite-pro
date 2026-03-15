import React from 'react';

interface ActionCardProps {
  text: string;
  accentColor: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ text, accentColor }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <span
        className="text-xs font-bold uppercase tracking-wide"
        style={{ color: accentColor }}
      >
        {'👆 Faça agora'}
      </span>
      <p className="mt-2 text-sm text-gray-800 leading-relaxed">{text}</p>
    </div>
  );
};

export default ActionCard;
