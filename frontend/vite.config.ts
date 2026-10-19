import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Two static pages, no router (milestone 1 is UI only):
//   /            -> index.html  (home shell: sidebar + top bar + home page)
//   /login.html  -> login.html  (sign-in page)
// Real routing arrives with the navigation feature; until then each page is
// its own entry so nothing pretends to navigate.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        login: resolve(import.meta.dirname, 'login.html'),
      },
      // Shared libraries in one clearly named chunk (otherwise Rollup names
      // the shared chunk after whichever module it saw first).
      output: { manualChunks: { vendor: ['react', 'react-dom', 'lucide-react'] } },
    },
  },
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    css: true,
  },
})
