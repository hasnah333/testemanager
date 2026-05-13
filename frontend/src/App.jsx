import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages publiques
import Login from './pages/Login';

// Pages Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Projets from './pages/admin/Projets';
import Archives from './pages/admin/Archives';
import Anomalies from './pages/admin/Anomalies';
import Rapports from './pages/admin/Rapports';

// Pages Testeur
import TesteurDashboard from './pages/testeur/TesteurDashboard';
import MesProjets from './pages/testeur/MesProjets';
import Sessions from './pages/testeur/Sessions';
import Executions from './pages/testeur/Executions';
import AnomaliesTesteur from './pages/testeur/AnomaliesTesteur';
import Modules from './pages/testeur/Modules';
import Scenarios from './pages/testeur/Scenarios';
import CasDeTests from './pages/testeur/CasDeTests';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import SearchResults from './pages/SearchResults';

// Composant racine : redirige selon le rôle
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager" replace />;
  return <Navigate to="/testeur" replace />;
}

// Page 404
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary-500 mb-2">404</h1>
        <p className="text-xl text-gray-700 mb-2">Page introuvable</p>
        <p className="text-sm text-gray-500 mb-6">La page que vous cherchez n'existe pas.</p>
        <a href="/" className="btn-primary inline-flex">Retour à l'accueil</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Page de connexion */}
      <Route path="/login" element={<Login />} />

      {/* Redirection racine */}
      <Route path="/" element={<RootRedirect />} />

      {/* === Espace ADMIN === */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<Users />} />
        <Route path="projets" element={<Projets />} />
        <Route path="archives" element={<Archives />} />
        <Route path="anomalies" element={<Anomalies />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="recherche" element={<SearchResults />} />
      </Route>

      {/* === Espace TESTEUR === */}
      <Route
        path="/testeur"
        element={
          <ProtectedRoute role="TESTEUR">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TesteurDashboard />} />
        <Route path="projets" element={<MesProjets />} />
        <Route path="modules" element={<Modules />} />
        <Route path="scenarios" element={<Scenarios />} />
        <Route path="cas-de-tests" element={<CasDeTests />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="executions" element={<Executions />} />
        <Route path="anomalies" element={<AnomaliesTesteur />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="recherche" element={<SearchResults />} />
      </Route>

      {/* === Espace MANAGER === */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute role="MANAGER">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="projets" element={<MesProjets />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="anomalies" element={<AnomaliesTesteur />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="recherche" element={<SearchResults />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
