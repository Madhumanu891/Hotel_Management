import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const usePropertyShifts = (propertyId, params) =>
  useQuery({
    queryKey: ['shifts', propertyId, params],
    queryFn:  () =>
      api.get(`/api/staff/shifts/${propertyId}`, { params }).then(r => r.data),
    enabled: !!propertyId,
  });

export const useMyShifts = () =>
  useQuery({
    queryKey: ['shifts', 'my'],
    queryFn:  () => api.get('/api/staff/shifts/my').then(r => r.data),
  });

export const useLeaveRequests = (propertyId, params) =>
  useQuery({
    queryKey: ['leave', propertyId, params],
    queryFn:  () =>
      api.get(`/api/staff/leave/${propertyId}`, { params }).then(r => r.data),
    enabled: !!propertyId,
  });

export const useMyLeaveRequests = () =>
  useQuery({
    queryKey: ['leave', 'my'],
    queryFn:  () => api.get('/api/staff/leave/my').then(r => r.data),
  });

export const useStaffStats = (propertyId) =>
  useQuery({
    queryKey: ['staff', 'stats', propertyId],
    queryFn:  () =>
      api.get(`/api/staff/stats/${propertyId}`).then(r => r.data.data),
    enabled: !!propertyId,
    refetchInterval: 60000,
  });

export const useCreateShift = () =>
  useMutation({
    mutationFn: (data) => api.post('/api/staff/shifts', data).then(r => r.data.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

export const useApplyLeave = () =>
  useMutation({
    mutationFn: (data) => api.post('/api/staff/leave', data).then(r => r.data.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  });

export const useReviewLeave = () =>
  useMutation({
    mutationFn: ({ leaveId, status, notes }) =>
      api.patch(`/api/staff/leave/${leaveId}/review`, { status, notes }).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  });