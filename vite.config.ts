import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'sit'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
