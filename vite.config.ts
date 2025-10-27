import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Écouter sur toutes les interfaces réseau
    proxy: {
      // Proxy pour l'API Riot régionale (europe, americas, etc.)
      '/api/riot/regional': {
        target: 'https://europe.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot\/regional/, ''),
        followRedirects: true,
      },
      // Proxy pour l'API Riot platform (euw1, na1, etc.)
      '/api/riot/platform': {
        target: 'https://euw1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot\/platform/, ''),
        followRedirects: true,
      },
    },
  },
})
