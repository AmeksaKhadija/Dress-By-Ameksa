import api from './api';

export const createCheckoutSession = async (reservationId) => {
  const { data } = await api.post(`/client/paiement/checkout/${reservationId}`);
  return data;
};

export const verifyPayment = async (sessionId) => {
  const { data } = await api.get(`/client/paiement/verify/${sessionId}`);
  return data;
};
