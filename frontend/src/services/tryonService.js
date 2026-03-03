import api from './api';

export const generateTryOn = async (data) => {
  const { data: res } = await api.post('/client/tryon', data);
  return res;
};

export const getMyTryOns = async () => {
  const { data } = await api.get('/client/tryon');
  return data;
};

export const getTryOnById = async (id) => {
  const { data } = await api.get(`/client/tryon/${id}`);
  return data;
};

export const deleteTryOn = async (id) => {
  const { data } = await api.delete(`/client/tryon/${id}`);
  return data;
};
