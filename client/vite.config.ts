import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5179,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      usePolling: true
    },
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      'embla-carousel-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'wouter',
      '@tanstack/react-query',
      'lucide-react',
      'framer-motion'
    ],
    exclude: [],
    force: true,
    esbuildOptions: {
      target: 'es2020',
      platform: 'browser',
      supported: {
        'top-level-await': true
      }
    }
  },
  build: {
    sourcemap: true,
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'radix': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area'
          ],
          'vendor': [
            'react',
            'react-dom',
            'wouter',
            '@tanstack/react-query',
            'embla-carousel-react',
            'framer-motion'
          ]
        }
      }
    }
  }
}) 