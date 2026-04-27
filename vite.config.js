import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        community: resolve(__dirname, 'community.html'),
        admin: resolve(__dirname, 'admin.html'),
        packetRoute: resolve(__dirname, 'packet-route.html'),
      }
    }
  }
});
