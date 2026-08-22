import api from './api.js';

export const authService = {
  async registerStudent(data) {
    const res = await api.post('/auth/register/student', data);
    return res.data;
  },

  async registerStaff(data) {
    const res = await api.post('/auth/register/staff', data);
    return res.data;
  },

  async loginStudent(data) {
    const res = await api.post('/auth/login/student', data);
    return res.data;
  },

  async loginStaff(data) {
    const res = await api.post('/auth/login/staff', data);
    return res.data;
  },

  async loginAdmin(data) {
    const res = await api.post('/auth/login/admin', data);
    return res.data;
  },

  async sendOtp(data) {
    const res = await api.post('/auth/send-otp', data);
    return res.data;
  },

  async verifyOtp(data) {
    const res = await api.post('/auth/verify-otp', data);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  }
};
export default authService;
