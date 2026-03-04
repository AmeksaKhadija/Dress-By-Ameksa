import { useState, useEffect, useCallback } from 'react';
import { HiCurrencyDollar, HiShoppingBag, HiTrendingUp } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getCommissions } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

const Commissions = () => {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchCommissions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await getCommissions({ page, limit: 10 });
      setCommissions(result.commissions);
      setSummary(result.summary);
      setPagination(result.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des commissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  if (loading) return <AdminLayout><Loader /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Commissions</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <HiCurrencyDollar className="text-green-600" size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue total</p>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(summary.totalRevenue || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <HiTrendingUp className="text-indigo-600" size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commissions plateforme</p>
                <p className="text-lg font-semibold text-indigo-600">{formatPrice(summary.totalCommissions || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <HiShoppingBag className="text-amber-600" size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux de commission</p>
                <p className="text-lg font-semibold text-gray-900">{(summary.commissionRate || 0.15) * 100}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commissions table */}
        {commissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">Aucune commission pour le moment. Les commissions apparaitront apres les premiers paiements.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Boutique</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reservations</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total paiements</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Commission ({(summary.commissionRate || 0.15) * 100}%)</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Montant boutique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissions.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.boutiqueNom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">{c.nbReservations}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatPrice(c.totalPaiements)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600 text-right hidden sm:table-cell">{formatPrice(c.commission)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 text-right hidden sm:table-cell">{formatPrice(c.montantBoutique)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-center">
                      {commissions.reduce((sum, c) => sum + c.nbReservations, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{formatPrice(summary.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600 text-right hidden sm:table-cell">{formatPrice(summary.totalCommissions)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right hidden sm:table-cell">{formatPrice((summary.totalRevenue || 0) - (summary.totalCommissions || 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => fetchCommissions(p)}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Commissions;
