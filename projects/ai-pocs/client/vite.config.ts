import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

const backendTarget = process.env.BACKEND_URL || 'http://localhost:8000'
const basePath = process.env.VITE_BASE_PATH || '/'

// Shared by the dev server and `vite preview` (used in the production image).
const proxy: Record<string, ProxyOptions> = {
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
}

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy,
  },
})
