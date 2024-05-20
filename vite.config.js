// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/scsn/ceri_proto/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        eqlist: resolve(__dirname, 'event_list.html'),
        stations: resolve(__dirname, 'station.html'),
      },
    },
  },
});
