import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites use a repository subpath.
// The workflow sets VITE_BASE_PATH to /REPOSITORY-NAME/.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || './'
})
