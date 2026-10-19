import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// One page (index.html). The app shows the login page or the signed-in shell
// depending on what the server says (src/App.tsx).
//
// Development: `npm run dev` serves on http://localhost:3002 and forwards
// /api to the backend (default http://localhost:8000, override with API_URL),
// so the browser only ever talks to one origin, exactly as behind nginx.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Shared libraries in one clearly named chunk.
      output: { manualChunks: { vendor: ['react', 'react-dom', 'lucide-react'] } },
    },
  },
  server: {
    port: 3002,
    strictPort: true,
    proxy: { '/api': { target: process.env.API_URL ?? 'http://localhost:8000', changeOrigin: false } },
  },
  preview: { port: 3002, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    css: true,
  },
})
