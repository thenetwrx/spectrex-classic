// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss", "nuxt-gtag"],
  image: {
    format: ["avif", "webp"],
    domains: ["https://cdn.discordapp.com"],
  },
  gtag: {
    id: "G-QV206613S8",
  },
  ssr: true,
});
