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
      maxAge: 60 * 60 * 8,
      sameSite: "strict",
      secure: true,
    },
    clientOptions: {
      auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true,
      },
    },
    redirectOptions: {
      cookieRedirect: true,
      callback: "https://spectrex.app/auth/callback",
      login: "/login",
      include: ["/dashboard(/*)?", "/servers/*/report"],
      exclude: [],
    },
  },
  colorMode: {
    preference: "dark", // default value of $colorMode.preference
    dataValue: "theme",
    classPrefix: "",
    classSuffix: "",
  },

  ssr: false,
});
