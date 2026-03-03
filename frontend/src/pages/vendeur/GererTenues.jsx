import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import VendeurLayout from '../../components/vendeur/VendeurLayout';
import TenueForm from '../../components/vendeur/TenueForm';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import useTenues from '../../hooks/useTenues';
import { createTenue, updateTenue, getMyTenueById } from '../../services/tenueService';
import { formatPrice } from '../../utils/formatPrice';

const GererTenues = () => {
  const { tenues, loading, pagination, fetchTenues, handleDelete, handleToggle } = useTenues();
  const [view, setView] = useState('list'); // list | create | edit
  const [editTenue, setEditTenue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await createTenue(formData);
      toast.success('Tenue ajoutee');
      setView('list');
      fetchTenues(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const data = await getMyTenueById(id);
      setEditTenue(data.tenue);
      setView('edit');
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      await updateTenue(editTenue._id, formData);
      toast.success('Tenue mise a jour');
      setView('list');
      setEditTenue(null);
      fetchTenues(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteModal) {
      await handleDelete(deleteModal);
      setDeleteModal(null);
    }
  };

  if (view === 'create') {
    return (
      <VendeurLayout>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('list')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm">
            <HiArrowLeft size={16} /> Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter une tenue</h1>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <TenueForm onSubmit={handleCreate} loading={submitting} />
          </div>
        </div>
      </VendeurLayout>
    );
  }

  if (view === 'edit' && editTenue) {
    return (
      <VendeurLayout>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => { setView('list'); setEditTenue(null); }} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm">
            <HiArrowLeft size={16} /> Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier la tenue</h1>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <TenueForm tenue={editTenue} onSubmit={handleUpdate} loading={submitting} />
          </div>
        </div>
      </VendeurLayout>
    );
  }

  return (
    <VendeurLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes Tenues</h1>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <HiPlus size={18} /> Ajouter
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : tenues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de tenues</p>
            <button
              onClick={() => setView('create')}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              <HiPlus size={18} /> Ajouter ma premiere tenue
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tenue</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dispo</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenues.map((tenue) => (
                    <tr key={tenue._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {tenue.images?.[0]?.url ? (
                            <img src={tenue.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100" />
                          )}
                          <span className="font-medium text-gray-900 text-sm">{tenue.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden sm:table-cell">{tenue.type}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(tenue.prix)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(tenue._id, !tenue.disponible)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            tenue.disponible ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            tenue.disponible ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(tenue._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <HiPencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(tenue._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => fetchTenues(p)}
            />
          </>
        )}

        <Modal
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          title="Supprimer la tenue"
          onConfirm={confirmDelete}
          confirmText="Supprimer"
          confirmColor="bg-red-600 hover:bg-red-700"
        >
          <p className="text-gray-600">Etes-vous sur de vouloir supprimer cette tenue ? Cette action est irreversible.</p>
        </Modal>
      </div>
    </VendeurLayout>
  );
};

export default GererTenues;
