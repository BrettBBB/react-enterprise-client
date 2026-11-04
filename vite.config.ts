import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set. Add it to .env.')
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': apiUrl,
        '/users': apiUrl,
        '/api': apiUrl,
      },
    },
  }
})
