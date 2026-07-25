export const STAFF_ROLES = {
  CLEANING: 'CLEANING',
  ELECTRICIAN: 'ELECTRICIAN',
  PLUMBER: 'PLUMBER',
  CARPENTER: 'CARPENTER',
  GENERAL: 'GENERAL'
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  OTP_PENDING: 'OTP_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
};

export const COMPLAINT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

export const SERVICE_CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', role: 'CLEANING' },
  { id: 'ac', name: 'AC Maintenance', role: 'GENERAL' },
  { id: 'electrical', name: 'Electrical', role: 'ELECTRICIAN' },
  { id: 'plumbing', name: 'Plumbing', role: 'PLUMBER' },
  { id: 'furniture', name: 'Furniture', role: 'CARPENTER' }
];