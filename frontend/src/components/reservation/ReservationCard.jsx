import { HiCalendar, HiCurrencyDollar, HiUser, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';

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

const ReservationCard = ({ reservation, onAccept, onRefuse, onReturn, onLitige }) => {
  const { tenue, client, dateDebut, dateFin, prixTotal, statut, litige, retourSignale, paiementEffectue } = reservation;

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
          <div className="flex items-center gap-2 flex-shrink-0">
            {litige && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <HiExclamationCircle size={14} /> Litige
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_STYLES[statut]}`}>
              {STATUT_LABELS[statut]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1.5">
            <HiUser size={16} className="text-gray-400" />
            <span>{client?.nom || 'Client inconnu'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HiCalendar size={16} className="text-gray-400" />
            <span>{formatDate(dateDebut)} - {formatDate(dateFin)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HiCurrencyDollar size={16} className="text-gray-400" />
            <span>{prixTotal} MAD</span>
          </div>
        </div>

        {client?.email && (
          <p className="text-xs text-gray-400 mb-3">{client.email} {client.telephone ? `| ${client.telephone}` : ''}</p>
        )}

        {/* Retour signale indicator */}
        {statut === 'confirmee' && retourSignale && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <HiCheckCircle size={18} className="text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-700 font-medium">Le client a signale le retour de la tenue. Veuillez confirmer.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {statut === 'en_attente' && (
            <>
              <button
                onClick={() => onAccept(reservation._id)}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Accepter
              </button>
              <button
                onClick={() => onRefuse(reservation._id)}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Refuser
              </button>
            </>
          )}
          {statut === 'confirmee' && (
            <>
              {paiementEffectue ? (
                <button
                  onClick={() => onReturn(reservation._id)}
                  className={`px-3 py-1.5 text-sm text-white rounded-lg transition ${
                    retourSignale
                      ? 'bg-green-600 hover:bg-green-700 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {retourSignale ? 'Confirmer retour' : 'Marquer retour'}
                </button>
              ) : (
                <span className="px-3 py-1.5 text-sm text-yellow-700 bg-yellow-100 rounded-lg font-medium">
                  En attente de paiement
                </span>
              )}
              <button
                onClick={() => onRefuse(reservation._id)}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                Annuler
              </button>
            </>
          )}
          {(statut === 'confirmee' || statut === 'terminee') && (
            <button
              onClick={() => onLitige(reservation._id, !litige)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                litige
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {litige ? 'Resoudre litige' : 'Signaler litige'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
