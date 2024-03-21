// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@formkit/auto-animate",
    "@nuxtjs/supabase",
  ],
  supabase: {
    cookieOptions: {
      secure: false,
    },
    clientOptions: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    },
    redirectOptions: {
      callback: "/",
      login: "/login",
      include: ["/dashboard(/*)?"],
      exclude: [],
    },
  },
  colorMode: {
    preference: "light", // default value of $colorMode.preference
    dataValue: "theme",
    classPrefix: "",
    classSuffix: "",
  },

  ssr: false,
});
