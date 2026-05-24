import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color:      '#374151',
          boxShadow:  '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          borderRadius: '12px',
          padding:    '12px 16px',
          fontSize:   '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: { primary: '#059669', secondary: '#fff' },
          style:     { borderLeft: '4px solid #059669' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#fff' },
          style:     { borderLeft: '4px solid #dc2626' },
        },
        loading: {
          iconTheme: { primary: '#6d28d9', secondary: '#fff' },
          style:     { borderLeft: '4px solid #6d28d9' },
        },
      }}
    />
  );
}