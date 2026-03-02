import { useState, useEffect } from 'react';
import BoutiqueCard from '../../components/boutique/BoutiqueCard';
import Loader from '../../components/common/Loader';
import { getBoutiques } from '../../services/boutiqueService';

const Boutiques = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoutiques = async () => {
      try {
        const res = await getBoutiques();
        setBoutiques(res.boutiques);
      } catch (err) {
        console.error('Erreur chargement boutiques:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoutiques();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Boutiques</h1>
          <p className="text-gray-500">
            Decouvrez les boutiques partenaires et leurs collections
          </p>
        </div>

        {loading ? (
          <Loader />
        ) : boutiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {boutiques.map((boutique) => (
              <BoutiqueCard key={boutique._id} boutique={boutique} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucune boutique disponible pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Boutiques;
