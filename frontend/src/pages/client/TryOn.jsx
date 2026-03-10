import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiDownload, HiRefresh, HiCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { getTenueById } from '../../services/tenueService';
import useTryOn from '../../hooks/useTryOn';

const COULEURS_PEAU = [
  { value: 'tres_claire', label: 'Tres claire' },
  { value: 'claire', label: 'Claire' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'mate', label: 'Mate' },
  { value: 'foncee', label: 'Foncee' },
  { value: 'tres_foncee', label: 'Tres foncee' },
];

const MORPHOLOGIES = [
  { value: 'sablier', label: 'Sablier', desc: 'Epaules et hanches equilibrees, taille marquee' },
  { value: 'triangle', label: 'Triangle', desc: 'Hanches plus larges que les epaules' },
  { value: 'triangle_inverse', label: 'Triangle inverse', desc: 'Epaules plus larges que les hanches' },
  { value: 'rectangle', label: 'Rectangle', desc: 'Epaules, taille et hanches similaires' },
  { value: 'ronde', label: 'Ronde', desc: 'Silhouette plus ronde au niveau du milieu' },
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to={`/tenue/${tenueId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
          >
            <HiArrowLeft /> Retour a la tenue
          </Link>

          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Resultat de l'essayage virtuel
          </h1>
          <p className="text-gray-500 mb-6">
            Voici comment <strong>{tenue?.nom}</strong> pourrait vous aller
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img
                src={result.imageGeneree.url}
                alt={`Essayage virtuel - ${tenue?.nom}`}
                className="w-full h-auto object-contain"
              />
              <div className="p-4 text-center text-sm text-gray-500">
                Image generee par l'IA
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img
                src={tenue?.images?.[0]?.url}
                alt={tenue?.nom}
                className="w-full h-auto object-contain"
              />
              <div className="p-4 text-center text-sm text-gray-500">
                Image originale de la tenue
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={result.imageGeneree.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
            >
              <HiDownload size={18} />
              Telecharger
            </a>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <HiRefresh size={18} />
              Nouvel essayage
            </button>
            <Link
              to={`/tenue/${tenueId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/tenue/${tenueId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <HiArrowLeft /> Retour a la tenue
        </Link>

        {/* Dress preview */}
        <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm mb-8">
          {tenue?.images?.[0] && (
            <img
              src={tenue.images[0].url}
              alt={tenue.nom}
              className="w-20 h-24 object-cover rounded-lg"
            />
          )}
          <div>
            <p className="text-sm text-primary-600 font-medium uppercase">{tenue?.type}</p>
            <h2 className="text-lg font-bold text-gray-900">{tenue?.nom}</h2>
            <p className="text-sm text-gray-500">Essayage virtuel 3D</p>
          </div>
        </div>

        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Vos mensurations
        </h1>
        <p className="text-gray-500 mb-6">
          Remplissez le formulaire ci-dessous pour generer votre essayage virtuel
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Taille + Poids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille (cm) *
              </label>
              <input
                type="number"
                name="taille"
                value={form.taille}
                onChange={handleChange}
                min="100"
                max="220"
                placeholder="Ex: 165"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids (kg) *
              </label>
              <input
                type="number"
                name="poids"
                value={form.poids}
                onChange={handleChange}
                min="30"
                max="200"
                placeholder="Ex: 60"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Couleur de peau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de peau *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COULEURS_PEAU.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleSelectOption('couleurPeau', c.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                    form.couleurPeau === c.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Morphologie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Morphologie *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MORPHOLOGIES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleSelectOption('morphologie', m.value)}
                  className={`px-4 py-3 rounded-lg text-left border transition ${
                    form.morphologie === m.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <span className="text-sm font-medium">{m.label}</span>
                  <p className={`text-xs mt-0.5 ${
                    form.morphologie === m.value ? 'text-primary-100' : 'text-gray-400'
                  }`}>
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.taille || !form.poids || !form.couleurPeau || !form.morphologie}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                Generation en cours... (30-60 secondes)
              </>
            ) : (
              'Generer mon essayage virtuel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TryOn;
