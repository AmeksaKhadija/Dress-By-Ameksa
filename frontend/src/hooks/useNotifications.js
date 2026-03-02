import { useContext } from 'react';
import { NotifContext } from '../context/NotifContext';

export const useNotifications = () => {
  const context = useContext(NotifContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotifProvider');
  }
  return context;
};
