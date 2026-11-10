import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'pages/login.html',
        register: 'pages/register.html',
        profile: 'pages/profile.html',
        listing: 'pages/listing.html',
      },
    },
  },
})
