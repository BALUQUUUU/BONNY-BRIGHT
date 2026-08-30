import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const normalizeBasePath = (value?: string) => {
  const cleaned = value?.trim().replace(/^\/+|\/+$/g, '')
  return cleaned ? `/${cleaned}/` : '/'
}

const repoName = (process.env.GITHUB_REPOSITORY?.split('/').pop() || process.env.BASE_PATH || 'BONNY-BRIGHT').trim()
const githubPagesBase = normalizeBasePath(repoName)

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites from /<repository-name>/ rather than
  // from the domain root. Use the repo name exactly so the site is served from
  // the actual GitHub Pages URL and deep links resolve correctly.
  base: process.env.BASE_PATH ? normalizeBasePath(process.env.BASE_PATH) : process.env.NODE_ENV === 'production' ? githubPagesBase : '/',
  server: {
    port: 5173,
    allowedHosts: true,
  },
})
