// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // listen on all addresses
    allowedHosts: ['f427-46-183-110-108.ngrok-free.app']
  }
})

