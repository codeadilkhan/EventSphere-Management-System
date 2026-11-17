import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('eventsphere_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user on startup if token exists
  useEffect(() => {
    const bootstrapUser = async () => {
      const storedToken = localStorage.getItem('eventsphere_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.warn('[EventSphere Auth] Session validation notice:', error.message);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    bootstrapUser();
  }, []);

  const handleLogin = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('eventsphere_token', jwtToken);
    localStorage.setItem('eventsphere_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventsphere_token');
    localStorage.removeItem('eventsphere_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('eventsphere_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be utilized within an AuthProvider');
  }
  return context;
};
