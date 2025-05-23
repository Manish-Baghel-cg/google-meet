import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: true,
    allowedHosts: [
      '7c5a-2401-4900-1c33-d7de-48ca-29a7-b0a5-97a7.ngrok-free.app'
    ]
  }
})
