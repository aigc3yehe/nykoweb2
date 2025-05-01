import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      jsbi: path.resolve(__dirname, "./node_modules/jsbi/dist/jsbi-cjs.js"),
      "~@fontsource/ibm-plex-mono": "@fontsource/ibm-plex-mono",
      "~@fontsource/inter": "@fontsource/inter",
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 8001,
    proxy: {
      '/api': {
        target: 'http://45.32.110.109:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/studio-api': {
        target: 'https://api.nyko.cool',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/studio-api/, '')
      }
    }
  },
  define: {
    global: {}
  }
})
