import api from './api.js';

export const studentService = {
  async getDashboard() {
    const res = await api.get('/students/dashboard');
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/students/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/students/profile', data);
    return res.data;
  },

  async createRequest(data) {
    const res = await api.post('/students/service-requests', data);
    return res.data;
  },

  async listRequests() {
    const res = await api.get('/students/service-requests');
    return res.data;
  },

  async cancelRequest(requestId) {
    const res = await api.patch(`/students/service-requests/${requestId}/cancel`);
    return res.data;
  },

  async createComplaint(data) {
    const res = await api.post('/students/complaints', data);
    return res.data;
  },

  async listComplaints() {
    const res = await api.get('/students/complaints');
    return res.data;
  },

  async submitFeedback(data) {
    const res = await api.post('/students/feedback', data);
    return res.data;
  }
};
export default studentService;
