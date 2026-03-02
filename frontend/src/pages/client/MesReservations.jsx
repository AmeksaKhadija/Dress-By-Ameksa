import ClientLayout from '../../components/client/ClientLayout';
import ClientReservationCard from '../../components/client/ClientReservationCard';
import Loader from '../../components/common/Loader';
import useClientReservation from '../../hooks/useClientReservation';
import { HiClipboardList } from 'react-icons/hi';

const TABS = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'en_attente' },
  { label: 'Confirmees', value: 'confirmee' },
  { label: 'Terminees', value: 'terminee' },
  { label: 'Annulees', value: 'annulee' },
];

const MesReservations = () => {
  const {
    reservations,
    loading,
    pagination,
    statusFilter,
    page,
    setPage,
    handleFilterChange,
    handlePayer,
  } = useClientReservation();

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Reservations</h1>

        {/* Tabs filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
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
          <div className="text-center py-16">
            <HiClipboardList className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg">Aucune reservation trouvee</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter ? 'Essayez un autre filtre' : 'Vous n\'avez pas encore de reservations'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <ClientReservationCard
                  key={reservation._id}
                  reservation={reservation}
                  onPayer={handlePayer}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Precedent
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 text-sm rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default MesReservations;
