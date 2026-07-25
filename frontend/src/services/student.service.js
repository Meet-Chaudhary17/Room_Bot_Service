import axios from './axios';

export const createRequest = async (requestData) => {
  const response = await axios.post('/students/requests', requestData);
  return response.data;
};

export const getRequestHistory = async (params) => {
  const response = await axios.get('/students/requests', { params });
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await axios.post('/students/complaints', complaintData);
  return response.data;
};

export const getComplaints = async () => {
  const response = await axios.get('/students/complaints');
  return response.data;
};

export const submitFeedback = async (requestId, feedbackData) => {
  const response = await axios.post(`/students/requests/${requestId}/feedback`, feedbackData);
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get('/students/notifications');
  return response.data;
};