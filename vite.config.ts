import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa'; 

export default defineConfig(() => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    dyadComponentTagger(),
    react(),
    VitePWA({ 
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // swSrc: 'src/sw.js', // Ye line hata di kyunki srcDir aur filename already defined hain
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // FIX: 'workbox' ki jagah 'injectManifest' use karna padta hai jab strategy 'injectManifest' ho
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,mp3}'],
      },

      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'notification.mp3', 'index.html'], 
      manifest: {
        name: 'Aslam Tailor & Clothes',
        short_name: 'Aslam Tailor',
        description: 'Your personalized tailoring and clothing app.',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module', // Development me module type kabhi kabhi zaruri hota hai
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));