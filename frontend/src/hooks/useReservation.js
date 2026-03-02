import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getMyReservations,
  updateReservationStatut,
  markAsReturned,
  handleLitige,
} from '../services/reservationService';

const useReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReservations = useCallback(async (page = 1, statut = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statut) params.statut = statut;
      const data = await getMyReservations(params);
      setReservations(data.reservations);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(1, statusFilter);
  }, [fetchReservations, statusFilter]);

  const handleAccept = async (id) => {
    try {
      await updateReservationStatut(id, 'confirmee');
      toast.success('Reservation acceptee');
      fetchReservations(pagination.page, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleRefuse = async (id) => {
    try {
      await updateReservationStatut(id, 'annulee');
      toast.success('Reservation refusee');
      fetchReservations(pagination.page, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleReturn = async (id) => {
    try {
      await markAsReturned(id);
      toast.success('Retour enregistre');
      fetchReservations(pagination.page, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleLitigeAction = async (id, litige, commentaireLitige = '') => {
    try {
      await handleLitige(id, { litige, commentaireLitige });
      toast.success(litige ? 'Litige signale' : 'Litige resolu');
      fetchReservations(pagination.page, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return {
    reservations,
    loading,
    pagination,
    statusFilter,
    setStatusFilter,
    fetchReservations,
    handleAccept,
    handleRefuse,
    handleReturn,
    handleLitigeAction,
  };
};

export default useReservation;
