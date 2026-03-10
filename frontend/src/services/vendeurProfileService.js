import api from './api';

export const getVendeurProfile = async () => {
  const { data } = await api.get('/vendeur/profile');
  return data;
};

export const updateVendeurProfile = async (profileData) => {
  const { data } = await api.put('/vendeur/profile', profileData);
  return data;
};

export const changeVendeurPassword = async (passwordData) => {
  const { data } = await api.put('/vendeur/profile/password', passwordData);
  return data;
};
