import api from './api';

const getPrefix = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'vendeur' ? '/vendeur' : '/client';
};

export const getNotifications = async (params = {}) => {
  const { data } = await api.get(`${getPrefix()}/notifications`, { params });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get(`${getPrefix()}/notifications/unread-count`);
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`${getPrefix()}/notifications/${id}/lire`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.put(`${getPrefix()}/notifications/lire-tout`);
  return data;
};
