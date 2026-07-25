import axios from './axios';

export const fetchNotificationsHistory = async (role) => {
  const endpoint = role === 'STUDENT' ? '/students/notifications' : '/staff/notifications';
  const response = await axios.get(endpoint);
  return response.data;
};