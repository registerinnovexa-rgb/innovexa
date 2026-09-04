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
        atlas: resolve(__dirname, 'atlas.html'),
                admin: resolve(__dirname, 'admin.html'),
        packetRoute: resolve(__dirname, 'packet-route.html'),
        forge: resolve(__dirname, 'forge.html'),
        pathfinder: resolve(__dirname, 'pathfinder.html'),
        feedback: resolve(__dirname, 'feedback.html'),
      }
    }
  }
});
