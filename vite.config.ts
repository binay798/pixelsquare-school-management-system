import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  resolve: {
    // Resolve the `paths` aliases from tsconfig.json natively (Vite 8+).
    // Replaces the `vite-tsconfig-paths` plugin.
    tsconfigPaths: true,
  },
  build: {
    // `rollupOptions` is deprecated in favor of `rolldownOptions` (Vite 8).
    rolldownOptions: {
      output: {
        // `output.manualChunks` only accepts a function in Rolldown, so the
        // object form is replaced by an explicit code splitting group.
        codeSplitting: {
          groups: [
            {
              // Keep MUI in its own cacheable vendor chunk.
              name: 'mui-material',
              test: /node_modules[\\/]@mui[\\/]material[\\/]/,
            },
          ],
        },
      },
    },
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
})
