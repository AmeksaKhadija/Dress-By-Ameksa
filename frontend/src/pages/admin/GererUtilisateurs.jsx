import { useState } from 'react';
import { HiSearch, HiTrash, HiCheck } from 'react-icons/hi';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useAdminUsers from '../../hooks/useAdminUsers';

const ROLE_TABS = [
  { value: '', label: 'Tous' },
  { value: 'client', label: 'Clients' },
  { value: 'vendeur', label: 'Vendeurs' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_BADGES = {
  client: 'bg-blue-100 text-blue-700',
  vendeur: 'bg-green-100 text-green-700',
  admin: 'bg-indigo-100 text-indigo-700',
};

const GererUtilisateurs = () => {
  const { users, loading, pagination, roleFilter, setRoleFilter, search, setSearch, fetchUsers, handleRoleChange, handleApprove, handleDelete } = useAdminUsers();
  const [deleteModal, setDeleteModal] = useState(null);
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('');

  const confirmDelete = async () => {
    if (deleteModal) {
      await handleDelete(deleteModal);
      setDeleteModal(null);
    }
  };

  const confirmRoleChange = async () => {
    if (roleModal && newRole) {
      await handleRoleChange(roleModal, newRole);
      setRoleModal(null);
      setNewRole('');
    }
  };

  const openRoleModal = (userId, currentRole) => {
    setRoleModal(userId);
    setNewRole(currentRole);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des utilisateurs</h1>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  roleFilter === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">Aucun utilisateur trouve</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Telephone</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{u.nom}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{u.telephone || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openRoleModal(u._id, u.role)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${ROLE_BADGES[u.role]}`}
                        >
                          {u.role}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {u.role === 'vendeur' ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {u.statut === 'actif' ? 'Actif' : 'En attente'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.role === 'vendeur' && u.statut === 'en_attente' && (
                            <button
                              onClick={() => handleApprove(u._id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approuver le vendeur"
                            >
                              <HiCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal(u._id)}
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
              onPageChange={(p) => fetchUsers(p, roleFilter, search)}
            />
          </>
        )}

        {/* Delete confirmation modal */}
        <Modal
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          title="Supprimer l'utilisateur"
          onConfirm={confirmDelete}
          confirmText="Supprimer"
          confirmColor="bg-red-600 hover:bg-red-700"
        >
          <p className="text-gray-600">Etes-vous sur de vouloir supprimer cet utilisateur ? Cette action est irreversible.</p>
        </Modal>

        {/* Role change modal */}
        <Modal
          isOpen={!!roleModal}
          onClose={() => { setRoleModal(null); setNewRole(''); }}
          title="Changer le role"
          onConfirm={confirmRoleChange}
          confirmText="Confirmer"
          confirmColor="bg-indigo-600 hover:bg-indigo-700"
        >
          <div>
            <p className="text-gray-600 mb-4">Selectionnez le nouveau role :</p>
            <div className="flex gap-3">
              {['client', 'vendeur', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setNewRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    newRole === role
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default GererUtilisateurs;
