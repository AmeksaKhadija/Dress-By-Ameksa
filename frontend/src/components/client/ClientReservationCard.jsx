import { HiCalendar, HiCurrencyDollar, HiShoppingBag, HiCreditCard } from 'react-icons/hi';

const STATUT_STYLES = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  confirmee: 'bg-green-100 text-green-800',
  annulee: 'bg-red-100 text-red-800',
  terminee: 'bg-blue-100 text-blue-800',
};

const STATUT_LABELS = {
  en_attente: 'En attente',
  confirmee: 'Confirmee',
  annulee: 'Annulee',
  terminee: 'Terminee',
};

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

const ClientReservationCard = ({ reservation, onPayer }) => {
  const { tenue, dateDebut, dateFin, prixTotal, statut } = reservation;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-4">
      {/* Tenue image */}
      <div className="flex-shrink-0">
        {tenue?.images?.[0]?.url ? (
          <img
            src={tenue.images[0].url}
            alt={tenue.nom}
            className="w-full sm:w-28 h-28 rounded-lg object-cover"
          />
        ) : (
          <div className="w-full sm:w-28 h-28 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            Pas d'image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{tenue?.nom}</h3>
            <p className="text-sm text-gray-500 capitalize">{tenue?.type}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUT_STYLES[statut]}`}>
            {STATUT_LABELS[statut]}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
          {tenue?.boutique?.nom && (
            <div className="flex items-center gap-1.5">
              <HiShoppingBag size={16} className="text-gray-400" />
              <span>{tenue.boutique.nom}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <HiCalendar size={16} className="text-gray-400" />
            <span>{formatDate(dateDebut)} - {formatDate(dateFin)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HiCurrencyDollar size={16} className="text-gray-400" />
            <span>{prixTotal} MAD</span>
          </div>
        </div>

        {/* Actions */}
        {statut === 'en_attente' && (
          <button
            onClick={() => onPayer(reservation._id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <HiCreditCard size={16} />
            Payer maintenant
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientReservationCard;
