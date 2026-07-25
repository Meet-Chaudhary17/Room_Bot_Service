import axios from './axios';

export const getDashboardStats = async () => {
  const response = await axios.get('/admin/dashboard');
  return response.data;
};

export const getStudents = async (params) => {
  const response = await axios.get('/admin/students', { params });
  return response.data;
};

export const toggleStudentBlock = async (studentId, isBlocked) => {
  const response = await axios.patch(`/admin/students/${studentId}/block`, { isBlocked });
  return response.data;
};

export const getStaff = async (params) => {
  const response = await axios.get('/admin/staff', { params });
  return response.data;
};

export const toggleStaffStatus = async (staffId, isActive) => {
  const response = await axios.patch(`/admin/staff/${staffId}/status`, { isActive });
  return response.data;
};

export const getBlocks = async () => {
  const response = await axios.get('/admin/blocks');
  return response.data;
};

export const createBlock = async (blockData) => {
  const response = await axios.post('/admin/blocks', blockData);
  return response.data;
};

export const deleteBlock = async (blockId) => {
  const response = await axios.delete(`/admin/blocks/${blockId}`);
  return response.data;
};

export const getServiceTypes = async () => {
  const response = await axios.get('/admin/service-types');
  return response.data;
};

export const createServiceType = async (serviceTypeData) => {
  const response = await axios.post('/admin/service-types', serviceTypeData);
  return response.data;
};

export const toggleServiceTypeStatus = async (serviceTypeId, isActive) => {
  const response = await axios.patch(`/admin/service-types/${serviceTypeId}/toggle`, { isActive });
  return response.data;
};

export const getRequests = async (params) => {
  const response = await axios.get('/admin/requests', { params });
  return response.data;
};

export const reassignRequest = async (requestId, staffId) => {
  const response = await axios.patch(`/admin/requests/${requestId}/reassign`, { staffId });
  return response.data;
};

export const getComplaints = async (params) => {
  const response = await axios.get('/admin/complaints', { params });
  return response.data;
};

export const resolveComplaint = async (complaintId) => {
  const response = await axios.patch(`/admin/complaints/${complaintId}/resolve`);
  return response.data;
};

export const getFeedbacks = async (params) => {
  const response = await axios.get('/admin/feedbacks', { params });
  return response.data;
};