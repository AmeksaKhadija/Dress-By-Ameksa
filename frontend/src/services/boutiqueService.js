import api from './api';

export const getBoutiques = async () => {
  const { data } = await api.get('/public/boutiques');
  return data;
};

export const getBoutiqueById = async (id) => {
  const { data } = await api.get(`/public/boutiques/${id}`);
  return data;
};
