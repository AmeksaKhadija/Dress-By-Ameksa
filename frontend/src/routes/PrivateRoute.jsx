import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
