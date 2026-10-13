import React from 'react';

const StatusBadge = ({ status }) => {
  const configs = {
    SUBMITTED: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Submitted',
    },
    ASSIGNED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Assigned',
    },
    IN_PROGRESS: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
      label: 'In Progress',
    },
    RESOLVED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Resolved',
    },
    CLOSED: {
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      dot: 'bg-gray-500',
      label: 'Closed',
    },
    REOPENED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Reopened',
    },
  };

  const config = configs[status] || {
    bg: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
