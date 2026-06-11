import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatBot from '../components/ChatBot';
import { Bell, Search, Check, X, User, Mail, Shield, Lock, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI, userAPI } from '../api/services';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const roleLabels = {
  ADMIN:   { label: 'Administrateur', color: 'bg-blue-100 text-blue-700' },
  MANAGER: { label: 'Manager',        color: 'bg-violet-100 text-violet-700' },
  TESTEUR: { label: 'Testeur',        color: 'bg-emerald-100 text-emerald-700' },
};

export default function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [notifOpen, setNotifOpen]         = useState(false);
  const [accountOpen, setAccountOpen]     = useState(false);

  // Compte
  const [profile, setProfile]             = useState(null);
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [savingPwd, setSavingPwd]         = useState(false);

  const accountRef = useRef(null);

  // Fermer panneau compte si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Charger profil à l'ouverture
  useEffect(() => {
    if (accountOpen && !profile) {
      userAPI.getMe().then(({ data }) => setProfile(data)).catch(() => {});
    }
  }, [accountOpen]);

  // Notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getUnread();
      if (data.length > notifications.length) {
        toast(`Vous avez ${data.length - notifications.length} nouvelle(s) notification(s) !`, {
          icon: '🔔', position: 'top-right',
        });
      }
      setNotifications(data);
    } catch { /* silencieux */ }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { toast.error('Erreur lors du marquage comme lu'); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications([]);
      setNotifOpen(false);
    } catch { toast.error('Erreur'); }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`./recherche?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('6 caractères minimum'); return; }
    if (newPassword !== confirmPwd) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setSavingPwd(true);
    try {
      await userAPI.changePassword(newPassword);
      toast.success('Mot de passe mis à jour !');
      setNewPassword(''); setConfirmPwd('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSavingPwd(false); }
  };

  const role = roleLabels[profile?.role || user?.role] || roleLabels.TESTEUR;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Topbar ── */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">

          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (Projets, Tests, Anomalies)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-md text-sm
                           placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500
                           focus:ring-2 focus:ring-primary-100 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setAccountOpen(false); }}
                className="relative p-2 rounded-md hover:bg-gray-100 transition">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Tout lire
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500 italic">Aucune nouvelle notification</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition flex gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-gray-800 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(n.dateCreation).toLocaleString()}</p>
                        </div>
                        <button onClick={() => markAsRead(n.id)}
                          className="p-1 h-fit rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + panneau compte */}
            <div className="relative hidden md:block" ref={accountRef}>
              <button
                onClick={() => { setAccountOpen(!accountOpen); setNotifOpen(false); }}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'MANAGER' ? 'Manager' : 'Testeur'}
                  </p>
                </div>
                <div className="w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm uppercase">
                  {user?.username?.charAt(0) || 'U'}
                </div>
              </button>

              {/* ── Panneau compte ── */}
              {accountOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">Mon compte</span>
                    <button onClick={() => setAccountOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Profil */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                        {user?.username?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{profile?.username || user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email || '...'}</p>
                      </div>
                      <span className={`ml-auto flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>
                        {role.label}
                      </span>
                    </div>

                    {/* Infos */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-xs text-gray-600">
                        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-400">Identifiant :</span>
                        <span className="font-medium text-gray-700">{profile?.username || user?.username}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-400">Email :</span>
                        <span className="font-medium text-gray-700 truncate">{profile?.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600">
                        <Shield className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-400">Rôle :</span>
                        <span className="font-medium text-gray-700">{role.label}</span>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Changer mot de passe */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <KeyRound className="w-3.5 h-3.5 text-primary-500" />
                        <p className="text-xs font-semibold text-gray-700">Changer le mot de passe</p>
                      </div>
                      <form onSubmit={handleChangePassword} className="space-y-2.5">
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nouveau mot de passe"
                            className="w-full pl-8 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg
                                       focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition"
                          />
                          <button type="button" onClick={() => setShowNew(!showNew)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            placeholder="Confirmer le mot de passe"
                            className={`w-full pl-8 pr-8 py-2 text-xs bg-gray-50 border rounded-lg
                                        focus:outline-none focus:ring-1 transition
                                        ${confirmPwd && newPassword !== confirmPwd
                                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                          : 'border-gray-200 focus:border-primary-400 focus:ring-primary-100'}`}
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {confirmPwd && newPassword !== confirmPwd && (
                          <p className="text-[10px] text-red-500">Les mots de passe ne correspondent pas</p>
                        )}
                        <button
                          type="submit"
                          disabled={savingPwd || !newPassword || !confirmPwd}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary-600
                                     hover:bg-primary-700 text-white text-xs font-medium rounded-lg
                                     transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingPwd
                            ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mise à jour...</>
                            : <><Save className="w-3.5 h-3.5" /> Enregistrer</>
                          }
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-auto">
          <Outlet />
        </main>

      </div>

      {/* Assistant IA flottant */}
      <ChatBot />

    </div>
  );
}
