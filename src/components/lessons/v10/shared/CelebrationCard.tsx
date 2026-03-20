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
        background: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 4 }}>✅</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{text}</p>
      {next && (
        <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{next}</p>
      )}
    </div>
  );
};

export default CelebrationCard;
