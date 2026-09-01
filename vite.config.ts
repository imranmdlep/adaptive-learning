import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { devApi } from './dev-api.ts'

export default defineConfig({
  /* devApi is serve-only: it makes api/*.ts reachable on localhost so the app
     can be reviewed end to end before anything is committed. On Vercel the
     platform routes those files itself and this plugin does nothing. */
  plugins: [react(), devApi()],
})
