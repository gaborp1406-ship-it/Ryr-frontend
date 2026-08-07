import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    proxy: {
      '/ofertas-laborales-back': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },


  /* Motivo:

Tu Axios (automatizateApiNest.ts) usa baseURL: '' cuando no existe VITE_API_URL_NEST.
Entonces las llamadas a /ofertas-laborales-back/... salen “same-origin” hacia http://localhost:5173/... (Vite).
Sin proxy, Vite responde “Cannot POST …” porque esa ruta no existe en el dev server.
Cuándo NO sería necesario:

Si defines VITE_API_URL_NEST=http://localhost:3000 (en .env.local, por ejemplo) y tu backend tiene CORS bien configurado para permitir http://localhost:5173 + headers Authorization.
O si en producción tienes un reverse-proxy real (Nginx/Apache) que ya enruta /ofertas-laborales-back al Nest en el mismo dominio (ahí el proxy de Vite no aplica, pero tampoco molesta).
Recomendación práctica:

En dev, deja el proxy: evita CORS y asegura que los POST no peguen a Vite. */
})