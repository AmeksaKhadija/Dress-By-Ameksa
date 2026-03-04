import api from './api';

// ---- Profile ----
export const getAdminProfile = async () => {
  const { data } = await api.get('/admin/profile');
  return data;
};

export const updateAdminProfile = async (formData) => {
  const { data } = await api.put('/admin/profile', formData);
  return data;
};

export const changeAdminPassword = async (passwordData) => {
  const { data } = await api.put('/admin/profile/password', passwordData);
  return data;
};

// ---- Boutiques ----
export const getAllBoutiques = async (params = {}) => {
  const { data } = await api.get('/admin/boutiques', { params });
  return data;
};

export const updateBoutiqueStatut = async (id, statut) => {
  const { data } = await api.put(`/admin/boutiques/${id}/statut`, { statut });
  return data;
};

// ---- Users ----
export const getAllUsers = async (params) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.put(`/admin/users/${id}/role`, { role });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

// ---- Reservations ----
export const getAllReservations = async (params) => {
  const { data } = await api.get('/admin/reservations', { params });
  return data;
};

export const getReservationById = async (id) => {
  const { data } = await api.get(`/admin/reservations/${id}`);
  return data;
};

export const resolverLitige = async (id, litigeData) => {
  const { data } = await api.put(`/admin/reservations/${id}/litige`, litigeData);
  return data;
};

// ---- Dashboard & Stats ----
export const getDashboardStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

// ---- Commissions ----
export const getCommissions = async (params = {}) => {
  const { data } = await api.get('/admin/commissions', { params });
  return data;
};
