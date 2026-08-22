import axios from './axios';

export const login = async (email, password) => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
};

export const registerStudent = async (studentData) => {
  const response = await axios.post('/auth/register/student', studentData);
  return response.data;
};

export const registerStaff = async (staffData) => {
  const response = await axios.post('/auth/register/staff', staffData);
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axios.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await axios.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/auth/logout');
  return response.data;
};