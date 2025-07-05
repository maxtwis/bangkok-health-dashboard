import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          maps: ['leaflet'],
          utils: ['papaparse', 'lodash']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['leaflet', 'papaparse', 'lodash', 'recharts']
  }
})