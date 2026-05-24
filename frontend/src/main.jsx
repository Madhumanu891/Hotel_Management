import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router }      from './router';
import { queryClient } from './lib/queryClient';
// import ErrorBoundary   from './components/ErrorBoundary';
import Toast           from './components/ui/Toast';
import ScrollToTop     from './components/ui/ScrollToTop';
import NetworkStatus from './components/ui/NetworkStatus';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <ErrorBoundary> */}
      <QueryClientProvider client={queryClient}>
        <NetworkStatus />
        <RouterProvider router={router} />
        <Toast />
        <ScrollToTop />
      </QueryClientProvider>
    {/* </ErrorBoundary> */}
  </React.StrictMode>
);