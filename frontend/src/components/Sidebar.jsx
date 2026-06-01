import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, Bug, FileText,
  LogOut, ClipboardList, PlayCircle, Layers, Archive,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/projets', label: 'Projets', icon: FolderKanban },
  { to: '/admin/archives', label: 'Archives', icon: Archive },
  { to: '/admin/anomalies', label: 'Anomalies', icon: Bug },
  { to: '/admin/rapports', label: 'Rapports', icon: FileText },
];

const testeurNav = [
  { to: '/testeur', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/testeur/projets', label: 'Mes projets', icon: FolderKanban },
  { to: '/testeur/modules', label: 'Modules', icon: Layers },
  { to: '/testeur/scenarios', label: 'Scénarios', icon: FileText },
  { to: '/testeur/cas-de-tests', label: 'Cas de test', icon: ClipboardList },
  { to: '/testeur/sessions', label: 'Sessions de test', icon: ClipboardList },
  { to: '/testeur/executions', label: 'Exécutions', icon: PlayCircle },
  { to: '/testeur/anomalies', label: 'Anomalies', icon: Bug },
  { to: '/testeur/rapports', label: 'Rapports', icon: FileText },
];

const managerNav = [
  { to: '/manager', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/manager/projets', label: 'Suivi Projets', icon: FolderKanban },
  { to: '/manager/sessions', label: 'Suivi Sessions', icon: ClipboardList },
  { to: '/manager/anomalies', label: 'Suivi Anomalies', icon: Bug },
  { to: '/manager/rapports', label: 'Rapports PDF', icon: FileText },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getNavItems = () => {
    if (user?.role === 'ADMIN') return adminNav;
    if (user?.role === 'MANAGER') return managerNav;
    return testeurNav;
  };

  const navItems = getNavItems();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : (user?.role === 'MANAGER' ? 'Manager' : 'Testeur');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="TM Logo" className="w-10 h-10" />
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">Test Manager</h2>
            <p className="text-xs text-gray-400">Plateforme de tests</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm uppercase">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
