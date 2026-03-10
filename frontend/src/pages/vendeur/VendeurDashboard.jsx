import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingBag, HiCollection, HiClipboardList, HiArrowRight, HiCurrencyDollar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import VendeurLayout from '../../components/vendeur/VendeurLayout';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { getMyBoutique } from '../../services/boutiqueService';
import { formatPrice } from '../../utils/formatPrice';

const STATUT_STYLES = {
  en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  validee: 'bg-green-100 text-green-800 border-green-200',
  suspendue: 'bg-red-100 text-red-800 border-red-200',
};

const STATUT_LABELS = {
  en_attente: 'En attente de validation',
  validee: 'Validee',
  suspendue: 'Suspendue',
};

const TYPE_LABELS = {
  caftan: 'Caftan',
  takchita: 'Takchita',
  'robe de soiree': 'Robe de soiree',
};

const VendeurDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [boutique, setBoutique] = useState(null);
  const [stats, setStats] = useState({
    nbTenues: 0,
    nbReservations: 0,
    totalRevenue: 0,
    commission: 0,
    gainsVendeur: 0,
    nbReservationsPayees: 0,
    tenues: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyBoutique();
        if (data.boutique) {
          setBoutique(data.boutique);
          setStats({
            nbTenues: 0,
            nbReservations: 0,
            totalRevenue: 0,
            commission: 0,
            gainsVendeur: 0,
            nbReservationsPayees: 0,
            tenues: [],
            ...data.stats,
          });
        }
      } catch (error) {
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <VendeurLayout><Loader /></VendeurLayout>;

  return (
    <VendeurLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.nom}
        </h1>
        <p className="text-gray-500 mb-8">Gerez votre boutique et vos tenues depuis votre espace vendeur.</p>

        {!boutique ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <HiShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Pas encore de boutique</h2>
            <p className="text-gray-500 mb-6">Commencez par creer votre boutique pour proposer vos tenues.</p>
            <Link
              to="/vendeur/boutique"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Creer ma boutique <HiArrowRight />
            </Link>
          </div>
        ) : (
          <>
            {/* Boutique status */}
            <div className={`rounded-xl border p-4 mb-6 ${STATUT_STYLES[boutique.statut]}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {boutique.logo?.url && (
                    <img src={boutique.logo.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="font-semibold">{boutique.nom}</p>
                    <p className="text-sm">{STATUT_LABELS[boutique.statut]}</p>
                  </div>
                </div>
                <Link to="/vendeur/boutique" className="text-sm underline">
                  Gerer
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={HiShoppingBag}
                label="Boutique"
                value={STATUT_LABELS[boutique.statut]}
                color="text-primary-600"
                bgColor="bg-primary-50"
              />
              <StatCard
                icon={HiCollection}
                label="Tenues"
                value={stats.nbTenues}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={HiClipboardList}
                label="Reservations"
                value={stats.nbReservations}
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
            </div>

            {/* Stats financieres - uniquement si boutique validee */}
            {boutique.statut === 'validee' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenus & Commissions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <StatCard
                    icon={HiCurrencyDollar}
                    label="Revenue total"
                    value={formatPrice(stats.totalRevenue)}
                    color="text-green-600"
                    bgColor="bg-green-50"
                  />
                  <StatCard
                    icon={HiCurrencyDollar}
                    label="Commission plateforme (15%)"
                    value={formatPrice(stats.commission)}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                  />
                  <StatCard
                    icon={HiCurrencyDollar}
                    label="Vos gains (85%)"
                    value={formatPrice(stats.gainsVendeur)}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                  />
                </div>
                {stats.nbReservationsPayees > 0 && (
                  <p className="text-sm text-gray-500 -mt-4 mb-8">
                    Base sur {stats.nbReservationsPayees} reservation{stats.nbReservationsPayees > 1 ? 's' : ''} confirmee{stats.nbReservationsPayees > 1 ? 's' : ''}/terminee{stats.nbReservationsPayees > 1 ? 's' : ''}
                  </p>
                )}
              </>
            )}

            {/* Table des tenues avec prix */}
            {stats.tenues?.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes tenues & prix</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tenue</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.tenues.map((tenue) => (
                        <tr key={tenue._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {tenue.images?.[0]?.url ? (
                                <img src={tenue.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <HiCollection className="text-gray-400" size={18} />
                                </div>
                              )}
                              <span className="font-medium text-gray-900">{tenue.nom}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                              {TYPE_LABELS[tenue.type] || tenue.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {formatPrice(tenue.prix)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              tenue.disponible
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {tenue.disponible ? 'Disponible' : 'Indisponible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Quick actions */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction
                to="/vendeur/tenues"
                icon={HiCollection}
                title="Gerer mes tenues"
                desc="Ajouter, modifier ou supprimer des tenues"
              />
              <QuickAction
                to="/vendeur/reservations"
                icon={HiClipboardList}
                title="Voir les reservations"
                desc="Consulter et gerer les demandes"
              />
            </div>
          </>
        )}
      </div>
    </VendeurLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={color} size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, desc }) => (
  <Link
    to={to}
    className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex items-center gap-4"
  >
    <div className="p-3 bg-primary-50 rounded-lg">
      <Icon className="text-primary-600" size={24} />
    </div>
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </Link>
);

export default VendeurDashboard;
