import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from 'features/auth/services/authService'
import { setAccessToken, clearAccessToken } from 'features/auth/services/authToken'
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.refresh()
      .then((data) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        // If refresh fails, check if we have a valid saved user/token in localStorage
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');
        if (!token || !savedUser) {
          clearAccessToken();
          setUser(null);
          localStorage.removeItem('user');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const signup = async (username, email, password) => {
    const data = await authService.signup({ username, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try { await authService.logout(); }
    finally {
      clearAccessToken();
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be inside AuthProvider'); return ctx; };

