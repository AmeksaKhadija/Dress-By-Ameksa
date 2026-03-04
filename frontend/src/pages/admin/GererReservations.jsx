import { useState } from 'react';
import { HiExclamation, HiCheckCircle } from 'react-icons/hi';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useAdminReservations from '../../hooks/useAdminReservations';
import { formatPrice } from '../../utils/formatPrice';

const STATUT_TABS = [
  { value: '', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmees' },
  { value: 'terminee', label: 'Terminees' },
  { value: 'annulee', label: 'Annulees' },
];

const STATUT_BADGES = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  confirmee: 'bg-blue-100 text-blue-700',
  terminee: 'bg-green-100 text-green-700',
  annulee: 'bg-gray-100 text-gray-600',
};

const GererReservations = () => {
  const {
    reservations, loading, pagination, statusFilter, setStatusFilter,
    litigeFilter, setLitigeFilter, fetchReservations, handleLitigeAction,
  } = useAdminReservations();
  const [litigeModal, setLitigeModal] = useState(null); // { id, litige, commentaire }

  const confirmLitige = async () => {
    if (litigeModal) {
      await handleLitigeAction(litigeModal.id, litigeModal.litige, litigeModal.commentaire);
      setLitigeModal(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des reservations</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {STATUT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setLitigeFilter(!litigeFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              litigeFilter
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HiExclamation size={16} /> Litiges
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">Aucune reservation trouvee</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tenue</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Boutique</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Dates</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map((r) => (
                    <tr key={r._id} className={`hover:bg-gray-50 ${r.litige ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {r.tenue?.images?.[0]?.url ? (
                            <img src={r.tenue.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{r.tenue?.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        <p>{r.client?.nom}</p>
                        <p className="text-xs text-gray-400">{r.client?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{r.tenue?.boutique?.nom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {formatDate(r.dateDebut)} - {formatDate(r.dateFin)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(r.prixTotal)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_BADGES[r.statut]}`}>
                            {r.statut}
                          </span>
                          {r.litige && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Litige
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.litige ? (
                          <button
                            onClick={() => setLitigeModal({ id: r._id, litige: false, commentaire: '' })}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition ml-auto"
                          >
                            <HiCheckCircle size={16} /> Resoudre
                          </button>
                        ) : (
                          <button
                            onClick={() => setLitigeModal({ id: r._id, litige: true, commentaire: '' })}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition ml-auto"
                          >
                            <HiExclamation size={16} /> Signaler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => fetchReservations(p, statusFilter, litigeFilter)}
            />
          </>
        )}

        <Modal
          isOpen={!!litigeModal}
          onClose={() => setLitigeModal(null)}
          title={litigeModal?.litige ? 'Signaler un litige' : 'Resoudre le litige'}
          onConfirm={confirmLitige}
          confirmText={litigeModal?.litige ? 'Signaler' : 'Resoudre'}
          confirmColor={litigeModal?.litige ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
        >
          <div>
            <p className="text-gray-600 mb-3">
              {litigeModal?.litige
                ? 'Ajouter un commentaire pour le litige (optionnel) :'
                : 'Confirmer la resolution du litige ?'
              }
            </p>
            {litigeModal?.litige && (
              <textarea
                value={litigeModal?.commentaire || ''}
                onChange={(e) => setLitigeModal({ ...litigeModal, commentaire: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Decrivez le litige..."
              />
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default GererReservations;
