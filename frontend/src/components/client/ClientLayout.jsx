import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HiHome, HiClipboardList, HiUserCircle, HiBell, HiMenu, HiX, HiLogout } from 'react-icons/hi';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const links = [
  { to: '/client/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/client/reservations', label: 'Mes Reservations', icon: HiClipboardList },
  { to: '/client/notifications', label: 'Notifications', icon: HiBell },
  { to: '/client/profile', label: 'Mon Profil', icon: HiUserCircle },
];

const ClientLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <h2 className="text-lg font-semibold text-primary-700">Espace Client</h2>
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
          <div className="p-6 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-primary-700 hidden lg:block mb-6">
              Espace Client
            </h2>
            <nav className="space-y-1 flex-1">
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
                  {to === '/client/notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* User info + logout at bottom */}
            <div className="border-t pt-4 mt-4">
              <NavLink
                to="/client/profile"
                className="block text-sm font-medium text-gray-900 px-4 mb-1 hover:text-primary-600 transition"
              >
                {user?.nom}
              </NavLink>
              <p className="text-xs text-gray-500 px-4 mb-3">{user?.email}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition w-full"
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

export default ClientLayout;
