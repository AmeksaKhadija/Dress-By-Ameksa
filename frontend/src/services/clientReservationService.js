import api from './api';

export const getClientReservations = async (params = {}) => {
  const { data } = await api.get('/client/reservations', { params });
  return data;
};

export const getClientReservationById = async (id) => {
  const { data } = await api.get(`/client/reservations/${id}`);
  return data;
};

export const getClientDashboardStats = async () => {
  const { data } = await api.get('/client/dashboard');
  return data;
};
