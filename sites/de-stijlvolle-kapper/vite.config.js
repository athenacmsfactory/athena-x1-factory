import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/de-stijlvolle-kapper/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: parseInt(process.env.PORT) || 5008,
    allowedHosts: true,
    cors: true
  }
})