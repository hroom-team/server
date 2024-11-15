import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/workers/',
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