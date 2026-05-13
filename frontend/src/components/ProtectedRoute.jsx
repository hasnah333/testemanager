import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loaders';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirige vers l'espace approprié à son rôle
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/testeur'} replace />;
  }

  return children;
}
