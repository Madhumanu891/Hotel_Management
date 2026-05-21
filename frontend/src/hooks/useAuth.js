import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
      // Route based on role
      const role = data.data.user.role;
      const routes = {
        guest:             '/dashboard/guest',
        receptionist:      '/dashboard/receptionist',
        hotel_manager:     '/dashboard/manager',
        housekeeping:      '/dashboard/housekeeping',
        restaurant_staff:  '/dashboard/restaurant',
        hr_manager:        '/dashboard/hr',
        accountant:        '/dashboard/accountant',
        super_admin:       '/dashboard/admin',
      };
      navigate(routes[role] || '/dashboard/guest');
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
      navigate('/dashboard/guest');
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
  });

export const useResetPassword = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ token, password }) =>
      api.patch(`/api/auth/reset-password/${token}`, { password }).then(r => r.data),
    onSuccess: () => navigate('/login'),
  });
};