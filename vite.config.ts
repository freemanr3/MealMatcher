import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client/src',
  publicDir: '../../public',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@features': path.resolve(__dirname, './client/src/features'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@services': path.resolve(__dirname, './client/src/services'),
      '@utils': path.resolve(__dirname, './client/src/utils'),
      '@styles': path.resolve(__dirname, './client/src/styles'),
      '@assets': path.resolve(__dirname, './client/src/assets'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}); 