import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllReservations, resolverLitige } from '../services/adminService';

const useAdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [litigeFilter, setLitigeFilter] = useState(false);

  const fetchReservations = useCallback(async (page = 1, statut = '', litige = false) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statut) params.statut = statut;
      if (litige) params.litige = 'true';
      const data = await getAllReservations(params);
      setReservations(data.reservations);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(1, statusFilter, litigeFilter);
  }, [fetchReservations, statusFilter, litigeFilter]);

  const handleLitigeAction = async (id, litige, commentaireLitige = '') => {
    try {
      await resolverLitige(id, { litige, commentaireLitige });
      toast.success(litige ? 'Litige signale' : 'Litige resolu');
      fetchReservations(pagination.page, statusFilter, litigeFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return {
    reservations, loading, pagination, statusFilter, setStatusFilter,
    litigeFilter, setLitigeFilter, fetchReservations, handleLitigeAction,
  };
};

export default useAdminReservations;
