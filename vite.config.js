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
        stations: resolve(__dirname, 'station_list.html'),
        station: resolve(__dirname, 'station.html'),
        earthquake: resolve(__dirname, 'earthquake.html'),
        seismogram: resolve(__dirname, 'seismogram.html'),
      },
    },
  },
});
