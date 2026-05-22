import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const useAllProperties = (params) =>
  useQuery({
    queryKey: ['admin', 'properties', params],
    queryFn:  () => api.get('/api/properties', { params }).then(r => r.data),
  });

export const useSystemHealth = () =>
  useQuery({
    queryKey:       ['admin', 'health'],
    queryFn:        async () => {
      const services = [
        { name: 'Auth Service',         url: '/api/auth',         port: 3001 },
        { name: 'Property Service',     url: '/api/properties',   port: 3002 },
        { name: 'Booking Service',      url: '/api/bookings/my',  port: 3003 },
        { name: 'Payment Service',      url: '/api/payments/my',  port: 3004 },
        { name: 'Housekeeping Service', url: '/api/housekeeping/my', port: 3005 },
        { name: 'Restaurant Service',   url: '/api/restaurant/test/menu', port: 3007 },
        { name: 'Staff Service',        url: '/api/staff/shifts/my', port: 3008 },
        { name: 'Analytics Service',    url: '/api/analytics/test/stats', port: 3009 },
      ];

      const results = await Promise.allSettled(
        services.map(async (svc) => {
          const start = Date.now();
          try {
            await api.get(svc.url, { timeout: 3000 });
            return { ...svc, status: 'up', latency: Date.now() - start };
          } catch (err) {
            const is404 = err.response?.status === 404 || err.response?.status === 401;
            return {
              ...svc,
              status:  is404 ? 'up' : 'down',
              latency: Date.now() - start,
              error:   is404 ? null : err.message,
            };
          }
        })
      );
      return results.map(r => r.value || r.reason);
    },
    refetchInterval: 30000,
  });

export const useGlobalStats = (propertyIds) =>
  useQuery({
    queryKey: ['admin', 'globalStats', propertyIds],
    queryFn:  async () => {
      if (!propertyIds?.length) return { totalRevenue: 0, totalBookings: 0 };
      const end   = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const statsArr = await Promise.allSettled(
        propertyIds.slice(0, 5).map(id =>
          api.get(`/api/analytics/${id}/stats`).then(r => r.data.data)
        )
      );
      return statsArr.reduce((acc, r) => {
        if (r.status === 'fulfilled' && r.value) {
          acc.totalRevenue   += r.value.monthlyRevenue  || 0;
          acc.totalBookings  += r.value.monthlyBookings || 0;
          acc.currentOccupancy += r.value.currentOccupancy || 0;
        }
        return acc;
      }, { totalRevenue: 0, totalBookings: 0, currentOccupancy: 0 });
    },
    enabled: !!propertyIds?.length,
  });

export const useDeactivateProperty = () =>
  useMutation({
    mutationFn: (id) => api.delete(`/api/properties/${id}`).then(r => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] }),
  });