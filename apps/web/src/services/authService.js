import apiClient from './apiClient';

const authService = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        const userToStore = data.user || { ...data, id: data._id?.toString?.() || data._id };
        if (userToStore && typeof userToStore === 'object') {
          delete userToStore.token;
          localStorage.setItem('user', JSON.stringify(userToStore));
          localStorage.setItem('role', userToStore.role || data.role || '');
        }
      }
      return data;
    } catch (error) {
      console.error('Registration Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        const userToStore = data.user || { ...data, id: data._id?.toString?.() || data._id };
        if (userToStore && typeof userToStore === 'object') {
          delete userToStore.token;
          localStorage.setItem('user', JSON.stringify(userToStore));
          localStorage.setItem('role', userToStore.role || data.role || '');
        }
      }
      return data;
    } catch (error) {
      console.error('Login Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  switchRole: async (userId, newRole) => {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role: newRole });
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        const userToStore = data.user || { ...data, id: data._id?.toString?.() || data._id };
        delete userToStore.token;
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('role', (userToStore.role || data.role) || '');
      }
      return data;
    } catch (error) {
      console.error('switchRole Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  submitOnboarding: async (userId, onboardingData) => {
    try {
      const response = await apiClient.put(`/users/${userId}/onboarding`, onboardingData);
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        const userToStore = data.user || { ...data, id: data._id?.toString?.() || data._id };
        delete userToStore.token;
        localStorage.setItem('user', JSON.stringify(userToStore));
      }
      return data;
    } catch (error) {
      console.error('submitOnboarding Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('activeRole');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const normalizeUser = (u) => {
      if (!u) return null;
      const id = u.id || u._id?.toString?.() || u._id;
      return { ...u, id, _id: u._id || id };
    };

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return normalizeUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }

    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const user = normalizeUser(JSON.parse(jsonPayload));
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role) localStorage.setItem('role', user.role);
      }
      return user;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }
};

export default authService;
