import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

export const useManagerStats = (propertyId) =>
  useQuery({
    queryKey: ['manager', 'stats', propertyId],
    queryFn:  () =>
      api.get(`/api/analytics/${propertyId}/stats`).then(r => r.data.data),
    enabled:  !!propertyId,
    refetchInterval: 60000,
  });

export const useRevenueChart = (propertyId, params) =>
  useQuery({
    queryKey: ['manager', 'revenue', propertyId, params],
    queryFn:  () =>
      api.get(`/api/analytics/${propertyId}/revenue`, { params }).then(r => r.data.data),
    enabled:  !!(propertyId && params?.startDate && params?.endDate),
  });

export const useOccupancyChart = (propertyId, params) =>
  useQuery({
    queryKey: ['manager', 'occupancy', propertyId, params],
    queryFn:  () =>
      api.get(`/api/analytics/${propertyId}/occupancy`, { params }).then(r => r.data.data),
    enabled:  !!(propertyId && params?.startDate && params?.endDate),
  });

export const usePropertyBookings = (propertyId, params) =>
  useQuery({
    queryKey: ['manager', 'bookings', propertyId, params],
    queryFn:  () =>
      api.get(`/api/bookings/property/${propertyId}`, { params }).then(r => r.data),
    enabled:  !!propertyId,
    refetchInterval: 30000,
  });

export const usePropertyDetails = (propertyId) =>
  useQuery({
    queryKey: ['manager', 'property', propertyId],
    queryFn:  () =>
      api.get(`/api/properties/${propertyId}`).then(r => r.data.data),
    enabled:  !!propertyId,
  });

export const useStaffOverview = (propertyId) =>
  useQuery({
    queryKey: ['manager', 'staff', propertyId],
    queryFn:  () =>
      api.get(`/api/staff/stats/${propertyId}`).then(r => r.data.data),
    enabled:  !!propertyId,
    refetchInterval: 60000,
  });