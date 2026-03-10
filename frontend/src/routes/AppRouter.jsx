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

// Vendeur pages
import VendeurDashboard from '../pages/vendeur/VendeurDashboard';
import GererBoutique from '../pages/vendeur/GererBoutique';
import GererTenues from '../pages/vendeur/GererTenues';
import GererReservations from '../pages/vendeur/GererReservations';
import VendeurProfile from '../pages/vendeur/VendeurProfile';
import VendeurNotifications from '../pages/vendeur/VendeurNotifications';

// Client pages
import ClientDashboard from '../pages/client/ClientDashboard';
import Profile from '../pages/client/Profile';
import PaiementSuccess from '../pages/client/PaiementSuccess';
import MesReservations from '../pages/client/MesReservations';
import Notifications from '../pages/client/Notifications';
import TryOn from '../pages/client/TryOn';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import GererUtilisateurs from '../pages/admin/GererUtilisateurs';
import GererBoutiquesAdmin from '../pages/admin/GererBoutiques';
import GererReservationsAdmin from '../pages/admin/GererReservations';
import AdminCommissions from '../pages/admin/Commissions';
import AdminProfile from '../pages/admin/AdminProfile';

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
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/profile" element={<Profile />} />
          <Route path="/client/reservations" element={<MesReservations />} />
          <Route path="/client/notifications" element={<Notifications />} />
          <Route path="/client/paiement/success" element={<PaiementSuccess />} />
          <Route path="/client/tryon/:tenueId" element={<TryOn />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['vendeur']} />}>
          <Route path="/vendeur/dashboard" element={<VendeurDashboard />} />
          <Route path="/vendeur/boutique" element={<GererBoutique />} />
          <Route path="/vendeur/tenues" element={<GererTenues />} />
          <Route path="/vendeur/reservations" element={<GererReservations />} />
          <Route path="/vendeur/notifications" element={<VendeurNotifications />} />
          <Route path="/vendeur/profile" element={<VendeurProfile />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/utilisateurs" element={<GererUtilisateurs />} />
          <Route path="/admin/boutiques" element={<GererBoutiquesAdmin />} />
          <Route path="/admin/reservations" element={<GererReservationsAdmin />} />
          <Route path="/admin/commissions" element={<AdminCommissions />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
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
