import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, changePassword } from '../services/clientService';
import { useAuth } from './useAuth';

const useProfile = () => {
  const { user: authUser, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const data = await updateProfile(formData);
      setProfile(data.user);
      // Sync with AuthContext
      login(data.user, token);
      toast.success('Profil mis a jour');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise a jour');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    setSaving(true);
    try {
      await changePassword(passwordData);
      toast.success('Mot de passe modifie avec succes');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, fetchProfile, handleUpdate, handleChangePassword };
};

export default useProfile;
