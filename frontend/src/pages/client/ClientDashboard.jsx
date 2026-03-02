import { Link } from 'react-router-dom';
import { HiClipboardList, HiUserCircle, HiArrowRight } from 'react-icons/hi';
import ClientLayout from '../../components/client/ClientLayout';
import { useAuth } from '../../hooks/useAuth';

const ClientDashboard = () => {
  const { user } = useAuth();

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.nom}
        </h1>
        <p className="text-gray-500 mb-8">Gerez vos reservations et votre profil depuis votre espace client.</p>

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
