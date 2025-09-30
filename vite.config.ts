import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite que a API da Vercel funcione durante o desenvolvimento local
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
