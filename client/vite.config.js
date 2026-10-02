import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5050',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Ignore non-fatal websocket proxy disconnect error (EPIPE)
          });
        }
      }
    }
  }
})
