import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backendTarget = process.env.BACKEND_URL || 'http://localhost:8000'
const basePath = process.env.VITE_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/health': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/ai-pocs/api': {
        target: backendTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-pocs/, ''),
      },
      '/ai-pocs/health': {
        target: backendTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-pocs/, ''),
      },
    },
  },
})
