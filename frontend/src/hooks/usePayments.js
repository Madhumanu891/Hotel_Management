import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const useCreatePaymentOrder = () =>
  useMutation({
    mutationFn: (data) =>
      api.post('/api/payments/create-order', data).then(r => r.data.data),
    onError: () => toast.error('Could not create payment order. Please try again.'),
  });

export const useMockCapture = () =>
  useMutation({
    mutationFn: (data) =>
      api.post('/api/payments/mock-capture', data).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment successful! Your booking is confirmed.');
    },
    onError: () => toast.error('Payment failed. Please try again.'),
  });

export const useMyPayments = () =>
  useQuery({
    queryKey: ['payments', 'my'],
    queryFn:  () => api.get('/api/payments/my').then(r => r.data),
  });