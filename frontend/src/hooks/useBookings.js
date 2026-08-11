import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../lib/axios";
import { queryClient } from "../lib/queryClient";
import { useNotifications } from "./useNotifications";
import toast from "react-hot-toast";

export const useMyBookings = (params) =>
  useQuery({
    queryKey: ["bookings", "my", params],
    queryFn: () => api.get("/bookings/my", { params }).then((r) => r.data),
  });

export const useBooking = (id) =>
  useQuery({
    queryKey: ["booking", id],
    queryFn: () => api.get(`/bookings/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateBooking = () => {
  // Note: hooks can't be called inside another hook's callback
  // Instead add notification from the component that calls this mutation
  return useMutation({
    mutationFn: (data) => api.post('/bookings', data).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created! Complete payment to confirm.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking failed.');
    },
  });
};

export const useCancelBooking = () =>
  useMutation({
    mutationFn: ({ id, reason }) =>
      api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

export const useCheckAvailability = () =>
  useMutation({
    mutationFn: (data) =>
      api
        .post("/bookings/check-availability", data)
        .then((r) => r.data.data),
  });



  export const useConfirmBooking = () =>
  useMutation({
    mutationFn: ({ id, paymentId }) =>
      api.patch(`/bookings/${id}/confirm`, { paymentId }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
