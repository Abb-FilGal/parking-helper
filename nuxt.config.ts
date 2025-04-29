import { defineNuxtConfig } from "nuxt/config"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/ionic"],

  ionic: {
    integrations: {
      // Enable router integration
      router: true,
    },
    css: {
      // Include Ionic CSS
      core: true,
      utilities: true,
    },
  },

  // Make sure you don't have any custom routing configurations here
  // that might override the default behavior
  runtimeConfig: {
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    // Public keys that are exposed to the client
    public: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,

      // Add Cloudinary config
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    },
  },

  plugins: [
    "~/plugins/firebase.client.ts",
    "~/plugins/cloudinary.client.ts",
  ],

  compatibilityDate: "2025-03-25",

  css: [
    'leaflet/dist/leaflet.css',
    'swiper/swiper.min.css', // Correct Swiper CSS path
    '@ionic/vue/css/core.css', // Ionic core styles
    '@ionic/vue/css/normalize.css',
    '@ionic/vue/css/structure.css',
    '@ionic/vue/css/typography.css',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '', // Remove Swiper import here
        },
      },
    },
    build: {
      rollupOptions: {
        external: [
          '@ionic/core/components/ion-accordion.js',
          '@ionic/core/components/capacitor.js',
        ],
      },
    },
    optimizeDeps: {
      include: ['fuse.js'], // Ensure Fuse.js is pre-bundled
    },
  },
})