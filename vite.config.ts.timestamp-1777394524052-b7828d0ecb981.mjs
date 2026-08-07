// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/Automatizate/front_automatizate/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Automatizate/front_automatizate/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueDevTools from "file:///D:/Automatizate/front_automatizate/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/Automatizate/front_automatizate/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    VueDevTools()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    proxy: {
      "/ofertas-laborales-back": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
  /* Motivo:
  
  Tu Axios (automatizateApiNest.ts) usa baseURL: '' cuando no existe VITE_API_URL_NEST.
  Entonces las llamadas a /ofertas-laborales-back/... salen “same-origin” hacia http://localhost:5173/... (Vite).
  Sin proxy, Vite responde “Cannot POST …” porque esa ruta no existe en el dev server.
  Cuándo NO sería necesario:
  
  Si defines VITE_API_URL_NEST=http://localhost:3000 (en .env.local, por ejemplo) y tu backend tiene CORS bien configurado para permitir http://localhost:5173 + headers Authorization.
  O si en producción tienes un reverse-proxy real (Nginx/Apache) que ya enruta /ofertas-laborales-back al Nest en el mismo dominio (ahí el proxy de Vite no aplica, pero tampoco molesta).
  Recomendación práctica:
  
  En dev, deja el proxy: evita CORS y asegura que los POST no peguen a Vite. */
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBdXRvbWF0aXphdGVcXFxcZnJvbnRfYXV0b21hdGl6YXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxBdXRvbWF0aXphdGVcXFxcZnJvbnRfYXV0b21hdGl6YXRlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9BdXRvbWF0aXphdGUvZnJvbnRfYXV0b21hdGl6YXRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgVnVlRGV2VG9vbHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIFZ1ZURldlRvb2xzKCksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9vZmVydGFzLWxhYm9yYWxlcy1iYWNrJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuXHJcbiAgLyogTW90aXZvOlxyXG5cclxuVHUgQXhpb3MgKGF1dG9tYXRpemF0ZUFwaU5lc3QudHMpIHVzYSBiYXNlVVJMOiAnJyBjdWFuZG8gbm8gZXhpc3RlIFZJVEVfQVBJX1VSTF9ORVNULlxyXG5FbnRvbmNlcyBsYXMgbGxhbWFkYXMgYSAvb2ZlcnRhcy1sYWJvcmFsZXMtYmFjay8uLi4gc2FsZW4gXHUyMDFDc2FtZS1vcmlnaW5cdTIwMUQgaGFjaWEgaHR0cDovL2xvY2FsaG9zdDo1MTczLy4uLiAoVml0ZSkuXHJcblNpbiBwcm94eSwgVml0ZSByZXNwb25kZSBcdTIwMUNDYW5ub3QgUE9TVCBcdTIwMjZcdTIwMUQgcG9ycXVlIGVzYSBydXRhIG5vIGV4aXN0ZSBlbiBlbCBkZXYgc2VydmVyLlxyXG5DdVx1MDBFMW5kbyBOTyBzZXJcdTAwRURhIG5lY2VzYXJpbzpcclxuXHJcblNpIGRlZmluZXMgVklURV9BUElfVVJMX05FU1Q9aHR0cDovL2xvY2FsaG9zdDozMDAwIChlbiAuZW52LmxvY2FsLCBwb3IgZWplbXBsbykgeSB0dSBiYWNrZW5kIHRpZW5lIENPUlMgYmllbiBjb25maWd1cmFkbyBwYXJhIHBlcm1pdGlyIGh0dHA6Ly9sb2NhbGhvc3Q6NTE3MyArIGhlYWRlcnMgQXV0aG9yaXphdGlvbi5cclxuTyBzaSBlbiBwcm9kdWNjaVx1MDBGM24gdGllbmVzIHVuIHJldmVyc2UtcHJveHkgcmVhbCAoTmdpbngvQXBhY2hlKSBxdWUgeWEgZW5ydXRhIC9vZmVydGFzLWxhYm9yYWxlcy1iYWNrIGFsIE5lc3QgZW4gZWwgbWlzbW8gZG9taW5pbyAoYWhcdTAwRUQgZWwgcHJveHkgZGUgVml0ZSBubyBhcGxpY2EsIHBlcm8gdGFtcG9jbyBtb2xlc3RhKS5cclxuUmVjb21lbmRhY2lcdTAwRjNuIHByXHUwMEUxY3RpY2E6XHJcblxyXG5FbiBkZXYsIGRlamEgZWwgcHJveHk6IGV2aXRhIENPUlMgeSBhc2VndXJhIHF1ZSBsb3MgUE9TVCBubyBwZWd1ZW4gYSBWaXRlLiAqL1xyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFIsU0FBUyxlQUFlLFdBQVc7QUFDalUsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8saUJBQWlCO0FBSHlKLElBQU0sMkNBQTJDO0FBTWxPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsMkJBQTJCO0FBQUEsUUFDekIsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFlRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
