import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isVendeurPage = location.pathname.startsWith('/vendeur');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="font-serif text-2xl font-bold text-primary-700">
            🌸 Dress by Ameksa
          </Link>

          {/* Desktop - center nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition">
              Accueil
            </Link>
            <Link to="/catalogue" className="text-gray-700 hover:text-primary-600 transition">
              Catalogue
            </Link>
            <Link to="/boutiques" className="text-gray-700 hover:text-primary-600 transition">
              Boutiques
            </Link>
          </div>

          {/* Desktop - right side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'vendeur' && !isVendeurPage && (
                  <Link to="/vendeur/dashboard" className="text-primary-600 hover:text-primary-700 font-medium transition">
                    Mon Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/boutiques" className="text-primary-600 hover:text-primary-700 font-medium transition">
                    Admin
                  </Link>
                )}
                {!isVendeurPage && (
                  <>
                    <Link to="#" className="text-gray-700 hover:text-primary-600 transition">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      Deconnexion
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition">
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            <Link to="/" className="block text-gray-700" onClick={() => setIsOpen(false)}>Accueil</Link>
            <Link to="/catalogue" className="block text-gray-700" onClick={() => setIsOpen(false)}>Catalogue</Link>
            <Link to="/boutiques" className="block text-gray-700" onClick={() => setIsOpen(false)}>Boutiques</Link>
            {user ? (
              <>
                {user.role === 'vendeur' && !isVendeurPage && (
                  <Link to="/vendeur/dashboard" className="block text-primary-600 font-medium" onClick={() => setIsOpen(false)}>Mon Dashboard</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/boutiques" className="block text-primary-600 font-medium" onClick={() => setIsOpen(false)}>Admin</Link>
                )}
                {!isVendeurPage && (
                  <>
                    <Link to="#" className="block text-gray-700" onClick={() => setIsOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="block text-gray-700">Deconnexion</button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700" onClick={() => setIsOpen(false)}>Connexion</Link>
                <Link to="/register" className="block text-primary-600 font-medium" onClick={() => setIsOpen(false)}>Inscription</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
