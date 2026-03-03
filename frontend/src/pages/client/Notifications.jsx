import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiBell,
  HiCheckCircle,
  HiXCircle,
  HiCreditCard,
  HiClipboardList,
  HiCheck,
} from 'react-icons/hi';
import ClientLayout from '../../components/client/ClientLayout';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useNotifications } from '../../hooks/useNotifications';

const TYPE_ICONS = {
  reservation_confirmee: { icon: HiCheckCircle, color: 'text-green-500' },
  reservation_annulee: { icon: HiXCircle, color: 'text-red-500' },
  reservation_terminee: { icon: HiClipboardList, color: 'text-blue-500' },
  paiement_reussi: { icon: HiCreditCard, color: 'text-green-500' },
  paiement_echoue: { icon: HiCreditCard, color: 'text-red-500' },
  nouvelle_reservation: { icon: HiBell, color: 'text-primary-500' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'A l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { refreshCount } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ page, limit: 5 });
      if (data.success) {
        setNotifications(data.notifications);
        setPagination(data.pagination);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleClick = async (notif) => {
    if (!notif.lue) {
      await markAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, lue: true } : n))
      );
      refreshCount();
    }
    if (notif.lien) navigate(notif.lien);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
    refreshCount();
  };

  const hasUnread = notifications.some((n) => !n.lue);

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <HiCheck size={16} />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <HiBell className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg">Aucune notification</p>
            <p className="text-gray-400 text-sm mt-1">Vous recevrez des notifications ici</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((notif) => {
                const typeConfig = TYPE_ICONS[notif.type] || TYPE_ICONS.nouvelle_reservation;
                const Icon = typeConfig.icon;

                return (
                  <button
                    key={notif._id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left p-4 rounded-xl transition flex items-start gap-3 ${
                      notif.lue
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-primary-50 hover:bg-primary-100'
                    }`}
                  >
                    <Icon size={20} className={`mt-0.5 flex-shrink-0 ${typeConfig.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${notif.lue ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notif.titre}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                    </div>
                    {!notif.lue && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default Notifications;
