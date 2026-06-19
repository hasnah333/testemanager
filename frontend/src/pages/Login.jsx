import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User, Key, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getRedirectPath = (role) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'MANAGER') return '/manager';
    return '/testeur';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const data = await login(username, password);
      toast.success(`Bienvenue ${data.username} !`);
      navigate(getRedirectPath(data.role), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants incorrects';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Card avec avatar overlap */}
        <div className="relative">
          {/* Avatar circulaire en haut */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center shadow-lg z-10 ring-4 ring-gray-100">
            <User className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          {/* Card */}
          <div className="bg-white rounded-md shadow-card pt-16 pb-8 px-8 animate-fade-in">
            <h1 className="text-center text-xl text-gray-600 font-normal mb-6">
              User Log in
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User ID */}
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="User ID"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition pr-10"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition pr-10"
                />
                <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-sm font-medium tracking-wide rounded shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    LOGIN
                  </>
                )}
              </button>

              {/* Forgot password */}
              <div className="text-center pt-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast('Contactez votre administrateur pour réinitialiser votre mot de passe', {
                      icon: 'ℹ️',
                      duration: 4000,
                    });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Forgot <span className="text-primary-500 font-medium">Password?</span>
                </a>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Plateforme de gestion des tests · v1.0
        </p>
      </div>
    </div>
  );
}
