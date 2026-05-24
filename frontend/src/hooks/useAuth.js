import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import { queryClient } from '../lib/queryClient';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (credentials) =>
      api.post('/api/auth/login', credentials).then(r => r.data),

    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.user.name || 'User'}!`);
      const routes = {
        guest:            '/dashboard/guest',
        receptionist:     '/dashboard/receptionist',
        hotel_manager:    '/dashboard/manager',
        housekeeping:     '/dashboard/housekeeping',
        restaurant_staff: '/dashboard/restaurant',
        hr_manager:       '/dashboard/hr',
        accountant:       '/dashboard/accountant',
        super_admin:      '/dashboard/admin',
      };
      navigate(routes[data.data.user.role] || '/dashboard/guest');
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (data) =>
      api.post('/api/auth/register', data).then(r => r.data),

    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success('Account created successfully! Welcome to NexoraHotels.');
      navigate('/dashboard/guest');
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate   = useNavigate();

  return useMutation({
    mutationFn: () => api.post('/api/auth/logout').then(r => r.data),
    onSettled: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
  });
};

export const useMe = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey:  ['me'],
    queryFn:   () => api.get('/api/auth/me').then(r => r.data.data.user),
    enabled:   !!token,
    staleTime: 10 * 60 * 1000,
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (email) =>
      api.post('/api/auth/forgot-password', { email }).then(r => r.data),
    onSuccess: () => toast.success('Reset link sent! Check your inbox.'),
    onError:   () => toast.error('Something went wrong. Please try again.'),
  });

export const useResetPassword = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ token, password }) =>
      api.patch(`/api/auth/reset-password/${token}`, { password }).then(r => r.data),
    onSuccess: () => {
      toast.success('Password updated successfully!');
      navigate('/login');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    },
  });
};