import { NavLink, useLocation } from 'react-router-dom';
import { HiHome, HiShoppingBag, HiCollection, HiClipboardList, HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';

const links = [
  { to: '/vendeur/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/vendeur/boutique', label: 'Ma Boutique', icon: HiShoppingBag },
  { to: '/vendeur/tenues', label: 'Mes Tenues', icon: HiCollection },
  { to: '/vendeur/reservations', label: 'Reservations', icon: HiClipboardList },
];

const VendeurLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <h2 className="text-lg font-semibold text-primary-700">Espace Vendeur</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
          {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block w-64 bg-white border-r min-h-[calc(100vh-4rem)] fixed lg:sticky top-0 lg:top-16 z-40`}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-primary-700 hidden lg:block mb-6">
              Espace Vendeur
            </h2>
            <nav className="space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    location.pathname === to
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
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
