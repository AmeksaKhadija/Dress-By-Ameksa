import api from './api';

export const getProfile = async () => {
  const { data } = await api.get('/client/profile');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/client/profile', profileData);
  return data;
};

export const changePassword = async (passwordData) => {
  const { data } = await api.put('/client/profile/password', passwordData);
  return data;
};
