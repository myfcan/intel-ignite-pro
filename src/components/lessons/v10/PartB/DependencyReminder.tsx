import React from 'react';

interface DependencyReminderProps {
  text: string;
}

const DependencyReminder: React.FC<DependencyReminderProps> = ({ text }) => {
  return (
    <div
      className="rounded-lg p-4 bg-indigo-50"
      style={{ borderLeft: '3px solid #6366F1' }}
    >
      <p className="text-sm text-indigo-700 leading-relaxed">{text}</p>
    </div>
  );
};

export default DependencyReminder;
