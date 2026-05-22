import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const useMyTasks = (params) =>
  useQuery({
    queryKey: ['housekeeping', 'my', params],
    queryFn:  () => api.get('/api/housekeeping/my', { params }).then(r => r.data),
    refetchInterval: 30000,
  });

export const usePropertyTasks = (propertyId, params) =>
  useQuery({
    queryKey: ['housekeeping', 'property', propertyId, params],
    queryFn:  () =>
      api.get(`/api/housekeeping/property/${propertyId}`, { params }).then(r => r.data),
    enabled:        !!propertyId,
    refetchInterval: 30000,
  });

export const useTaskStats = (propertyId) =>
  useQuery({
    queryKey: ['housekeeping', 'stats', propertyId],
    queryFn:  () =>
      api.get(`/api/housekeeping/stats/${propertyId}`).then(r => r.data.data),
    enabled:        !!propertyId,
    refetchInterval: 60000,
  });

export const useStartTask = () =>
  useMutation({
    mutationFn: (taskId) => api.patch(`/api/housekeeping/${taskId}/start`).then(r => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['housekeeping'] }),
  });

export const useCompleteTask = () =>
  useMutation({
    mutationFn: ({ taskId, ...data }) =>
      api.patch(`/api/housekeeping/${taskId}/complete`, data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping'] }),
  });

export const useUpdateChecklist = () =>
  useMutation({
    mutationFn: ({ taskId, item, done }) =>
      api.patch(`/api/housekeeping/${taskId}/checklist`, { item, done }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping'] }),
  });

export const useVerifyTask = () =>
  useMutation({
    mutationFn: (taskId) => api.patch(`/api/housekeeping/${taskId}/verify`).then(r => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['housekeeping'] }),
  });

export const useCreateTask = () =>
  useMutation({
    mutationFn: (data) => api.post('/api/housekeeping', data).then(r => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['housekeeping'] }),
  });