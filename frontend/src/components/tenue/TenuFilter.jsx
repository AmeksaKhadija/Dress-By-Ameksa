import { TENUE_TYPES, TENUE_COULEURS, TENUE_TAILLES } from '../../utils/constants';

const TenuFilter = ({ filters, onChange, onReset }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filtres</h3>
        <button onClick={onReset} className="text-sm text-primary-600 hover:underline">
          Reinitialiser
        </button>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Tous les types</option>
          {TENUE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Couleur */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
        <select
          value={filters.couleur || ''}
          onChange={(e) => handleChange('couleur', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Toutes les couleurs</option>
          {TENUE_COULEURS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Taille */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
        <select
          value={filters.taille || ''}
          onChange={(e) => handleChange('taille', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Toutes les tailles</option>
          {TENUE_TAILLES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Prix */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prix (MAD)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.prixMin || ''}
            onChange={(e) => handleChange('prixMin', e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.prixMax || ''}
            onChange={(e) => handleChange('prixMax', e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default TenuFilter;
