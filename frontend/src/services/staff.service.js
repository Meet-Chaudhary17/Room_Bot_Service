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

export const requestCompletion = async (requestId) => {
  const response = await axios.post(`/staff/requests/${requestId}/request-completion`);
  return response.data;
};

export const verifyCompletion = async (requestId, otp) => {
  const response = await axios.post(`/staff/requests/${requestId}/verify-completion`, { otp });
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