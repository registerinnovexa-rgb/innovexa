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
        events: resolve(__dirname, 'events.html'),
        resources: resolve(__dirname, 'resources.html'),
        documents: resolve(__dirname, 'documents.html'),
        community: resolve(__dirname, 'community.html'),
        admin: resolve(__dirname, 'admin.html'),
        packetRoute: resolve(__dirname, 'packet-route.html'),
      }
    }
  }
});
