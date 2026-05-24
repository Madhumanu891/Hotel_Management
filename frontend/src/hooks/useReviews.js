import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export const usePropertyReviews = (propertyId) =>
  useQuery({
    queryKey: ['reviews', propertyId],
    queryFn:  () =>
      api.get(`/api/properties/${propertyId}/reviews`).then(r => r.data),
    enabled: !!propertyId,
  });

export const useSubmitReview = () =>
  useMutation({
    mutationFn: ({ propertyId, ...data }) =>
      api.post(`/api/properties/${propertyId}/reviews`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      toast.success('Review submitted successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Review failed'),
  });

export const useMyReviews = () =>
  useQuery({
    queryKey: ['reviews', 'my'],
    queryFn:  () => api.get('/api/properties/reviews/my').then(r => r.data),
  });