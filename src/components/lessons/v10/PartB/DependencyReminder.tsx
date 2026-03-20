import React from 'react';

interface DependencyReminderProps {
  text: string;
}

const DependencyReminder: React.FC<DependencyReminderProps> = ({ text }) => {
  return (
    <div
      style={{
        padding: '6px 10px',
        fontSize: 10,
        color: '#4F46E5',
        background: 'rgba(99,102,241,0.04)',
        borderLeft: '3px solid #6366F1',
        borderRadius: '0 6px 6px 0',
      }}
    >
      {text}
    </div>
  );
};

export default DependencyReminder;
