import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ mode }) => {
  const plugins = [react()]

  if (mode === 'development') {
    const { vibedit } = await import('@vibedit/vite')
    plugins.push(vibedit())
  }

  return { plugins }
})
