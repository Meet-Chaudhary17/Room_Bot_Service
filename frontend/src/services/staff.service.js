import api from './api.js';

export const staffService = {
  async getDashboard() {
    const res = await api.get('/staff/dashboard');
    return res.data;
  },

  async listRequests(filters = {}) {
    const res = await api.get('/staff/service-requests', { params: filters });
    return res.data;
  },

  async getRequestDetails(requestId) {
    const res = await api.get(`/staff/service-requests/${requestId}`);
    return res.data;
  },

  async startWork(requestId) {
    const res = await api.patch(`/staff/service-requests/${requestId}/status`, { status: 'In Progress' });
    return res.data;
  },

  async getOccupants(requestId) {
    const res = await api.get(`/staff/service-requests/${requestId}/occupants`);
    return res.data;
  },

  async generateOtp(requestId, studentId) {
    const res = await api.post(`/staff/service-requests/${requestId}/generate-otp`, { studentId });
    return res.data;
  },

  async verifyOtp(requestId, otp, studentId) {
    const res = await api.post(`/staff/service-requests/${requestId}/verify-otp`, { otp, studentId });
    return res.data;
  },

  async getHistory(filters = {}) {
    const res = await api.get('/staff/history', { params: filters });
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/staff/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/staff/profile', data);
    return res.data;
  }
};
export default staffService;
