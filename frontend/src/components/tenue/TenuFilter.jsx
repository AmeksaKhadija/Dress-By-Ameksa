import { TENUE_TYPES, TENUE_COULEURS, TENUE_TAILLES } from '../../utils/constants';

const TenuFilter = ({ filters, onChange, onReset }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filtres</h3>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            Tout effacer ({activeCount})
          </button>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
        >
          <option value="">Tous les types</option>
          {TENUE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Couleur */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Couleur</label>
        <select
          value={filters.couleur || ''}
          onChange={(e) => handleChange('couleur', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
        >
          <option value="">Toutes les couleurs</option>
          {TENUE_COULEURS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Taille */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Taille</label>
        <select
          value={filters.taille || ''}
          onChange={(e) => handleChange('taille', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
        >
          <option value="">Toutes les tailles</option>
          {TENUE_TAILLES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Prix */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Prix (MAD)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.prixMin || ''}
            onChange={(e) => handleChange('prixMin', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
          />
          <span className="flex items-center text-gray-300">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.prixMax || ''}
            onChange={(e) => handleChange('prixMax', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};

export default TenuFilter;