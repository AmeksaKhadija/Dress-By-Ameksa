import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import Loader from '../../components/common/Loader';
import TenuCard from '../../components/tenue/TenuCard';
import { getTenueById, getSimilarTenues } from '../../services/tenueService';
import { formatPrice } from '../../utils/formatPrice';

const TenuDetail = () => {
  const { id } = useParams();
  const [tenue, setTenue] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkDate, setCheckDate] = useState('');

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
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isDateAvailable = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return !reservations.some((r) => {
      const start = new Date(r.dateDebut);
      const end = new Date(r.dateFin);
      return date >= start && date <= end;
    });
  };

  const availability = checkDate ? isDateAvailable(checkDate) : null;

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

            {/* Tailles */}
            {tenue.tailles?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Tailles disponibles</h3>
                <div className="flex gap-2">
                  {tenue.tailles.map((t) => (
                    <span key={t} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Couleurs */}
            {tenue.couleurs?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Couleurs</h3>
                <div className="flex gap-2 flex-wrap">
                  {tenue.couleurs.map((c) => (
                    <span key={c} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date availability check */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Verifier la disponibilite</h3>
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                {availability !== null && (
                  <span className={`text-sm font-medium ${availability ? 'text-green-600' : 'text-red-600'}`}>
                    {availability ? 'Disponible' : 'Non disponible'}
                  </span>
                )}
              </div>
            </div>
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
