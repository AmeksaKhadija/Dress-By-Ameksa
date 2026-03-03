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
} from 'react-icons/hi';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/vendeur/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/vendeur/boutique', label: 'Ma Boutique', icon: HiShoppingBag },
  { to: '/vendeur/tenues', label: 'Mes Tenues', icon: HiCollection },
  { to: '/vendeur/reservations', label: 'Reservations', icon: HiClipboardList },
  { to: '/vendeur/profile', label: 'Mon Profil', icon: HiUserCircle },
];

const VendeurLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
              {links.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    {label}
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
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default VendeurLayout;
