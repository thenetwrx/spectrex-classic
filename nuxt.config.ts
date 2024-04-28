// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss", "nuxt-time"],
  image: {
    format: ["avif", "webp"],
    domains: ["https://cdn.discordapp.com"],
  },
  build: {
    transpile: ["vue-sonner"],
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          experimentalMinChunkSize: 500_000,
        },
      },
    },
  },
  ssr: true,
});
