import { useState, useEffect, useCallback } from 'react';
import { HiSearch, HiAdjustments } from 'react-icons/hi';
import TenuCard from '../../components/tenue/TenuCard';
import TenuFilter from '../../components/tenue/TenuFilter';
import Loader from '../../components/common/Loader';
import { getTenues } from '../../services/tenueService';

const defaultFilters = { type: '', couleur: '', taille: '', prixMin: '', prixMax: '' };

const Catalogue = () => {
  const [tenues, setTenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTenues = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });

      const res = await getTenues(params);
      setTenues(res.results);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Erreur chargement catalogue:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchTenues(1);
  }, [fetchTenues]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTenues(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Catalogue</h1>
          <p className="text-gray-500">
            {pagination.total} tenue{pagination.total !== 1 ? 's' : ''} disponible{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une tenue..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
          >
            <HiAdjustments size={20} />
            Filtres
          </button>
        </form>

        <div className="flex gap-8">
          {/* Sidebar filters - desktop always visible, mobile toggle */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <TenuFilter
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <Loader />
            ) : tenues.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenues.map((tenue) => (
                    <TenuCard key={tenue._id} tenue={tenue} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => fetchTenues(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                      Precedent
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => fetchTenues(p)}
                        className={`px-4 py-2 rounded-lg ${
                          p === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'border hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchTenues(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Aucune tenue trouvee</p>
                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogue;
