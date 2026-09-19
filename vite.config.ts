import { defineConfig } from 'vite'

export default defineConfig({
  // Chemins relatifs : l'app Electron charge dist/index.html via file://
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
