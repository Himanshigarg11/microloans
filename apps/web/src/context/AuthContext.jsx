import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRoleState] = useState(() => localStorage.getItem('activeRole'));
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const setActiveRole = async (role) => {
    toast.dismiss();
    
    // Set role synchronously FIRST so ProtectedRoute/RoleRoute allow navigation
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem('activeRole', role);
    } else {
      localStorage.removeItem('activeRole');
    }

    if (role && user) {
      try {
        setLoading(true);
        const updatedUser = await authService.switchRole(user?.id || user?._id, role);
        const userToSet = updatedUser?.user || updatedUser;
        if (userToSet) setUser(userToSet);
      } catch (err) {
        console.error('Failed to sync role switch with backend', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const login = async (credentials) => {
    toast.dismiss();
    const data = await authService.login(credentials);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser?.role && !localStorage.getItem('activeRole')) {
      setActiveRoleState(currentUser.role);
      localStorage.setItem('activeRole', currentUser.role);
    }
    return data;
  };

  const register = async (userData) => {
    toast.dismiss();
    const data = await authService.register(userData);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setActiveRoleState(null);
    localStorage.removeItem("activeRole");
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, activeRole, setActiveRole, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
