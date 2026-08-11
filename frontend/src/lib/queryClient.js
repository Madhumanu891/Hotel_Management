import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              (count, error) => {
        // Don't retry on auth errors
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        if (error?.response?.status === 404) return false;
        return count < 2;
      },
      retryDelay:           1500,
      refetchOnWindowFocus: false,
      staleTime:            5  * 60 * 1000,
      gcTime:               10 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});