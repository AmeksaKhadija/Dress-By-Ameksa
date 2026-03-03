import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMyTenues, deleteTenue, toggleDisponibilite } from '../services/tenueService';

const useTenues = () => {
  const [tenues, setTenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchTenues = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getMyTenues({ page, limit: 5 });
      setTenues(data.tenues);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenues();
  }, [fetchTenues]);

  const handleDelete = async (id) => {
    try {
      await deleteTenue(id);
      toast.success('Tenue supprimee');
      fetchTenues(pagination.page);
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

  return { tenues, loading, pagination, fetchTenues, handleDelete, handleToggle };
};

export default useTenues;
