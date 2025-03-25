import { defineNuxtConfig } from "nuxt/config"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/ionic"],

  ionic: {
    integrations: {
      // Enable Capacitor integration
      capacitor: true,
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
    // Public keys that are exposed to the client
    public: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    },
  },

  compatibilityDate: "2025-03-25"
})