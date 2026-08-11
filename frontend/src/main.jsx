import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './i18n';
import { router } from './router';
import { queryClient } from './lib/queryClient';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/ui/Toast';
import NetworkStatus from './components/ui/NetworkStatus';
import InstallPWA from './components/ui/InstallPWA';
import DarkModeWrapper from './components/ui/DarkModeWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DarkModeWrapper>
          <NetworkStatus />

          <RouterProvider router={router} />

          <Toast />
          <InstallPWA />
        </DarkModeWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);