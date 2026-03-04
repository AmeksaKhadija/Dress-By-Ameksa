import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiUsers, HiShoppingBag, HiClipboardList, HiCurrencyDollar, HiExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

const ROLE_LABELS = { client: 'Client', vendeur: 'Vendeur', admin: 'Admin' };
const ROLE_COLORS = { client: 'bg-blue-100 text-blue-700', vendeur: 'bg-green-100 text-green-700', admin: 'bg-indigo-100 text-indigo-700' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (error) {
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <AdminLayout><Loader /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue, {user?.nom}</h1>
        <p className="text-gray-500 mb-8">Vue d'ensemble de la plateforme Dress By Ameksa.</p>

        {/* Main stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={HiUsers} label="Utilisateurs" value={stats?.users?.total || 0} color="text-blue-600" bgColor="bg-blue-50" />
          <StatCard icon={HiShoppingBag} label="Boutiques" value={stats?.boutiques?.total || 0} color="text-green-600" bgColor="bg-green-50" />
          <StatCard icon={HiClipboardList} label="Reservations" value={stats?.reservations?.total || 0} color="text-amber-600" bgColor="bg-amber-50" />
          <StatCard icon={HiCurrencyDollar} label="Revenue total" value={formatPrice(stats?.revenue?.total || 0)} color="text-indigo-600" bgColor="bg-indigo-50" />
        </div>

        {/* Breakdown cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Utilisateurs</h3>
            <div className="space-y-2">
              <BreakdownRow label="Clients" value={stats?.users?.clients || 0} color="bg-blue-500" />
              <BreakdownRow label="Vendeurs" value={stats?.users?.vendeurs || 0} color="bg-green-500" />
              <BreakdownRow label="Admins" value={stats?.users?.admins || 0} color="bg-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Boutiques</h3>
            <div className="space-y-2">
              <BreakdownRow label="Validees" value={stats?.boutiques?.validees || 0} color="bg-green-500" />
              <BreakdownRow label="En attente" value={stats?.boutiques?.en_attente || 0} color="bg-yellow-500" />
              <BreakdownRow label="Suspendues" value={stats?.boutiques?.suspendues || 0} color="bg-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Reservations</h3>
            <div className="space-y-2">
              <BreakdownRow label="En attente" value={stats?.reservations?.en_attente || 0} color="bg-yellow-500" />
              <BreakdownRow label="Confirmees" value={stats?.reservations?.confirmees || 0} color="bg-blue-500" />
              <BreakdownRow label="Terminees" value={stats?.reservations?.terminees || 0} color="bg-green-500" />
              <BreakdownRow label="Annulees" value={stats?.reservations?.annulees || 0} color="bg-gray-400" />
            </div>
          </div>
        </div>

        {/* Revenue + Litiges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Commissions ({(stats?.revenue?.commissionRate || 0.15) * 100}%)</h3>
            <p className="text-2xl font-bold text-indigo-600">{formatPrice(stats?.revenue?.commissions || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">sur {formatPrice(stats?.revenue?.total || 0)} de revenue</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <HiExclamation className="text-red-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Litiges</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats?.reservations?.litiges || 0}</p>
            <p className="text-sm text-gray-500 mt-1">reservation(s) en litige</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Derniers utilisateurs</h3>
            {stats?.recent?.users?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.users.map((u) => (
                  <div key={u._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.nom}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun utilisateur</p>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Dernieres reservations</h3>
            {stats?.recent?.reservations?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.reservations.map((r) => (
                  <div key={r._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.tenue?.nom}</p>
                      <p className="text-xs text-gray-500">par {r.client?.nom}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatPrice(r.prixTotal)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucune reservation</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction to="/admin/utilisateurs" icon={HiUsers} title="Utilisateurs" desc="Gerer les comptes" />
          <QuickAction to="/admin/boutiques" icon={HiShoppingBag} title="Boutiques" desc="Valider les boutiques" />
          <QuickAction to="/admin/reservations" icon={HiClipboardList} title="Reservations" desc="Voir les reservations" />
          <QuickAction to="/admin/commissions" icon={HiCurrencyDollar} title="Commissions" desc="Voir les revenus" />
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}><Icon className={color} size={22} /></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const BreakdownRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, desc }) => (
  <Link to={to} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex items-center gap-4">
    <div className="p-3 bg-indigo-50 rounded-lg"><Icon className="text-indigo-600" size={24} /></div>
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </Link>
);

export default AdminDashboard;
