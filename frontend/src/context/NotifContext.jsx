import { createContext, useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const refreshCount = useCallback(async () => {
    if (!user || !['client', 'vendeur'].includes(user.role)) return;
    try {
      const data = await getUnreadCount();
      if (data.success) setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    refreshCount();
    if (!user || !['client', 'vendeur'].includes(user.role)) return;

    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCount, user]);

  return (
    <NotifContext.Provider value={{ unreadCount, refreshCount }}>
      {children}
    </NotifContext.Provider>
  );
};
