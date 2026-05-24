import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      retryDelay:         1000,
      refetchOnWindowFocus: false,
      staleTime:          5 * 60 * 1000,   // 5 min
      gcTime:             10 * 60 * 1000,  // 10 min cache
      networkMode:        'offlineFirst',
    },
    mutations: {
      retry:       0,
      networkMode: 'always',
    },
  },
});