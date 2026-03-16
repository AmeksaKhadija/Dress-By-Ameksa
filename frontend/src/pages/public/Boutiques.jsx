import { useState, useEffect } from 'react';
import { HiSearch, HiShoppingBag } from 'react-icons/hi';
import BoutiqueCard from '../../components/boutique/BoutiqueCard';
import Loader from '../../components/common/Loader';
import { getBoutiques } from '../../services/boutiqueService';

const Boutiques = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoutiques = async () => {
      try {
        const res = await getBoutiques();
        setBoutiques(res.boutiques);
        setFiltered(res.boutiques);
      } catch (err) {
        console.error('Erreur chargement boutiques:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoutiques();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(boutiques);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        boutiques.filter(
          (b) =>
            b.nom.toLowerCase().includes(q) ||
            b.description?.toLowerCase().includes(q) ||
            b.adresse?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, boutiques]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-16 border-b border-primary-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzBoNnYtNmg2djZoLTZ6TTYgMzR2Nmg2VjMwSDZ2LTZIMC02djZINnpNMzYgNHY2aC02VjBoNnYtNmg2djZoLTZ6TTYgNHY2aDZWMEg2di02SDB2Nkg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm px-4 py-1.5 rounded-full mb-6">
              <HiShoppingBag />
              <span>{boutiques.length} boutiques partenaires</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Nos Boutiques
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              Decouvrez les boutiques partenaires et explorez leurs collections exclusives de tenues traditionnelles.
            </p>

            {/* Search bar */}
            <div className="max-w-md mx-auto relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Rechercher une boutique..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Boutiques Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {search && (
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} resultat{filtered.length !== 1 ? 's' : ''} pour "{search}"
          </p>
        )}

        {loading ? (
          <Loader />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((boutique) => (
              <BoutiqueCard key={boutique._id} boutique={boutique} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiShoppingBag className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Aucune boutique trouvee</h3>
            <p className="text-gray-400">
              {search ? 'Essayez avec d\'autres termes de recherche.' : 'Aucune boutique disponible pour le moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Boutiques;