import api from './api';

export const getAllBoutiques = async (statut) => {
  const params = statut ? { statut } : {};
  const { data } = await api.get('/admin/boutiques', { params });
  return data;
};

export const updateBoutiqueStatut = async (id, statut) => {
  const { data } = await api.put(`/admin/boutiques/${id}/statut`, { statut });
  return data;
};
