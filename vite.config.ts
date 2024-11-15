import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/workers/',
  server: {
    port: 3000,
    strictPort: true, // Force the specified port
    host: true // Listen on all addresses
  },
  preview: {
    port: 3000,
    strictPort: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor': ['@monaco-editor/react'],
          'firebase': ['firebase/app', 'firebase/firestore']
        }
      }
    }
  }
});