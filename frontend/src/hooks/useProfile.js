import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import { queryClient } from '../lib/queryClient';

export const useUpdateProfile = () => {
  const { setAuth, token } = useAuthStore();
  return useMutation({
    mutationFn: (data) =>
      api.patch('/api/auth/me', data).then(r => r.data.data),
    onSuccess: (user) => {
      setAuth(user, token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data) =>
      api.patch('/api/auth/change-password', data).then(r => r.data),
    onSuccess: () => toast.success('Password changed successfully!'),
    onError:   (err) => toast.error(err.response?.data?.message || 'Password change failed'),
  });