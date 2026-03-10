import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserRole, approveVendeur, deleteUser } from '../services/adminService';

const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async (page = 1, role = '', searchTerm = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (role) params.role = role;
      if (searchTerm) params.search = searchTerm;
      const data = await getAllUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, roleFilter, search);
  }, [fetchUsers, roleFilter, search]);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      toast.success('Role mis a jour');
      fetchUsers(pagination.page, roleFilter, search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveVendeur(id);
      toast.success('Vendeur approuve avec succes');
      fetchUsers(pagination.page, roleFilter, search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      toast.success('Utilisateur supprime');
      fetchUsers(pagination.page, roleFilter, search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return {
    users, loading, pagination, roleFilter, setRoleFilter,
    search, setSearch, fetchUsers, handleRoleChange, handleApprove, handleDelete,
  };
};

export default useAdminUsers;
