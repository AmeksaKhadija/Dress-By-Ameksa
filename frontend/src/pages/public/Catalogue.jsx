import { useState, useEffect, useCallback } from 'react';
import { HiSearch, HiAdjustments, HiX, HiChevronLeft, HiChevronRight, HiCollection } from 'react-icons/hi';
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

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
              Notre Catalogue
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              Explorez notre collection de caftans, takchitas et robes de soiree.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une tenue..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{pagination.total}</span> tenue{pagination.total !== 1 ? 's' : ''} disponible{pagination.total !== 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HiAdjustments size={16} />
            Filtres
            {activeFilterCount > 0 && (
              <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          {/* Mobile overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setShowFilters(false)} />
          )}
          <div className={`
            ${showFilters ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:relative md:block
            fixed inset-y-0 left-0 z-50 w-72 md:w-64 flex-shrink-0
            bg-gray-50 md:bg-transparent p-4 md:p-0
            transition-transform duration-300 ease-in-out
            overflow-y-auto
          `}>
            {/* Mobile close button */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h3 className="font-semibold text-gray-900">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <HiX size={20} />
              </button>
            </div>
            <TenuFilter
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
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
                  <div className="flex justify-center items-center gap-1.5 mt-10">
                    <button
                      onClick={() => fetchTenues(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition"
                    >
                      <HiChevronLeft size={18} />
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => fetchTenues(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                          p === pagination.page
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchTenues(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition"
                    >
                      <HiChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCollection className="text-3xl text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">Aucune tenue trouvee</h3>
                <p className="text-gray-400 text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="mt-4 text-sm text-primary-600 font-medium hover:underline"
                  >
                    Reinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogue;