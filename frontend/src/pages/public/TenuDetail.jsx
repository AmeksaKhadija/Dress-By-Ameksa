import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCalendar, HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import { addDays, eachDayOfInterval, isWithinInterval } from 'date-fns';
import fr from 'date-fns/locale/fr';
import 'react-datepicker/dist/react-datepicker.css';
import Loader from '../../components/common/Loader';
import TenuCard from '../../components/tenue/TenuCard';
import { getTenueById, getSimilarTenues } from '../../services/tenueService';
import { createReservation } from '../../services/clientReservationService';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/formatPrice';

const TenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenue, setTenue] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReservation, setShowReservation] = useState(false);
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);
  const [selectedTaille, setSelectedTaille] = useState('');
  const [selectedCouleur, setSelectedCouleur] = useState('');
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tenueRes, similarRes] = await Promise.all([
          getTenueById(id),
          getSimilarTenues(id),
        ]);
        setTenue(tenueRes.tenue);
        setReservations(tenueRes.reservations || []);
        setSimilar(similarRes.tenues);
        setSelectedImage(0);
        setSelectedTaille('');
        setSelectedCouleur('');
        setDateDebut(null);
        setDateFin(null);
        setShowReservation(false);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Calculate excluded dates from active reservations
  const excludedDates = useMemo(() => {
    const dates = [];
    reservations.forEach((r) => {
      const start = new Date(r.dateDebut);
      const end = new Date(r.dateFin);
      if (end >= start) {
        eachDayOfInterval({ start, end }).forEach((d) => dates.push(d));
      }
    });
    return dates;
  }, [reservations]);

  // Check if a date is excluded (reserved)
  const isDateExcluded = (date) => {
    return reservations.some((r) => {
      const start = new Date(r.dateDebut);
      const end = new Date(r.dateFin);
      return isWithinInterval(date, { start, end });
    });
  };

  // Check if a date is available as START date
  const isStartDateAvailable = (date) => {
    return !isDateExcluded(date);
  };

  // Max end date: day before the first reserved date after dateDebut
  const maxEndDate = useMemo(() => {
    if (!dateDebut) return null;
    const nextReserved = excludedDates
      .filter((d) => d > dateDebut)
      .sort((a, b) => a - b);
    if (nextReserved.length > 0) {
      return addDays(nextReserved[0], -1);
    }
    return null;
  }, [dateDebut, excludedDates]);

  // Calculate days and total price (minimum 1 day)
  const days = dateDebut && dateFin ? Math.max(1, Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24))) : 0;
  const prixTotal = days > 0 && tenue ? days * tenue.prix : 0;

  if (loading) return <Loader />;
  if (!tenue) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-gray-700">Tenue non trouvee</h2>
        <Link to="/catalogue" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const images = tenue.images?.length > 0
    ? tenue.images
    : [{ url: 'https://via.placeholder.com/600x800?text=Pas+d%27image' }];

  const handleReserve = async () => {
    if (!selectedTaille) {
      toast.error('Veuillez choisir une taille');
      return;
    }
    if (!selectedCouleur) {
      toast.error('Veuillez choisir une couleur');
      return;
    }
    if (!dateDebut || !dateFin) {
      toast.error('Veuillez selectionner les dates');
      return;
    }
    // Verify no reserved dates in the selected range
    const rangeDays = eachDayOfInterval({ start: dateDebut, end: dateFin });
    const hasConflict = rangeDays.some((d) => isDateExcluded(d));
    if (hasConflict) {
      toast.error('La plage selectionnee contient des dates deja reservees');
      return;
    }
    setReserving(true);
    try {
      await createReservation({
        tenueId: id,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        taille: selectedTaille,
        couleur: selectedCouleur,
      });
      toast.success('Reservation creee avec succes!');
      navigate('/client/reservations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la reservation');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link to="/catalogue" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
          <HiArrowLeft /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white">
              <img
                src={images[selectedImage]?.url}
                alt={tenue.nom}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      i === selectedImage ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-primary-600 font-medium uppercase tracking-wide mb-1">
              {tenue.type}
            </p>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{tenue.nom}</h1>

            {tenue.boutique && (
              <Link
                to={`/boutique/${tenue.boutique._id}`}
                className="text-sm text-gray-500 hover:text-primary-600"
              >
                par {tenue.boutique.nom}
              </Link>
            )}

            <p className="text-3xl font-bold text-primary-700 mt-4">{formatPrice(tenue.prix)}</p>
            <p className="text-sm text-gray-400">par jour de location</p>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{tenue.description}</p>
            </div>

            {/* Tailles - selectable */}
            {tenue.tailles?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Taille</h3>
                <div className="flex gap-2 flex-wrap">
                  {tenue.tailles.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTaille(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        selectedTaille === t
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Couleurs - selectable */}
            {tenue.couleurs?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Couleur</h3>
                <div className="flex gap-2 flex-wrap">
                  {tenue.couleurs.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCouleur(c)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        selectedCouleur === c
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Essayer en 3D - DBA-42 */}
            {user && user.role === 'client' && (
              <div className="mt-6">
                <Link
                  to={`/client/tryon/${id}`}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <HiSparkles size={20} />
                  Essayer en 3D avec l'IA
                </Link>
              </div>
            )}

            {/* Reservation - only for authenticated clients */}
            {user && user.role === 'client' && (
              <div className="mt-8">
                {!showReservation ? (
                  <button
                    onClick={() => setShowReservation(true)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <HiCalendar size={20} />
                    Reserver cette tenue
                  </button>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-medium text-gray-900 mb-4">Reserver cette tenue</h3>
                    <div className="space-y-4">
                      {/* Date debut */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date de debut</label>
                        <DatePicker
                          selected={dateDebut}
                          onChange={(date) => {
                            setDateDebut(date);
                            setDateFin(null);
                          }}
                          excludeDates={excludedDates}
                          minDate={addDays(new Date(), 1)}
                          locale={fr}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Choisir une date"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          filterDate={isStartDateAvailable}
                        />
                      </div>

                      {/* Date fin */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
                        <DatePicker
                          selected={dateFin}
                          onChange={(date) => setDateFin(date)}
                          excludeDates={excludedDates}
                          minDate={dateDebut || addDays(new Date(), 1)}
                          maxDate={maxEndDate || undefined}
                          locale={fr}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Choisir une date"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          filterDate={(date) => !isDateExcluded(date)}
                        />
                      </div>

                      {/* Selected options summary */}
                      {(selectedTaille || selectedCouleur) && (
                        <div className="flex gap-3 text-sm text-gray-600">
                          {selectedTaille && (
                            <span>Taille : <strong>{selectedTaille}</strong></span>
                          )}
                          {selectedCouleur && (
                            <span>Couleur : <strong>{selectedCouleur}</strong></span>
                          )}
                        </div>
                      )}

                      {/* Price preview */}
                      {days > 0 && (
                        <p className="text-sm text-gray-600">
                          Prix total : <span className="font-semibold text-primary-700">
                            {formatPrice(prixTotal)}
                          </span>
                          <span className="text-gray-400"> ({days} jours)</span>
                        </p>
                      )}

                      {/* Validation messages */}
                      {!selectedTaille && (
                        <p className="text-xs text-amber-600">Veuillez selectionner une taille ci-dessus</p>
                      )}
                      {!selectedCouleur && (
                        <p className="text-xs text-amber-600">Veuillez selectionner une couleur ci-dessus</p>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleReserve}
                          disabled={reserving || !selectedTaille || !selectedCouleur || !dateDebut || !dateFin}
                          className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reserving ? 'Reservation...' : 'Confirmer'}
                        </button>
                        <button
                          onClick={() => setShowReservation(false)}
                          className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!user && (
              <div className="mt-8">
                <Link
                  to="/login"
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  Connectez-vous pour reserver
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Similar tenues */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Tenues similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similar.map((t) => (
                <TenuCard key={t._id} tenue={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenuDetail;
