import { defineConfig } from 'vite';

const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:3000';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  server: {
    proxy: {
      // En desarrollo local el frontend habla con la API Express (server/index.js).
      // Las URLs relativas de imágenes y comprobantes (/api/uploads/...) pasan por
      // este proxy; sin él Vite las trataría como rutas del SPA y devolvería el
      // index.html en vez del archivo subido.
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});