import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMyTenues, deleteTenue, permanentDeleteTenue, restoreTenue, toggleDisponibilite } from '../services/tenueService';

const useTenues = () => {
  const [tenues, setTenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showArchived, setShowArchived] = useState(false);

  const fetchTenues = useCallback(async (page = 1, archivee = false) => {
    setLoading(true);
    try {
      const params = { page, limit: 5 };
      if (archivee) params.archivee = 'true';
      const data = await getMyTenues(params);
      setTenues(data.tenues);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenues(1, showArchived);
  }, [fetchTenues, showArchived]);

  const handleDelete = async (id) => {
    try {
      await deleteTenue(id);
      toast.success('Tenue archivee');
      fetchTenues(pagination.page, showArchived);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await permanentDeleteTenue(id);
      toast.success('Tenue supprimee definitivement');
      fetchTenues(pagination.page, showArchived);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreTenue(id);
      toast.success('Tenue restauree');
      fetchTenues(pagination.page, showArchived);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleToggle = async (id, disponible) => {
    try {
      await toggleDisponibilite(id, disponible);
      setTenues((prev) =>
        prev.map((t) => (t._id === id ? { ...t, disponible } : t))
      );
      toast.success(disponible ? 'Tenue disponible' : 'Tenue indisponible');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return { tenues, loading, pagination, fetchTenues, handleDelete, handlePermanentDelete, handleRestore, handleToggle, showArchived, setShowArchived };
};

export default useTenues;
