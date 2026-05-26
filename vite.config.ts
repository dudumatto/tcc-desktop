import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL?.replace(/\/api\/?$/, '') ?? 'http://localhost:8080'

  return {
    plugins: [
      react(),
      electron({
        main: { entry: 'electron/main.ts' },
        preload: { input: 'electron/preload.ts' },
      }),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': backendUrl,
      },
    },
  }
})
