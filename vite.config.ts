import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), cloudflare()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          '@mui/material': ['@mui/material'],
        },
      },
    },
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
})
