export const formatDate = (dateString, type = 'short') => {
  if (!dateString) return 'Unassigned';
  const date = new Date(dateString);
  
  if (type === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ASSIGNED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'OTP_PENDING':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getPriorityBadgeClass = (priority) => {
  if (priority === 1) return 'bg-slate-50 text-slate-700 border-slate-200';
  if (priority === 2) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};