import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

const demoUsers = {
  admin: {
    username: 'admin',
    role: 'ADMIN',
    token: 'demo-token-admin',
    email: 'admin@example.com',
    userId: 1,
  },
  testeur: {
    username: 'testeur',
    role: 'TESTEUR',
    token: 'demo-token-testeur',
    email: 'testeur@example.com',
    userId: 2,
  },
};

const getDemoUser = (username) => {
  const key = username?.toLowerCase();
  return demoUsers[key] || {
    username: username || 'demo',
    role: 'TESTEUR',
    token: 'demo-token',
    email: `${username || 'demo'}@example.com`,
    userId: 999,
  };
};

const isNetworkError = (error) => {
  return (
    !error.response &&
    (error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to connect'))
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await authAPI.login({ username, password });
      // data: { token, username, email, role, userId }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTesteur = user?.role === 'TESTEUR';
  const isManager = user?.role === 'MANAGER';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isTesteur, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
