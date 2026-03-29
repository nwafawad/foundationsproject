import React, { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recyx_current_user');
      if (stored) {
        setUserState(JSON.parse(stored));
      }
    } catch (e) {
      localStorage.removeItem('recyx_current_user');
    }
    setLoading(false);
  }, []);

  const setUser = (u) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('recyx_current_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('recyx_current_user');
    }
  };

  const logout = () => {
    // Call API logout if it exists
    try {
      apiLogout();
    } catch (e) {
      // Ignore errors
    }
    setUserState(null);
    localStorage.removeItem('recyx_current_user');
    localStorage.removeItem('recyx_access_token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
