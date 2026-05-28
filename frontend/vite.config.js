import { defineConfig } from 'vite';
import react   from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
   content:  ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6d28d9',
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#4c1d95',
        },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA,
    VitePWA({
      registerType:   'autoUpdate',
      includeAssets:  ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name:             'NexoraHotels',
        short_name:       'NexoraHotels',
        description:      'Premium Hotel Management System',
        theme_color:      '#6d28d9',
        background_color: '#f8fafc',
        display:          'standalone',
        orientation:      'portrait',
        scope:            '/',
        start_url:        '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns:   ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern:  /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:     'CacheFirst',
            options: {
              cacheName:    'google-fonts-cache',
              expiration:   { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^http:\/\/localhost:3000\/api\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName:    'api-cache',
              expiration:   { maxEntries: 100, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:       'http://localhost:3000',
        changeOrigin: true,
        secure:       false,
      },
    },
  },
  build: {
    outDir:   'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          query:   ['@tanstack/react-query'],
          charts:  ['recharts'],
          ui:      ['lucide-react'],
          forms:   ['react-hook-form'],
          state:   ['zustand'],
        },
      },
    },
  },
});