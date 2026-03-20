import React from 'react';

interface CelebrationCardProps {
  text: string;
  next?: string;
}

const CelebrationCard: React.FC<CelebrationCardProps> = ({ text, next }) => {
  return (
    <div
      style={{
        padding: 16,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
        border: '1px solid #6EE7B7',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 32,
          marginBottom: 4,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        ✅
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{text}</p>
      {next && (
        <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{next}</p>
      )}
    </div>
  );
};

export default CelebrationCard;
