import api from './api.js';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async listStudents(filters = {}) {
    const res = await api.get('/admin/students', { params: filters });
    return res.data;
  },

  async listStaff(filters = {}) {
    const res = await api.get('/admin/staff', { params: filters });
    return res.data;
  },

  async updateStudentStatus(studentId, status) {
    const res = await api.patch(`/admin/students/${studentId}/status`, { status });
    return res.data;
  },

  async updateStaffStatus(staffId, status) {
    const res = await api.patch(`/admin/staff/${staffId}/status`, { status });
    return res.data;
  },

  async listServiceRequests(filters = {}) {
    const res = await api.get('/admin/service-requests', { params: filters });
    return res.data;
  },

  async listComplaints(filters = {}) {
    const res = await api.get('/admin/complaints', { params: filters });
    return res.data;
  },

  async resolveComplaint(complaintId, status, resolutionNotes) {
    const res = await api.patch(`/admin/complaints/${complaintId}/status`, { status, resolutionNotes });
    return res.data;
  },

  async listFeedback(filters = {}) {
    const res = await api.get('/admin/feedback', { params: filters });
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/admin/profile');
    return res.data;
  },

  async listAuditLogs(filters = {}) {
    const res = await api.get('/admin/audit-logs', { params: filters });
    return res.data;
  }
};
export default adminService;
