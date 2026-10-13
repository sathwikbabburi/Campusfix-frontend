import React from 'react';

const PriorityBadge = ({ priority }) => {
  const configs = {
    LOW: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      label: 'High Priority',
    },
    CRITICAL: {
      bg: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
      label: 'CRITICAL',
    },
  };

  const config = configs[priority] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    label: priority || 'Normal',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${config.bg}`}
    >
      {config.label}
    </span>
  );
};

export default PriorityBadge;
