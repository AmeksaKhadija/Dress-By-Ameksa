import { useState, useEffect } from 'react';
import { HiPhotograph, HiSave, HiPlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import VendeurLayout from '../../components/vendeur/VendeurLayout';
import Loader from '../../components/common/Loader';
import { getMyBoutique, createBoutique, updateBoutique } from '../../services/boutiqueService';

const STATUT_STYLES = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  validee: 'bg-green-100 text-green-800',
  suspendue: 'bg-red-100 text-red-800',
};

const STATUT_LABELS = {
  en_attente: 'En attente de validation',
  validee: 'Validee',
  suspendue: 'Suspendue',
};

const GererBoutique = () => {
  const [boutique, setBoutique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    logo: null,
  });

  useEffect(() => {
    fetchBoutique();
  }, []);

  const fetchBoutique = async () => {
    try {
      const data = await getMyBoutique();
      if (data.boutique) {
        setBoutique(data.boutique);
        setForm({
          nom: data.boutique.nom,
          description: data.boutique.description,
          adresse: data.boutique.adresse || '',
          logo: null,
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.description) {
      toast.error('Nom et description sont requis');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('description', form.description);
      formData.append('adresse', form.adresse);
      if (form.logo) {
        formData.append('logo', form.logo);
      }

      if (boutique) {
        const data = await updateBoutique(formData);
        setBoutique(data.boutique);
        toast.success('Boutique mise a jour');
        setIsEditing(false);
      } else {
        const data = await createBoutique(formData);
        setBoutique(data.boutique);
        toast.success('Boutique creee ! En attente de validation.');
      }
      setLogoPreview(null);
      setForm((prev) => ({ ...prev, logo: null }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <VendeurLayout><Loader /></VendeurLayout>;

  if (!boutique) {
    return (
      <VendeurLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Creer ma boutique</h1>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore de boutique. Creez-en une pour commencer a proposer vos tenues.
            </p>
            <BoutiqueForm
              form={form}
              logoPreview={logoPreview}
              existingLogo={null}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              isNew
            />
          </div>
        </div>
      </VendeurLayout>
    );
  }

  return (
    <VendeurLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ma Boutique</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUT_STYLES[boutique.statut]}`}>
            {STATUT_LABELS[boutique.statut]}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {isEditing ? (
            <>
              <BoutiqueForm
                form={form}
                logoPreview={logoPreview}
                existingLogo={boutique.logo?.url}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
              <button
                onClick={() => {
                  setIsEditing(false);
                  setLogoPreview(null);
                  setForm({
                    nom: boutique.nom,
                    description: boutique.description,
                    adresse: boutique.adresse || '',
                    logo: null,
                  });
                }}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Annuler les modifications
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-6 mb-6">
                {boutique.logo?.url ? (
                  <img
                    src={boutique.logo.url}
                    alt={boutique.nom}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                    <HiPhotograph className="text-gray-400" size={32} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{boutique.nom}</h2>
                  {boutique.adresse && (
                    <p className="text-sm text-gray-500 mt-1">{boutique.adresse}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mb-6">{boutique.description}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
              >
                Modifier ma boutique
              </button>
            </>
          )}
        </div>
      </div>
    </VendeurLayout>
  );
};

const BoutiqueForm = ({ form, logoPreview, existingLogo, onChange, onFileChange, onSubmit, submitting, isNew }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique *</label>
      <input
        type="text"
        name="nom"
        value={form.nom}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
      <textarea
        name="description"
        value={form.description}
        onChange={onChange}
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
      <input
        type="text"
        name="adresse"
        value={form.adresse}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
      <div className="flex items-center gap-4">
        {(logoPreview || existingLogo) && (
          <img
            src={logoPreview || existingLogo}
            alt="Logo preview"
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <HiPhotograph size={18} />
          {existingLogo ? 'Changer le logo' : 'Ajouter un logo'}
          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        </label>
      </div>
    </div>
    <button
      type="submit"
      disabled={submitting}
      className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
    >
      {submitting ? (
        'Enregistrement...'
      ) : (
        <>
          {isNew ? <HiPlus size={18} /> : <HiSave size={18} />}
          {isNew ? 'Creer ma boutique' : 'Enregistrer les modifications'}
        </>
      )}
    </button>
  </form>
);

export default GererBoutique;
