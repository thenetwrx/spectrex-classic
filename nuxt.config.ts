// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "nuxt-vercel-analytics",
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
  routeRules: {
    "/auth/callback": { ssr: false },
  },

  ssr: true,
});
