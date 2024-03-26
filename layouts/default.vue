<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();

useHead({
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
    },
    {
      rel: "stylesheet",
      href: "https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css",
    },
    {
      rel: "stylesheet",
      href: "https://site-assets.fontawesome.com/releases/v6.4.2/css/sharp-regular.css",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cairo&family=REM&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",
    },
  ],
  title: "Spectrex",
  meta: [
    {
      name: "description",
      content:
        "Join awesome Discord communities. Find gamers, hobbyists, and like-minded people on Spectrex. Explore now!",
    },
    {
      name: "og:title",
      content: "Spectrex - Find YOUR Discord server",
    },
    {
      name: "og:description",
      content:
        "Join awesome Discord communities. Find gamers, hobbyists, and like-minded people on Spectrex. Explore now!",
    },
    {
      name: "og:image",
      content: "https://spectrex.app/images/logo_spectrex.png",
    },
    {
      name: "og:site_name",
      content: "Spectrex",
    },
    {
      name: "og:type",
      content: "website",
    },
    {
      name: "og:url",
      content: "https://spectrex.app",
    },
    {
      name: "og:locale",
      content: "en_US",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:site",
      content: "@joebiden",
    },
    {
      name: "twitter:creator",
      content: "@joebiden",
    },
    {
      name: "twitter:title",
      content: "Spectrex - Find YOUR Discord server",
    },
    {
      name: "twitter:description",
      content:
        "Join awesome Discord communities. Find gamers, hobbyists, and like-minded people on Spectrex. Explore now!",
    },
    {
      name: "twitter:image",
      content: "https://spectrex.app/images/logo_spectrex.png",
    },
    {
      name: "keywords",
      content:
        "Discord servers, find Discord, Discord communities, gaming Discord",
    },
  ],
});

// useSeoMeta({
//   title: "Spectrex",
//   ogTitle: "Spectrex - Find your Discord server",
//   description:
//     "Unleash a world of niche communities, passionate gamers, and endless possibilities. Curated listings, tailored just for you.",
//   ogDescription:
//     "Unleash a world of niche communities, passionate gamers, and endless possibilities. Curated listings, tailored just for you.",
//   ogImage: "https://spectrex.app/images/logo_spectrex_white.png",
//   twitterCard: "summary_large_image",
// });

const logout = async () => {
  await supabase.auth.signOut();
  useRouter().push("/");
};

const isMobileSidebarOpen = ref<boolean>(false);
</script>

<style>
body {
  font-family: Cairo;
}
a:hover {
  text-decoration: underline;
}
.mono {
  font-family: "Share Tech Mono", monospace;
  font-weight: 400;
  font-style: normal;
}
</style>

<template>
  <div class="container-fluid min-h-screen flex flex-col">
    <!-- Mobile Sidebar -->
    <div class="md:hidden sticky top-0 left-4 z-50 p-3">
      <button
        @click="isMobileSidebarOpen = !isMobileSidebarOpen"
        class="bg-base-200 p-4 mt-4 btn"
      >
        <i class="fas fa-bars"></i>
      </button>
      <div
        v-show="isMobileSidebarOpen"
        @click="isMobileSidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
      ></div>
      <div
        v-show="isMobileSidebarOpen"
        class="fixed inset-y-0 left-0 bg-base-200 w-64 z-50 flex flex-col justify-between animate-once animate-duration-300 animate-fade-right animate-ease-in-out"
      >
        <div class="flex flex-col gap-2 p-2">
          <!-- Logo and Navigation Links -->
          <NuxtLink href="/" class="mx-auto py-3">
            <NuxtImg src="/images/logo_spectrex.png" class="h-6" />
          </NuxtLink>
          <NuxtLink href="/explore" class="p-2 bg-base-300 rounded-md">
            <span>Explore</span>
          </NuxtLink>
          <NuxtLink
            href="/dashboard/servers"
            class="p-2 bg-base-300 rounded-md"
          >
            <span>Add server</span>
          </NuxtLink>
          <NuxtLink href="/premium" class="p-2 bg-base-300 rounded-md">
            <span>Premium</span>
          </NuxtLink>
        </div>
        <div class="flex flex-col items-start gap-2 p-4 w-full">
          <div class="join flex flex-row w-full items-center gap-1" v-if="user">
            <NuxtLink
              href="/dashboard/servers"
              data-theme="dark"
              class="btn btn-secondary btn-sm flex-grow join-item"
            >
              <span>Dashboard</span>
            </NuxtLink>
            <button
              @click="logout"
              class="btn btn-secondary btn-sm join-item"
              data-theme="dark"
            >
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
          <NuxtLink
            v-else
            href="/login"
            class="btn btn-sm btn-secondary w-full"
            data-theme="dark"
          >
            <i class="fa-brands fa-discord"></i>
            Login
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Desktop Navbar -->
    <div
      class="hidden md:block w-full p-0 sticky top-0 z-40 animate-once animate-fade-down animate-ease-in-out"
    >
      <div
        class="py-4 px-20 max-md:px-4 h-16 bg-base-200 flex flex-row items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <NuxtLink href="/" class="mr-3">
            <NuxtImg src="/images/logo_spectrex.png" class="h-6" />
          </NuxtLink>

          <NuxtLink href="/explore"><span>Explore</span></NuxtLink>
          <NuxtLink href="/dashboard/servers"><span>Add server</span></NuxtLink>
          <NuxtLink href="/premium"><span>Premium</span></NuxtLink>
        </div>
        <div class="flex items-center gap-1">
          <div class="dropdown dropdown-end" v-if="user">
            <div tabindex="0" class="btn btn-ghost avatar">
              <div class="w-8 rounded-full">
                <NuxtImg :src="user.user_metadata.avatar_url" />
              </div>
              <i class="fa-solid fa-caret-down"></i>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-200 rounded-md w-52 mt-4"
            >
              <li>
                <NuxtLink href="/dashboard/servers">Dashboard</NuxtLink>
              </li>
              <span class="divider w-full py-2 px-4 m-0"></span>
              <li><button @click="logout">Logout</button></li>
            </ul>
          </div>

          <NuxtLink
            v-else
            href="/login"
            class="btn btn-sm btn-secondary"
            data-theme="dark"
          >
            <i class="fa-brands fa-discord"></i>
            Login
          </NuxtLink>
        </div>
      </div>
    </div>
    <slot />
    <div
      class="mt-auto w-full flex flex-row items-center opacity-75 py-24 px-24 max-lg:px-4"
    >
      <p class="flex flex-wrap gap-1">
        &copy; 2024 Spectrex
        <span class="opacity-50">•</span>
        <NuxtLink href="/discord" class="underline"> Support </NuxtLink>
        <span class="opacity-50">•</span>
        <NuxtLink href="/legal/terms-of-service" class="underline">
          Terms
        </NuxtLink>
        <span class="opacity-50">•</span>
        <NuxtLink href="/legal/privacy-policy" class="underline">
          Privacy
        </NuxtLink>
      </p>
      <div class="flex flex-row gap-3 items-center ml-auto">
        <a href="mailto:contact@spectrex.app">
          <i class="fa-solid fa-lg fa-envelope"></i>
        </a>
      </div>
    </div>
  </div>
</template>
