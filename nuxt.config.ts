// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss"],
  image: {
    format: ["webp"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1536,
    },
    domains: ["https://cdn.discordapp.com"],
    presets: {
      avatar: {
        modifiers: {
          format: "webp",
          width: 32,
          height: 32,
        },
      },
    },
    cloudflare: {
      baseURL: "https://spectrex.app",
    },
  },
  ssr: true,
});
