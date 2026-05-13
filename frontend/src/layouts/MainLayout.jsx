import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Search, MessageCircle, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { notificationAPI } from '../api/services';
import toast from 'react-hot-toast';

export default function MainLayout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [submittingPwd, setSubmittingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getUnread();
      // Si on a plus de notifications qu'avant, on affiche un toast
      if (data.length > notifications.length) {
        const newNotifs = data.length - notifications.length;
        toast(`Vous avez ${newNotifs} nouvelle(s) notification(s) !`, {
          icon: '🔔',
          position: 'top-right'
        });
      }
      setNotifications(data);
    } catch (err) {
      console.error("Erreur notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      toast.error("Erreur lors du marquage comme lu");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications([]);
      setNotifOpen(false);
    } catch (err) {
      toast.error("Erreur lors du marquage de tout comme lu");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setSubmittingPwd(true);
    try {
      await userAPI.changePassword(newPassword);
      toast.success('Mot de passe mis à jour avec succès');
      setPwdModalOpen(false);
      setNewPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingPwd(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`./recherche?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (Projets, Tests, Anomalies)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-md text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-md hover:bg-gray-100 transition"
              >
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
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Tout lire
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500 italic">
                        Aucune nouvelle notification
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition flex gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-800 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.dateCreation).toLocaleString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="p-1 h-fit rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right cursor-pointer" onClick={() => setPwdModalOpen(true)}>
                <p className="text-sm font-medium text-gray-800 hover:text-primary-600 transition">{user?.username}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'ADMIN' ? 'Admin' : (user?.role === 'MANAGER' ? 'Manager' : 'Testeur')}
                </p>
              </div>
              <div className="w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm uppercase">
                {user?.username?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-auto">
          <Outlet />
        </main>

      </div>

      {/* Modal Changement Mot de Passe */}
      {pwdModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Changer mon mot de passe</h3>
              <button onClick={() => setPwdModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setPwdModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submittingPwd}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {submittingPwd ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
