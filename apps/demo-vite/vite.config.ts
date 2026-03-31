import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ command }) => {
  const extraPlugins: any[] = []

  if (command === 'serve') {
    try {
      const { vibedit } = await import('@vibedit/vite')
      extraPlugins.push(...vibedit())
    } catch {
      // vibedit not available in this environment, skip
    }
  }

  return {
    plugins: [react(), ...extraPlugins],
  }
})
