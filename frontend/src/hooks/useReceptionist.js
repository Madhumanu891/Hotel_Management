import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const useTodayArrivals = (propertyId) =>
  useQuery({
    queryKey: ['bookings', 'arrivals', propertyId],
    queryFn:  () => api.get(`/api/bookings/property/${propertyId}`, {
      params: {
        checkIn: new Date().toISOString().split('T')[0],
        status:  'confirmed',
        limit:   50,
      },
    }).then(r => r.data),
    enabled:        !!propertyId,
    refetchInterval: 30000,
  });

export const useTodayDepartures = (propertyId) =>
  useQuery({
    queryKey: ['bookings', 'departures', propertyId],
    queryFn:  () => api.get(`/api/bookings/property/${propertyId}`, {
      params: {
        checkOut: new Date().toISOString().split('T')[0],
        status:   'checked_in',
        limit:    50,
      },
    }).then(r => r.data),
    enabled:        !!propertyId,
    refetchInterval: 30000,
  });

export const useRooms = (propertyId) =>
  useQuery({
    queryKey: ['rooms', propertyId],
    queryFn:  () => api.get(`/api/properties/${propertyId}/rooms`).then(r => r.data.data),
    enabled:  !!propertyId,
    refetchInterval: 60000,
  });

export const useCheckIn = () =>
  useMutation({
    mutationFn: ({ bookingId, roomId }) =>
      api.patch(`/api/bookings/${bookingId}/check-in`, { roomId }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

export const useCheckOut = () =>
  useMutation({
    mutationFn: (bookingId) =>
      api.patch(`/api/bookings/${bookingId}/check-out`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

export const useUpdateRoomStatus = () =>
  useMutation({
    mutationFn: ({ propertyId, roomId, status, note }) =>
      api.put(`/api/properties/${propertyId}/rooms/${roomId}`, { status, note }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });