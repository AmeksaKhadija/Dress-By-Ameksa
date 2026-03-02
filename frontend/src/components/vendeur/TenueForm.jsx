import { useState } from 'react';
import { HiPhotograph, HiX } from 'react-icons/hi';
import { TENUE_TYPES, TENUE_TAILLES, TENUE_COULEURS } from '../../utils/constants';

const TenueForm = ({ tenue = null, onSubmit, loading }) => {
  const [form, setForm] = useState({
    nom: tenue?.nom || '',
    type: tenue?.type || '',
    description: tenue?.description || '',
    prix: tenue?.prix || '',
    tailles: tenue?.tailles || [],
    couleurs: tenue?.couleurs || [],
    disponible: tenue?.disponible !== false,
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('type', form.type);
    formData.append('description', form.description);
    formData.append('prix', form.prix);
    formData.append('tailles', JSON.stringify(form.tailles));
    formData.append('couleurs', JSON.stringify(form.couleurs));
    formData.append('disponible', form.disponible);
    files.forEach((f) => formData.append('images', f));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Selectionner</option>
            {TENUE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD) *</label>
          <input
            type="number"
            name="prix"
            value={form.prix}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="disponible"
            checked={form.disponible}
            onChange={(e) => setForm((prev) => ({ ...prev, disponible: e.target.checked }))}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="disponible" className="text-sm text-gray-700">Disponible a la location</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tailles</label>
        <div className="flex flex-wrap gap-2">
          {TENUE_TAILLES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleCheckbox('tailles', t)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                form.tailles.includes(t)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleurs</label>
        <div className="flex flex-wrap gap-2">
          {TENUE_COULEURS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCheckbox('couleurs', c)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition capitalize ${
                form.couleurs.includes(c)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images {tenue ? '(re-upload pour remplacer)' : '*'}
        </label>
        {/* Existing images */}
        {tenue?.images?.length > 0 && files.length === 0 && (
          <div className="flex gap-2 mb-3">
            {tenue.images.map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-20 h-20 rounded-lg object-cover" />
            ))}
          </div>
        )}
        {/* New previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 mb-3">
            {previews.map((p, i) => (
              <img key={i} src={p} alt="" className="w-20 h-20 rounded-lg object-cover" />
            ))}
            <button
              type="button"
              onClick={() => { setFiles([]); setPreviews([]); }}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-red-500"
            >
              <HiX size={20} />
            </button>
          </div>
        )}
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <HiPhotograph size={18} />
          Choisir des images (max 5)
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : tenue ? 'Mettre a jour' : 'Ajouter la tenue'}
      </button>
    </form>
  );
};

export default TenueForm;
