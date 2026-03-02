import api from './api';

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/client/notifications', { params });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/client/notifications/unread-count');
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`/client/notifications/${id}/lire`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.put('/client/notifications/lire-tout');
  return data;
};
