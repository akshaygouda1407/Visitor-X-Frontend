import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Catch all local frontend calls starting with /api and redirect them to our database server safely
      '/api': {
        target: 'http://visitorx.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path // Keeps the /api prefix fully intact for json-server
      }
    }
  }
})