import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const usePaymentHistory = (params) =>
  useQuery({
    queryKey: ['payments', 'history', params],
    queryFn:  () =>
      api.get('/api/payments/my', { params }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useRevenueReport = (propertyId, params) =>
  useQuery({
    queryKey: ['analytics', 'revenue', propertyId, params],
    queryFn:  () =>
      api.get(`/api/analytics/${propertyId}/revenue`, { params }).then(r => r.data.data),
    enabled:  !!(propertyId && params?.startDate && params?.endDate),
  });

export const useOccupancyReport = (propertyId, params) =>
  useQuery({
    queryKey: ['analytics', 'occupancy', propertyId, params],
    queryFn:  () =>
      api.get(`/api/analytics/${propertyId}/occupancy`, { params }).then(r => r.data.data),
    enabled:  !!(propertyId && params?.startDate && params?.endDate),
  });

export const useBookingStats = (propertyId) =>
  useQuery({
    queryKey: ['analytics', 'stats', propertyId],
    queryFn:  () =>
      api.get(`/api/analytics/${propertyId}/stats`).then(r => r.data.data),
    enabled:  !!propertyId,
    refetchInterval: 60000,
  });