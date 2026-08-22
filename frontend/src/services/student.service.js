import axios from './axios';

export const createRequest = async (requestData) => {
  const response = await axios.post('/students/service-requests', requestData);
  return response.data;
};

export const getRequestHistory = async (params) => {
  const response = await axios.get('/students/service-requests', { params });
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
  const response = await axios.post('/students/feedback', {
    request_id: Number(requestId),
    rating: Number(feedbackData.rating),
    comments: feedbackData.comment || feedbackData.comments
  });
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get('/students/notifications');
  return response.data;
};