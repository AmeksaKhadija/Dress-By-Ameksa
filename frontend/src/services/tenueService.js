import api from './api';

export const getPopularTenues = async () => {
  const { data } = await api.get('/public/tenues/popular');
  return data;
};

export const getTenues = async (params) => {
  const { data } = await api.get('/public/tenues', { params });
  return data;
};

export const getTenueById = async (id) => {
  const { data } = await api.get(`/public/tenues/${id}`);
  return data;
};

export const getSimilarTenues = async (id) => {
  const { data } = await api.get(`/public/tenues/${id}/similar`);
  return data;
};

// Vendeur endpoints
export const getMyTenues = async (params) => {
  const { data } = await api.get('/vendeur/tenues', { params });
  return data;
};

export const getMyTenueById = async (id) => {
  const { data } = await api.get(`/vendeur/tenues/${id}`);
  return data;
};

export const createTenue = async (formData) => {
  const { data } = await api.post('/vendeur/tenues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateTenue = async (id, formData) => {
  const { data } = await api.put(`/vendeur/tenues/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteTenue = async (id) => {
  const { data } = await api.delete(`/vendeur/tenues/${id}`);
  return data;
};

export const toggleDisponibilite = async (id, disponible) => {
  const { data } = await api.patch(`/vendeur/tenues/${id}/disponibilite`, { disponible });
  return data;
};
