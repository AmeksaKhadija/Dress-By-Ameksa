import { useState } from 'react';
import { HiCalendar, HiCurrencyDollar, HiShoppingBag, HiCreditCard, HiStar, HiCheckCircle } from 'react-icons/hi';

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

const ClientReservationCard = ({ reservation, onPayer, onSignalerRetour, onSoumettreTemoignage }) => {
  const { tenue, dateDebut, dateFin, prixTotal, statut, taille, couleur, paiementEffectue, retourSignale, note } = reservation;

  const [selectedNote, setSelectedNote] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitNote = async () => {
    if (selectedNote < 1 || selectedNote > 5) return;
    setSubmitting(true);
    await onSoumettreTemoignage(reservation._id, selectedNote);
    setSubmitting(false);
  };

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

        {/* Taille & Couleur */}
        {(taille || couleur) && (
          <div className="flex gap-3 mb-3">
            {taille && (
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                Taille : {taille}
              </span>
            )}
            {couleur && (
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                Couleur : {couleur}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {statut === 'en_attente' && (
          <p className="text-sm text-yellow-600 font-medium">En attente d'acceptation par le vendeur</p>
        )}

        {statut === 'confirmee' && !paiementEffectue && (
          <button
            onClick={() => onPayer(reservation._id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <HiCreditCard size={16} />
            Payer maintenant
          </button>
        )}

        {statut === 'confirmee' && paiementEffectue && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-green-700 bg-green-100 rounded-lg font-medium">
              <HiCreditCard size={16} />
              Paiement effectue
            </span>
            {!retourSignale ? (
              <button
                onClick={() => onSignalerRetour(reservation._id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <HiCheckCircle size={16} />
                J'ai rendu la tenue
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-orange-700 bg-orange-100 rounded-lg font-medium">
                <HiCheckCircle size={16} />
                Retour signale
              </span>
            )}
          </div>
        )}

        {/* Star rating */}
        {(retourSignale || statut === 'terminee') && !note && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-1">Notez votre experience :</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedNote(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none"
                >
                  <HiStar
                    size={24}
                    className={`transition ${
                      star <= (hoveredStar || selectedNote)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {selectedNote > 0 && (
                <button
                  onClick={handleSubmitNote}
                  disabled={submitting}
                  className="ml-2 px-3 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {submitting ? '...' : 'Valider'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Read-only rating */}
        {note && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-sm text-gray-600 mr-1">Votre note :</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <HiStar
                key={star}
                size={20}
                className={star <= note ? 'text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientReservationCard;
