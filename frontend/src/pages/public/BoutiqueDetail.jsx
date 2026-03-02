import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiLocationMarker } from 'react-icons/hi';
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
      <div className="text-center py-20">
        <h2 className="text-xl text-gray-700">Boutique non trouvee</h2>
        <Link to="/boutiques" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour aux boutiques
        </Link>
      </div>
    );
  }

  const logoUrl = boutique.logo?.url || 'https://via.placeholder.com/200x200?text=Boutique';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/boutiques" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
          <HiArrowLeft /> Retour aux boutiques
        </Link>

        {/* Boutique header */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-100 flex-shrink-0">
              <img src={logoUrl} alt={boutique.nom} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold text-gray-900">{boutique.nom}</h1>
              <p className="text-gray-600 mt-2">{boutique.description}</p>
              {boutique.adresse && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-2 justify-center md:justify-start">
                  <HiLocationMarker />
                  <span>{boutique.adresse}</span>
                </div>
              )}
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                boutique.statut === 'validee'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {boutique.statut === 'validee' ? 'Boutique verifiee' : boutique.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Tenues de la boutique */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Tenues proposees ({tenues.length})
          </h2>

          {tenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tenues.map((tenue) => (
                <TenuCard key={tenue._id} tenue={tenue} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">Cette boutique n'a pas encore de tenues disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoutiqueDetail;
