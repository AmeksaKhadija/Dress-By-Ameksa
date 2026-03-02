import api from './api';

export const getMyReservations = async (params) => {
  const { data } = await api.get('/vendeur/reservations', { params });
  return data;
};

export const getMyReservationById = async (id) => {
  const { data } = await api.get(`/vendeur/reservations/${id}`);
  return data;
};

export const updateReservationStatut = async (id, statut) => {
  const { data } = await api.put(`/vendeur/reservations/${id}/statut`, { statut });
  return data;
};

export const markAsReturned = async (id) => {
  const { data } = await api.put(`/vendeur/reservations/${id}/retour`);
  return data;
};

export const handleLitige = async (id, litigeData) => {
  const { data } = await api.put(`/vendeur/reservations/${id}/litige`, litigeData);
  return data;
};
