import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'register.html'),
        status: resolve(__dirname, 'status.html'),
        pathfinder: resolve(__dirname, 'pathfinder.html'),
        atlas: resolve(__dirname, 'atlas.html'),
        community: resolve(__dirname, 'community.html'),
        admin: resolve(__dirname, 'admin.html'),
        packetRoute: resolve(__dirname, 'packet-route.html'),
      }
    }
  }
});
