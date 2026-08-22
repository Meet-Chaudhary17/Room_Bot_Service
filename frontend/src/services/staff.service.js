import axios from './axios';

export const getDashboard = async () => {
  const response = await axios.get('/staff/dashboard');
  return response.data;
};

export const getAssignedRequests = async (params) => {
  const response = await axios.get('/staff/requests', { params });
  return response.data;
};

export const startRequestWork = async (requestId) => {
  const response = await axios.patch(`/staff/requests/${requestId}/start`);
  return response.data;
};

export const getRequestOccupants = async (requestId) => {
  const response = await axios.get(`/staff/service-requests/${requestId}/occupants`);
  return response.data;
};

export const generateCompletionOtp = async (requestId, studentId) => {
  const response = await axios.post(`/staff/service-requests/${requestId}/generate-otp`, { studentId });
  return response.data;
};

export const verifyCompletionOtp = async (requestId, studentId, otp) => {
  const response = await axios.post(`/staff/service-requests/${requestId}/verify-otp`, { studentId, otp });
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get('/staff/profile');
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get('/staff/notifications');
  return response.data;
};