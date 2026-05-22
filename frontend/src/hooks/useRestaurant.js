import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const useMenu = (propertyId, params) =>
  useQuery({
    queryKey: ['menu', propertyId, params],
    queryFn:  () =>
      api.get(`/api/restaurant/${propertyId}/menu`, { params }).then(r => r.data),
    enabled: !!propertyId,
  });

export const useLiveOrders = (propertyId) =>
  useQuery({
    queryKey:       ['orders', 'live', propertyId],
    queryFn:        () =>
      api.get(`/api/restaurant/${propertyId}/orders/kitchen`).then(r => r.data.data),
    enabled:        !!propertyId,
    refetchInterval: 15000,
  });

export const useOrders = (propertyId, params) =>
  useQuery({
    queryKey: ['orders', propertyId, params],
    queryFn:  () =>
      api.get(`/api/restaurant/${propertyId}/orders`, { params }).then(r => r.data),
    enabled: !!propertyId,
    refetchInterval: 20000,
  });

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ propertyId, orderId, status }) =>
      api.patch(`/api/restaurant/${propertyId}/orders/${orderId}/status`, { status })
         .then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

export const usePlaceOrder = () =>
  useMutation({
    mutationFn: ({ propertyId, ...data }) =>
      api.post(`/api/restaurant/${propertyId}/orders`, data).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

export const useCreateMenuItem = () =>
  useMutation({
    mutationFn: ({ propertyId, ...data }) =>
      api.post(`/api/restaurant/${propertyId}/menu`, data).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  });

export const useUpdateMenuItem = () =>
  useMutation({
    mutationFn: ({ propertyId, itemId, ...data }) =>
      api.put(`/api/restaurant/${propertyId}/menu/${itemId}`, data).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  });

export const useToggleItemAvailability = () =>
  useMutation({
    mutationFn: ({ propertyId, itemId }) =>
      api.patch(`/api/restaurant/${propertyId}/menu/${itemId}/toggle`).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  });