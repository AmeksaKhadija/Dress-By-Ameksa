import { Routes, Route } from 'react-router-dom';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

const Home = () => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-serif">Accueil - Coming Soon</h1>
  </div>
);

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRoles={['client']} />}>
          {/* Client routes - Sprint 2+ */}
        </Route>
        <Route element={<RoleRoute allowedRoles={['vendeur']} />}>
          {/* Vendeur routes - Sprint 2+ */}
        </Route>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          {/* Admin routes - Sprint 2+ */}
        </Route>
      </Route>

      <Route path="*" element={
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900">404</h1>
          <p className="text-gray-600 mt-2">Page non trouvee</p>
        </div>
      } />
    </Routes>
  );
};

export default AppRouter;
