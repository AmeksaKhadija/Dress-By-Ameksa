import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiBell, HiChevronDown, HiLogout, HiUserCircle } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/boutiques', label: 'Boutiques' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const menuRef = useRef(null);

  const isVendeurPage = location.pathname.startsWith('/vendeur');
  const isClientPage = location.pathname.startsWith('/client');
  const isDashboardPage = isVendeurPage || isClientPage;

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setUserMenu(false);
  };

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const initials = user?.nom
    ? user.nom.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl font-bold text-primary-700 flex-shrink-0">
            Dress by Ameksa
          </Link>

          {/* Desktop - center nav */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActiveLink(to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop - right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Dashboard link */}
                {user.role === 'vendeur' && !isVendeurPage && (
                  <Link to="/vendeur/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition">
                    Mon Dashboard
                  </Link>
                )}
                {user.role === 'client' && !isClientPage && (
                  <Link to="/client/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition">
                    Mon Espace
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/boutiques" className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition">
                    Admin
                  </Link>
                )}

                {/* Notification bell for client */}
                {user.role === 'client' && !isClientPage && (
                  <Link to="/client/notifications" className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition">
                    <HiBell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User menu */}
                {!isDashboardPage && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setUserMenu(!userMenu)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 border border-gray-200 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                        {initials}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden lg:block">
                        {user?.nom?.split(' ')[0]}
                      </span>
                      <HiChevronDown size={16} className={`text-gray-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.nom}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to={user.role === 'vendeur' ? '/vendeur/profile' : '/client/profile'}
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <HiUserCircle size={18} className="text-gray-400" />
                          Mon Profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full"
                        >
                          <HiLogout size={18} />
                          Deconnexion
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActiveLink(to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t my-2 pt-2">
              {user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.nom}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {user.role === 'vendeur' && !isVendeurPage && (
                    <Link to="/vendeur/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition" onClick={() => setIsOpen(false)}>
                      Mon Dashboard
                    </Link>
                  )}
                  {user.role === 'client' && !isClientPage && (
                    <Link to="/client/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition" onClick={() => setIsOpen(false)}>
                      Mon Espace
                    </Link>
                  )}
                  {user.role === 'client' && !isClientPage && (
                    <Link to="/client/notifications" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition" onClick={() => setIsOpen(false)}>
                      Notifications
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/boutiques" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition" onClick={() => setIsOpen(false)}>
                      Admin
                    </Link>
                  )}
                  {!isDashboardPage && (
                    <>
                      <Link to={user.role === 'vendeur' ? '/vendeur/profile' : '/client/profile'} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition" onClick={() => setIsOpen(false)}>
                        Mon Profil
                      </Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
                        Deconnexion
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-1 pt-1">
                  <Link to="/login" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition" onClick={() => setIsOpen(false)}>
                    Connexion
                  </Link>
                  <Link to="/register" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition" onClick={() => setIsOpen(false)}>
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
