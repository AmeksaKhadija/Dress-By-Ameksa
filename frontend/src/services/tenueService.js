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
