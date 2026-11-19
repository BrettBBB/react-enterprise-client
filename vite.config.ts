import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { paths } from './src/shell/routes.ts'

function appBuild() {
  const published = process.env.RENDER_GIT_COMMIT?.trim()
  if (published) {
    return published.slice(0, 7)
  }
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
}

const buildId = appBuild()

// Render serves a folder's index.html at the slashless path. The client routes
// have no files of their own, so a direct visit 404s before the app loads.
function publishClientRoutes(): Plugin {
  return {
    name: 'publish-client-routes',
    apply: 'build',
    writeBundle(options) {
      if (!options.dir) {
        return
      }
      const index = readFileSync(path.join(options.dir, 'index.html'))
      for (const route of Object.values(paths)) {
        if (route === '/') {
          continue
        }
        const page = path.join(options.dir, route.slice(1), 'index.html')
        mkdirSync(path.dirname(page), { recursive: true })
        writeFileSync(page, index)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set. Add it to .env.')
  }

  return {
    define: {
      'import.meta.env.VITE_APP_BUILD': JSON.stringify(buildId),
    },
    plugins: [react(), publishClientRoutes()],
    server: {
      proxy: {
        '/auth': apiUrl,
        '/users': {
          target: apiUrl,
          bypass(req) {
            if (req.headers.accept?.includes('text/html')) {
              return '/index.html'
            }
          },
        },
        '/procedure-codes': apiUrl,
        '/procedure-rules': apiUrl,
        '/diagnosis-codes': apiUrl,
        '/diagnosis-rules': apiUrl,
        '/claims': apiUrl,
        '/claim-rules': apiUrl,
        '/email': apiUrl,
        '/assistant': apiUrl,
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
