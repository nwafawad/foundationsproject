import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../utils/mockService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore logged-in user from localStorage
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const loggedInUser = authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback((data) => {
    const newUser = authService.register(data);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('recyx_current_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    if (!user) return;
    const updated = authService.updateProfile(user.user_id, updates);
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
