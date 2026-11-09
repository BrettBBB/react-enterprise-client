import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

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
        '/procedure-codes': apiUrl,
        '/diagnosis-codes': apiUrl,
        '/rule-definitions': apiUrl,
        '/procedure-rules': apiUrl,
        '/diagnosis-rules': apiUrl,
        '/claims': apiUrl,
        '/email': apiUrl,
        '/api': apiUrl,
      },
    },
    build: {
      // The signed-in directory chunk is the MUI X Data Grid. It loads only after sign-in.
      chunkSizeWarningLimit: 600,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      env: {
        VITE_API_URL: apiUrl,
      },
    },
  }
})
