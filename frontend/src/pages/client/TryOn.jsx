import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiDownload, HiRefresh, HiCalendar, HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { getTenueById } from '../../services/tenueService';
import useTryOn from '../../hooks/useTryOn';

const COULEURS_PEAU = [
  { value: 'tres_claire', label: 'Tres claire', color: '#FDEBD0' },
  { value: 'claire', label: 'Claire', color: '#F5CBA7' },
  { value: 'moyenne', label: 'Moyenne', color: '#E0AC69' },
  { value: 'mate', label: 'Mate', color: '#C68642' },
  { value: 'foncee', label: 'Foncee', color: '#8D5524' },
  { value: 'tres_foncee', label: 'Tres foncee', color: '#5C3310' },
];

const MORPHOLOGIES = [
  { value: 'sablier', label: 'Sablier', desc: 'Epaules et hanches equilibrees, taille marquee', icon: '⌛' },
  { value: 'triangle', label: 'Triangle', desc: 'Hanches plus larges que les epaules', icon: '▽' },
  { value: 'triangle_inverse', label: 'Triangle inverse', desc: 'Epaules plus larges que les hanches', icon: '△' },
  { value: 'rectangle', label: 'Rectangle', desc: 'Epaules, taille et hanches similaires', icon: '▭' },
  { value: 'ronde', label: 'Ronde', desc: 'Silhouette plus ronde au niveau du milieu', icon: '○' },
];

const TryOn = () => {
  const { tenueId } = useParams();
  const navigate = useNavigate();
  const { loading, result, error, generateTryOn, reset } = useTryOn();

  const [tenue, setTenue] = useState(null);
  const [loadingTenue, setLoadingTenue] = useState(true);

  const [form, setForm] = useState({
    taille: '',
    poids: '',
    couleurPeau: '',
    morphologie: '',
  });

  useEffect(() => {
    const fetchTenue = async () => {
      try {
        const data = await getTenueById(tenueId);
        setTenue(data.tenue);
      } catch {
        toast.error('Tenue non trouvee');
        navigate('/catalogue');
      } finally {
        setLoadingTenue(false);
      }
    };
    fetchTenue();
  }, [tenueId, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectOption = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.taille || !form.poids || !form.couleurPeau || !form.morphologie) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    await generateTryOn({
      tenueId,
      taille: Number(form.taille),
      poids: Number(form.poids),
      couleurPeau: form.couleurPeau,
      morphologie: form.morphologie,
    });
  };

  if (loadingTenue) return <Loader />;

  // Result view
  if (result) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to={`/tenue/${tenueId}`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition"
            >
              <HiArrowLeft className="text-xs" /> Retour a la tenue
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-1.5 rounded-full mb-4">
              <HiSparkles />
              Essayage termine
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Resultat de l'essayage virtuel
            </h1>
            <p className="text-gray-500">
              Voici comment <strong className="text-gray-700">{tenue?.nom}</strong> pourrait vous aller
            </p>
          </div>

          {/* Images comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={result.imageGeneree.url}
                  alt={`Essayage virtuel - ${tenue?.nom}`}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
              <div className="p-4 text-center border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-sm text-purple-600 font-medium">
                  <HiSparkles className="text-xs" />
                  Image generee par l'IA
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={tenue?.images?.[0]?.url}
                  alt={tenue?.nom}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
              <div className="p-4 text-center border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  Image originale
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={result.imageGeneree.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition shadow-sm"
            >
              <HiDownload size={18} />
              Telecharger
            </a>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              <HiRefresh size={18} />
              Nouvel essayage
            </button>
            <Link
              to={`/tenue/${tenueId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition shadow-sm"
            >
              <HiCalendar size={18} />
              Reserver cette tenue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={`/tenue/${tenueId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition"
          >
            <HiArrowLeft className="text-xs" /> Retour a la tenue
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dress preview card */}
        <div className="flex items-center gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
          {tenue?.images?.[0] && (
            <img
              src={tenue.images[0].url}
              alt={tenue.nom}
              className="w-20 h-24 object-cover rounded-xl"
            />
          )}
          <div className="flex-1">
            <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full uppercase tracking-wider mb-1">
              {tenue?.type}
            </span>
            <h2 className="text-lg font-bold text-gray-900">{tenue?.nom}</h2>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <HiSparkles className="text-purple-500" />
              Essayage virtuel 3D
            </p>
          </div>
        </div>

        {/* Form title */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Vos mensurations
          </h1>
          <p className="text-gray-500 text-sm">
            Remplissez le formulaire pour generer votre essayage virtuel personnalise.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Taille + Poids */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Mesures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  name="taille"
                  value={form.taille}
                  onChange={handleChange}
                  min="100"
                  max="220"
                  placeholder="Ex: 165"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  name="poids"
                  value={form.poids}
                  onChange={handleChange}
                  min="30"
                  max="200"
                  placeholder="Ex: 60"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Couleur de peau */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Couleur de peau</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {COULEURS_PEAU.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleSelectOption('couleurPeau', c.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                    form.couleurPeau === c.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-inner border border-black/10"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className={`text-xs font-medium ${
                    form.couleurPeau === c.value ? 'text-primary-700' : 'text-gray-600'
                  }`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Morphologie */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Morphologie</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MORPHOLOGIES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleSelectOption('morphologie', m.value)}
                  className={`flex items-start gap-3 p-4 rounded-xl text-left border-2 transition ${
                    form.morphologie === m.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mt-0.5 opacity-60">{m.icon}</span>
                  <div>
                    <span className={`text-sm font-semibold ${
                      form.morphologie === m.value ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {m.label}
                    </span>
                    <p className={`text-xs mt-0.5 ${
                      form.morphologie === m.value ? 'text-primary-500' : 'text-gray-400'
                    }`}>
                      {m.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.taille || !form.poids || !form.couleurPeau || !form.morphologie}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                Generation en cours... (30-60 secondes)
              </>
            ) : (
              <>
                <HiSparkles size={18} />
                Generer mon essayage virtuel
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TryOn;