import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://45.32.110.109:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/studio-api': {
        target: 'https://api.misato.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/studio-api/, '')
      }
    }
  },
  define: {
    global: {}
  }
})
