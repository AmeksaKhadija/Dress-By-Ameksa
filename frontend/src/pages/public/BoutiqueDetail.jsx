import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiLocationMarker, HiCheckCircle, HiCollection } from 'react-icons/hi';
import Loader from '../../components/common/Loader';
import TenuCard from '../../components/tenue/TenuCard';
import { getBoutiqueById } from '../../services/boutiqueService';

const BoutiqueDetail = () => {
  const { id } = useParams();
  const [boutique, setBoutique] = useState(null);
  const [tenues, setTenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getBoutiqueById(id);
        setBoutique(res.boutique);
        setTenues(res.tenues);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loader />;

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiCollection className="text-3xl text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Boutique non trouvee</h2>
          <p className="text-gray-400 mb-4">Cette boutique n'existe pas ou a ete supprimee.</p>
          <Link to="/boutiques" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline">
            <HiArrowLeft /> Retour aux boutiques
          </Link>
        </div>
      </div>
    );
  }

  const logoUrl = boutique.logo?.url || 'https://via.placeholder.com/200x200?text=Boutique';

  // Count unique types
  const types = [...new Set(tenues.map((t) => t.type))];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 pt-8 pb-28 border-b border-primary-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzBoNnYtNmg2djZoLTZ6TTYgMzR2Nmg2VjMwSDZ2LTZIMC02djZINnpNMzYgNHY2aC02VjBoNnYtNmg2djZoLTZ6TTYgNHY2aDZWMEg2di02SDB2Nkg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/boutiques" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition mb-8 text-sm">
            <HiArrowLeft /> Retour aux boutiques
          </Link>
        </div>
      </section>

      {/* Boutique Info Card - overlapping hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Logo */}
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary-100 flex-shrink-0 shadow-sm">
              <img src={logoUrl} alt={boutique.nom} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{boutique.nom}</h1>
                {boutique.statut === 'validee' && (
                  <HiCheckCircle className="text-primary-500 text-2xl" title="Boutique verifiee" />
                )}
              </div>
              <p className="text-gray-500 mt-1 max-w-2xl">{boutique.description}</p>
              {boutique.adresse && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-3 justify-center md:justify-start">
                  <HiLocationMarker className="flex-shrink-0" />
                  <span>{boutique.adresse}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 md:gap-8 flex-shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-700">{tenues.length}</div>
                <div className="text-xs text-gray-400 mt-0.5">Tenues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-700">{types.length}</div>
                <div className="text-xs text-gray-400 mt-0.5">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenues Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Collection
          </h2>
          {types.length > 0 && (
            <div className="flex gap-2">
              {types.map((type) => (
                <span key={type} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>

        {tenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tenues.map((tenue) => (
              <TenuCard key={tenue._id} tenue={tenue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCollection className="text-2xl text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-700 mb-1">Aucune tenue disponible</h3>
            <p className="text-sm text-gray-400">Cette boutique n'a pas encore ajoute de tenues.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoutiqueDetail;