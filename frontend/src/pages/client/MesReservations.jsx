import { Link } from 'react-router-dom';
import ClientLayout from '../../components/client/ClientLayout';
import ClientReservationCard from '../../components/client/ClientReservationCard';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import useClientReservation from '../../hooks/useClientReservation';
import { HiClipboardList, HiPlus } from 'react-icons/hi';

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
    setPage,
    handleFilterChange,
    handlePayer,
  } = useClientReservation();

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes Reservations</h1>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            <HiPlus size={16} />
            Nouvelle reservation
          </Link>
        </div>

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

export default MesReservations;
