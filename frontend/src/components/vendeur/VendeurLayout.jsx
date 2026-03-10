import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiShoppingBag,
  HiCollection,
  HiClipboardList,
  HiUserCircle,
  HiMenu,
  HiX,
  HiLogout,
  HiArrowLeft,
  HiBell,
  HiClock,
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import api from '../../services/api';

const links = [
  { to: '/vendeur/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/vendeur/boutique', label: 'Ma Boutique', icon: HiShoppingBag },
  { to: '/vendeur/tenues', label: 'Mes Tenues', icon: HiCollection },
  { to: '/vendeur/reservations', label: 'Reservations', icon: HiClipboardList },
  { to: '/vendeur/notifications', label: 'Notifications', icon: HiBell, hasNotifBadge: true },
  { to: '/vendeur/profile', label: 'Mon Profil', icon: HiUserCircle },
];

const VendeurLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const isEnAttente = user?.statut === 'en_attente';

  // Auto-sync statut from API so vendeur doesn't need to re-login after approval
  useEffect(() => {
    if (!isEnAttente) return;
    const checkStatut = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.user && data.user.statut !== user.statut) {
          updateUser({ ...user, statut: data.user.statut });
        }
      } catch {
        // silently ignore
      }
    };
    const interval = setInterval(checkStatut, 30000); // check every 30s
    checkStatut(); // also check immediately
    return () => clearInterval(interval);
  }, [isEnAttente]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.nom
    ? user.nom.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-900 transition">
            {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
          <span className="font-semibold text-gray-900">Espace Vendeur</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 w-72 bg-white border-r min-h-[calc(100vh-4rem)] fixed lg:sticky top-0 lg:top-16 z-40 transition-transform duration-200 ease-in-out`}
        >
          <div className="p-5 flex flex-col h-full">
            {/* User card */}
            <div className="hidden lg:flex items-center gap-3 p-4 mb-6 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl">
              <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.nom}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              {links.map(({ to, label, icon: Icon, hasNotifBadge }) => {
                const isActive = location.pathname === to;
                const isDisabled = isEnAttente && to !== '/vendeur/profile' && to !== '/vendeur/dashboard';
                return (
                  <NavLink
                    key={to}
                    to={isDisabled ? '#' : to}
                    onClick={(e) => {
                      if (isDisabled) { e.preventDefault(); return; }
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : isActive
                          ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    {label}
                    {hasNotifBadge && unreadCount > 0 && (
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'
                      }`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="border-t pt-4 mt-4 space-y-1">
              <Link
                to="/catalogue"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <HiArrowLeft size={20} />
                Retour au catalogue
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition w-full"
              >
                <HiLogout size={20} />
                Deconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          {isEnAttente && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <HiClock className="mx-auto text-amber-500 mb-3" size={40} />
              <h2 className="text-lg font-semibold text-amber-800">Compte en attente d&apos;approbation</h2>
              <p className="text-sm text-amber-600 mt-1">
                Votre compte vendeur est en attente de validation par l&apos;administrateur.
                Vous serez notifie des que votre compte sera approuve.
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendeurLayout;
