import { useState, useEffect, useCallback } from 'react';
import { getClientReservations, signalerRetour, soumettreTemoignage } from '../services/clientReservationService';
import { createCheckoutSession } from '../services/paiementService';
import toast from 'react-hot-toast';

const useClientReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 5 };
      if (statusFilter) params.statut = statusFilter;
      const data = await getClientReservations(params);
      setReservations(data.reservations);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des reservations');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleFilterChange = (statut) => {
    setStatusFilter(statut);
    setPage(1);
  };

  const handlePayer = async (reservationId) => {
    try {
      const data = await createCheckoutSession(reservationId);
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la creation du paiement');
    }
  };

  const handleSignalerRetour = async (reservationId) => {
    try {
      await signalerRetour(reservationId);
      toast.success('Retour signale avec succes');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du signalement du retour');
    }
  };

  const handleSoumettreTemoignage = async (reservationId, note) => {
    try {
      await soumettreTemoignage(reservationId, note);
      toast.success('Merci pour votre temoignage!');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission du temoignage');
    }
  };

  return {
    reservations,
    loading,
    pagination,
    statusFilter,
    page,
    setPage,
    handleFilterChange,
    handlePayer,
    handleSignalerRetour,
    handleSoumettreTemoignage,
    fetchReservations,
  };
};

export default useClientReservation;
