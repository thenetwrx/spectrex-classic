// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss", "nuxt-time"],
  image: {
    format: ["avif", "webp"],
    domains: ["https://cdn.discordapp.com"],
  },
  ssr: true,
});