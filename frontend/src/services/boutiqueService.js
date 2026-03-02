import api from './api';

export const getBoutiques = async () => {
  const { data } = await api.get('/public/boutiques');
  return data;
};

export const getBoutiqueById = async (id) => {
  const { data } = await api.get(`/public/boutiques/${id}`);
  return data;
};

// Vendeur endpoints
export const getMyBoutique = async () => {
  const { data } = await api.get('/vendeur/boutique');
  return data;
};

export const createBoutique = async (formData) => {
  const { data } = await api.post('/vendeur/boutique', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateBoutique = async (formData) => {
  const { data } = await api.put('/vendeur/boutique', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
