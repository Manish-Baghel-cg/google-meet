import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const response = await axios.get('https://my-meet-124v.onrender.com/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ 
        user: response.data,
        token,
        isAuthenticated: true,
        loading: false 
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false 
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('https://my-meet-124v.onrender.com/auth/login', {
        email,
        password,
      });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post('https://my-meet-124v.onrender.com/auth/register', {
        email,
        password,
        name,
      });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },
}));

// Initialize auth state when the app starts
useAuth.getState().initialize();

export { useAuth }; 