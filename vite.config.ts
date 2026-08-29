import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites from /<repository-name>/ rather than
  // from the domain root. For production GitHub Pages, use the repo name.
  // For local dev, use root. The BASE_PATH env var from GitHub Actions will
  // override this if set.
  base: process.env.BASE_PATH || (process.env.NODE_ENV === 'production' ? '/BONNY-BRIGHT/' : '/'),
  server: {
    port: 5173,
    allowedHosts: true,
  },
})
