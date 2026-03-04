import { useState, useEffect, useCallback } from 'react';
import { HiCheck, HiBan, HiRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { getAllBoutiques, updateBoutiqueStatut } from '../../services/adminService';

const STATUT_TABS = [
  { value: '', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'validee', label: 'Validees' },
  { value: 'suspendue', label: 'Suspendues' },
];

const STATUT_BADGES = {
  en_attente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  validee: 'bg-green-100 text-green-700 border-green-200',
  suspendue: 'bg-red-100 text-red-700 border-red-200',
};

const STATUT_LABELS = {
  en_attente: 'En attente',
  validee: 'Validee',
  suspendue: 'Suspendue',
};

const GererBoutiques = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [actionModal, setActionModal] = useState(null);

  const fetchBoutiques = useCallback(async (page = 1, statut = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statut) params.statut = statut;
      const data = await getAllBoutiques(params);
      setBoutiques(data.boutiques);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoutiques(1, filter);
  }, [fetchBoutiques, filter]);

  const handleAction = async () => {
    if (!actionModal) return;
    try {
      await updateBoutiqueStatut(actionModal.id, actionModal.action);
      toast.success(
        actionModal.action === 'validee' ? 'Boutique validee' :
        actionModal.action === 'suspendue' ? 'Boutique suspendue' : 'Boutique reactivee'
      );
      setActionModal(null);
      fetchBoutiques(pagination.page, filter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Validation des boutiques</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {STATUT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : boutiques.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">Aucune boutique trouvee</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {boutiques.map((b) => (
                <div key={b._id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      {b.logo?.url ? (
                        <img src={b.logo.url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold">
                          {b.nom?.[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{b.nom}</h3>
                        <p className="text-sm text-gray-500">{b.vendeur?.nom} - {b.vendeur?.email}</p>
                        <p className="text-xs text-gray-400">{b.adresse}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUT_BADGES[b.statut]}`}>
                        {STATUT_LABELS[b.statut]}
                      </span>
                      <div className="flex gap-2">
                        {b.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => setActionModal({ id: b._id, action: 'validee', nom: b.nom })}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition"
                            >
                              <HiCheck size={16} /> Valider
                            </button>
                            <button
                              onClick={() => setActionModal({ id: b._id, action: 'suspendue', nom: b.nom })}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <HiBan size={16} /> Refuser
                            </button>
                          </>
                        )}
                        {b.statut === 'validee' && (
                          <button
                            onClick={() => setActionModal({ id: b._id, action: 'suspendue', nom: b.nom })}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <HiBan size={16} /> Suspendre
                          </button>
                        )}
                        {b.statut === 'suspendue' && (
                          <button
                            onClick={() => setActionModal({ id: b._id, action: 'validee', nom: b.nom })}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            <HiRefresh size={16} /> Reactiver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {b.description && (
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">{b.description}</p>
                  )}
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => fetchBoutiques(p, filter)}
            />
          </>
        )}

        <Modal
          isOpen={!!actionModal}
          onClose={() => setActionModal(null)}
          title={
            actionModal?.action === 'validee' ? 'Valider la boutique' :
            actionModal?.action === 'suspendue' ? 'Suspendre la boutique' : 'Action'
          }
          onConfirm={handleAction}
          confirmText={actionModal?.action === 'validee' ? 'Valider' : 'Suspendre'}
          confirmColor={actionModal?.action === 'validee' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
        >
          <p className="text-gray-600">
            {actionModal?.action === 'validee'
              ? `Voulez-vous valider la boutique "${actionModal?.nom}" ?`
              : `Voulez-vous suspendre la boutique "${actionModal?.nom}" ?`
            }
          </p>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default GererBoutiques;
