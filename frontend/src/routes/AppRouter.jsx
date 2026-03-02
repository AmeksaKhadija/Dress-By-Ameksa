import { Routes, Route } from 'react-router-dom';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import Home from '../pages/public/Home';
import Catalogue from '../pages/public/Catalogue';
import TenuDetail from '../pages/public/TenuDetail';
import Boutiques from '../pages/public/Boutiques';
import BoutiqueDetail from '../pages/public/BoutiqueDetail';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/tenue/:id" element={<TenuDetail />} />
      <Route path="/boutiques" element={<Boutiques />} />
      <Route path="/boutique/:id" element={<BoutiqueDetail />} />
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
