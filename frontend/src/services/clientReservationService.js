import api from './api';

export const createReservation = async (data) => {
  const { data: res } = await api.post('/client/reservations', data);
  return res;
};

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

export const signalerRetour = async (id) => {
  const { data } = await api.put(`/client/reservations/${id}/signaler-retour`);
  return data;
};

export const soumettreTemoignage = async (id, note) => {
  const { data } = await api.put(`/client/reservations/${id}/temoignage`, { note });
  return data;
};
