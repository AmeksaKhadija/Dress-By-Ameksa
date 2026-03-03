import { useState } from 'react';
import { HiClipboardList } from 'react-icons/hi';
import VendeurLayout from '../../components/vendeur/VendeurLayout';
import ReservationCard from '../../components/reservation/ReservationCard';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import useReservation from '../../hooks/useReservation';

const TABS = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'en_attente' },
  { label: 'Confirmees', value: 'confirmee' },
  { label: 'Terminees', value: 'terminee' },
  { label: 'Annulees', value: 'annulee' },
];

const GererReservations = () => {
  const {
    reservations,
    loading,
    pagination,
    statusFilter,
    setStatusFilter,
    fetchReservations,
    handleAccept,
    handleRefuse,
    handleReturn,
    handleLitigeAction,
  } = useReservation();

  const [modal, setModal] = useState({ open: false, type: '', id: null });
  const [litigeComment, setLitigeComment] = useState('');

  const openModal = (type, id) => {
    setModal({ open: true, type, id });
    setLitigeComment('');
  };

  const closeModal = () => {
    setModal({ open: false, type: '', id: null });
    setLitigeComment('');
  };

  const confirmAction = async () => {
    const { type, id } = modal;
    if (type === 'accept') await handleAccept(id);
    else if (type === 'refuse') await handleRefuse(id);
    else if (type === 'return') await handleReturn(id);
    else if (type === 'litige') await handleLitigeAction(id, true, litigeComment);
    else if (type === 'resolve') await handleLitigeAction(id, false);
    closeModal();
  };

  const modalConfig = {
    accept: { title: 'Accepter la reservation', text: 'Voulez-vous accepter cette reservation ?', color: 'bg-green-600 hover:bg-green-700', confirmText: 'Accepter' },
    refuse: { title: 'Refuser la reservation', text: 'Voulez-vous refuser cette reservation ? Cette action est irreversible.', color: 'bg-red-600 hover:bg-red-700', confirmText: 'Refuser' },
    return: { title: 'Confirmer le retour', text: 'La tenue a bien ete retournee ?', color: 'bg-blue-600 hover:bg-blue-700', confirmText: 'Confirmer retour' },
    litige: { title: 'Signaler un litige', text: '', color: 'bg-orange-600 hover:bg-orange-700', confirmText: 'Signaler' },
    resolve: { title: 'Resoudre le litige', text: 'Le litige a ete resolu ?', color: 'bg-green-600 hover:bg-green-700', confirmText: 'Resoudre' },
  };

  const currentModal = modalConfig[modal.type] || {};

  return (
    <VendeurLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Reservations</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-primary-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Loader />
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <HiClipboardList className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Aucune reservation trouvee</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reservations.map((r) => (
                <ReservationCard
                  key={r._id}
                  reservation={r}
                  onAccept={(id) => openModal('accept', id)}
                  onRefuse={(id) => openModal('refuse', id)}
                  onReturn={(id) => openModal('return', id)}
                  onLitige={(id, isLitige) => openModal(isLitige ? 'litige' : 'resolve', id)}
                />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => fetchReservations(p, statusFilter)}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={currentModal.title}
        onConfirm={confirmAction}
        confirmText={currentModal.confirmText}
        confirmColor={currentModal.color}
      >
        {modal.type === 'litige' ? (
          <div>
            <p className="text-gray-600 mb-3">Decrivez le litige :</p>
            <textarea
              value={litigeComment}
              onChange={(e) => setLitigeComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Tenue retournee avec des dommages..."
            />
          </div>
        ) : (
          <p className="text-gray-600">{currentModal.text}</p>
        )}
      </Modal>
    </VendeurLayout>
  );
};

export default GererReservations;
