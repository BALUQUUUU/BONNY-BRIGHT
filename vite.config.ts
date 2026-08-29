import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites from /<repository-name>/ rather than
  // from the domain root. The deployment workflow supplies this value, while
  // local development keeps the normal root path.
  base: process.env.BASE_PATH || '/',
  server: {
    port: 5173,
    allowedHosts: true,
  },
})
