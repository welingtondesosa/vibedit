import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vibedit } from '@vibedit/vite'

export default defineConfig({
  plugins: [
    react(),
    ...vibedit(),
  ],
})
