import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'register.html'),
        status:   resolve(__dirname, 'status.html'),
        portal:   resolve(__dirname, 'portal.html'),
        atlas:    resolve(__dirname, 'atlas.html'),
        pathfinder: resolve(__dirname, 'pathfinder.html'),
      }
    }
  }
});
