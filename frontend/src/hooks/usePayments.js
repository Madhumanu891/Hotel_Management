import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const useCreatePaymentOrder = () =>
  useMutation({
    mutationFn: (data) =>
      api.post('/api/payments/create-order', data).then(r => r.data.data),
  });

export const useMockCapture = () =>
  useMutation({
    mutationFn: (data) =>
      api.post('/api/payments/mock-capture', data).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

export const useMyPayments = () =>
  useQuery({
    queryKey: ['payments', 'my'],
    queryFn:  () => api.get('/api/payments/my').then(r => r.data),
  });