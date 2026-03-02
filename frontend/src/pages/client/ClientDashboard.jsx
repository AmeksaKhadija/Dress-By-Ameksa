import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiClipboardList, HiUserCircle, HiArrowRight, HiClock, HiCheckCircle, HiFlag } from 'react-icons/hi';
import ClientLayout from '../../components/client/ClientLayout';
import { useAuth } from '../../hooks/useAuth';
import { getClientDashboardStats } from '../../services/clientReservationService';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getClientDashboardStats();
        if (data.success) setStats(data.stats);
      } catch {
        // silently fail
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { label: 'Total', value: stats.total, icon: HiClipboardList, color: 'bg-primary-50 text-primary-600' },
        { label: 'En attente', value: stats.enAttente, icon: HiClock, color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Confirmees', value: stats.confirmee, icon: HiCheckCircle, color: 'bg-green-50 text-green-600' },
        { label: 'Terminees', value: stats.terminee, icon: HiFlag, color: 'bg-blue-50 text-blue-600' },
      ]
    : [];

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.nom}
        </h1>
        <p className="text-gray-500 mb-8">Gerez vos reservations et votre profil depuis votre espace client.</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm p-4">
                <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/client/reservations"
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="p-3 bg-primary-50 rounded-lg">
              <HiClipboardList className="text-primary-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Mes Reservations</p>
              <p className="text-sm text-gray-500">Consulter et suivre vos reservations</p>
            </div>
            <HiArrowRight className="text-gray-400" size={20} />
          </Link>

          <Link
            to="/client/profile"
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="p-3 bg-blue-50 rounded-lg">
              <HiUserCircle className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Mon Profil</p>
              <p className="text-sm text-gray-500">Modifier vos informations personnelles</p>
            </div>
            <HiArrowRight className="text-gray-400" size={20} />
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
