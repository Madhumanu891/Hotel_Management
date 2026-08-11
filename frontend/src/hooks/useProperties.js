import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';

export const useSearchProperties = (params) =>
  useQuery({
    queryKey: ['properties', params],
    queryFn:  () => api.get('/properties', { params }).then(r => r.data),
    enabled:  !!params,
  });

export const useAvailableProperties = (params) =>
  useQuery({
    queryKey: ['properties', 'available', params],
    queryFn:  () =>
      api.get('/properties/search/available', { params }).then(r => r.data),
    enabled: !!(params?.checkIn && params?.checkOut && params?.city),
    staleTime: 2 * 60 * 1000,
  });

export const useProperty = (slug) =>
  useQuery({
    queryKey: ['property', slug],
    queryFn:  () => api.get(`/properties/${slug}`).then(r => r.data.data),
    enabled:  !!slug,
  });

export const useRoomTypes = (propertyId) =>
  useQuery({
    queryKey: ['roomTypes', propertyId],
    queryFn:  () =>
      api.get(`/properties/${propertyId}/room-types`).then(r => r.data.data),
    enabled: !!propertyId,
  });


  export const useAllProperties = (params) =>
  useQuery({
    queryKey: ['properties', 'all', params],
    queryFn:  () =>
      api.get('/properties', { params }).then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });