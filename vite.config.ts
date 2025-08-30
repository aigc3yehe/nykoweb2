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
    port: 3000,
    proxy: {
      '/chat-api': {
        target: 'http://0.0.0.0:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat-api/, '')
      },
      '/mavae_api': {
        target: 'https://api.mavae.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mavae_api/, '')
      },
      '/beta-api': {
        target: 'http://43.153.57.123:8086',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/beta-api/, '')
      },
      '/studio-api': {
        target: 'https://api.nyko.cool',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/studio-api/, '')
      },
      '/infofi-api': {
        target: 'http://43.153.40.155:4004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/infofi-api/, '')
      }
    }
  },
  define: {
    global: {}
  }
})
