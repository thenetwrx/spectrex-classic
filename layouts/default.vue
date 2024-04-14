<script setup lang="ts">
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
        href: "https://site-assets.fontawesome.com/releases/v6.5.2/css/all.css",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo&family=Share+Tech+Mono&display=swap",
      },
    ],
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} · Spectrex` : "Spectrex";
    },
  });

  useSeoMeta({
    description:
      "Unleash a world of niche communities, passionate gamers, and endless possibilities. Curated listings, tailored just for you.",
    ogTitle: "Spectrex - Find YOUR Discord server",
    ogDescription:
      "Unleash a world of niche communities, passionate gamers, and endless possibilities. Curated listings, tailored just for you.",
    ogImage: "https://spectrex.app/images/logo_black.png",
    ogSiteName: "Spectrex",
    ogType: "website",
    ogUrl: "https://spectrex.app",
    ogLocale: "en_US",
    twitterCard: "summary",
    twitterSite: "@joebiden",
    twitterCreator: "@joebiden",
  });

  const isMobileSidebarOpen = ref<boolean>(false);

  const lucia = useLucia();
  const discordCdn = useDiscordCdn();

  const logout = async () => {
    await $fetch("/api/v1/auth/logout", {
      method: "POST",
      retry: false,
    });
    lucia.value = null;
    navigateTo("/");
  };
</script>

<style>
  body {
    font-family: "Cairo";
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
    <div class="md:hidden fixed top-0 left-4 z-[9999]">
      <button
        v-on:click="isMobileSidebarOpen = !isMobileSidebarOpen"
        class="bg-base-200 p-4 mt-4 btn"
      >
        <i class="fas fa-bars"></i>
      </button>
      <div
        v-show="isMobileSidebarOpen"
        v-on:click="isMobileSidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
      ></div>
      <div
        v-show="isMobileSidebarOpen"
        class="fixed inset-y-0 left-0 bg-base-200 w-64 z-[9999] flex flex-col justify-between animate-once animate-duration-300 animate-fade-right animate-ease-in-out"
      >
        <div class="flex flex-col gap-3 p-2">
          <!-- Logo and Navigation Links -->
          <NuxtLink
            href="/"
            class="flex flex-row items-center gap-1 h-fit text-xl py-3"
          >
            <NuxtImg src="/images/logo.png" class="h-12" />
          </NuxtLink>
          <NuxtLink href="/explore" class="p-2 bg-secondary rounded-md">
            <span>Explore</span>
          </NuxtLink>
          <NuxtLink
            href="/legal/guidelines"
            class="p-2 bg-secondary rounded-md"
          >
            <span>Guidelines</span>
          </NuxtLink>
          <NuxtLink href="/premium" class="p-2 bg-secondary rounded-md">
            <span>Premium</span>
          </NuxtLink>
        </div>
        <div class="flex flex-col items-start gap-2 p-4 w-full">
          <div
            class="join flex flex-row w-full items-center gap-1"
            v-if="lucia?.user"
          >
            <NuxtLink
              href="/dashboard"
              data-theme="dark"
              class="btn btn-secondary btn-sm flex-grow join-item"
            >
              <span>Dashboard</span>
            </NuxtLink>
            <button
              v-on:click="logout"
              class="btn btn-secondary btn-sm join-item"
              data-theme="dark"
            >
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>

          <NuxtLink
            v-else
            href="/api/v1/auth/discord"
            :external="true"
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
      class="hidden md:block w-full p-0 fixed top-0 z-[9999] animate-once animate-fade-down animate-ease-in-out border-b-2 border-y-[#2D2D2D]"
    >
      <div
        class="py-4 px-2 max-md:px-4 h-16 bg-base-200 flex flex-row items-center gap-3"
      >
        <NuxtLink href="/" class="btn btn-ghost items-center px-3">
          <NuxtImg src="/images/logo.png" class="h-10" />
          <!-- <span class="text-lg">Spectrex</span> -->
        </NuxtLink>
        <NuxtLink
          href="/explore"
          class="text-[#a1a1a1] hover:text-[#fff] transition-all duration-300"
        >
          Explore
        </NuxtLink>
        <NuxtLink
          href="/legal/guidelines"
          class="text-[#a1a1a1] hover:text-[#fff] transition-all duration-300"
        >
          Guidelines
        </NuxtLink>
        <NuxtLink
          href="/premium"
          class="text-[#a1a1a1] hover:text-[#fff] transition-all duration-300"
          >Premium
        </NuxtLink>

        <div class="flex items-center gap-1 ml-auto">
          <div class="dropdown dropdown-end" v-if="lucia?.user">
            <div tabindex="0" class="btn btn-ghost avatar">
              <div class="w-8 h-8 overflow-hidden rounded-full">
                <div class="avatar" v-if="lucia.user.avatar">
                  <div class="rounded-full w-full">
                    <img
                      alt="Resource Image"
                      :src="
                        discordCdn.user_avatar(
                          lucia.user.provider_id,
                          lucia.user.avatar
                        )
                      "
                    />
                  </div>
                </div>
                <div class="h-full" v-else>
                  <div
                    class="rounded-full w-full h-full bg-secondary flex flex-col"
                  >
                    <span class="text-xl opacity-50 m-auto">{{
                      lucia?.user?.display_name?.slice(0, 2).toUpperCase() ||
                      "?"
                    }}</span>
                  </div>
                </div>
              </div>
              <i class="fa-solid fa-caret-down"></i>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-200 rounded-md w-52 mt-4"
            >
              <li>
                <NuxtLink href="/dashboard">Dashboard</NuxtLink>
              </li>
              <span class="divider w-full py-2 px-4 m-0"></span>
              <li>
                <span v-on:click="logout">Logout</span>
              </li>
            </ul>
          </div>

          <NuxtLink
            v-else
            href="/api/v1/auth/discord"
            :external="true"
            class="btn btn-sm btn-secondary px-4"
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
      class="mt-auto w-full flex flex-col gap-12 bg-base-200 p-24 max-md:p-10 border-t-2 border-y-[#2D2D2D]"
    >
      <div class="flex flex-row max-md:flex-col gap-6">
        <NuxtLink
          href="/"
          class="flex flex-row items-center gap-1 h-fit text-xl"
        >
          <NuxtImg src="/images/logo.png" class="h-12" />
          <span class="text-3xl">SPECTREX</span>
        </NuxtLink>
        <div class="flex flex-col gap-2">
          <p class="opacity-75 text-md whitespace-break-spaces">SERVICE</p>
          <NuxtLink href="/explore">Find a server</NuxtLink>
          <NuxtLink href="/dashboard">Add your server</NuxtLink>
          <NuxtLink href="/premium">Premium</NuxtLink>
        </div>
        <div class="flex flex-col gap-2">
          <p class="opacity-75 text-md whitespace-break-spaces">LEGAL</p>
          <NuxtLink href="/legal/guidelines">Guidelines</NuxtLink>
          <NuxtLink href="/legal/terms-of-service">Terms of Service</NuxtLink>
          <NuxtLink href="/legal/privacy-policy">Privacy Policy</NuxtLink>
        </div>
        <div class="flex flex-col gap-2">
          <p class="opacity-75 text-md whitespace-break-spaces">SUPPORT</p>
          <NuxtLink href="/discord">Discord Support</NuxtLink>
          <NuxtLink href="mailto:contact@spectrex.app">Email Support</NuxtLink>
        </div>
      </div>

      <p class="opacity-75 ml-auto max-md:mx-auto">
        &copy; 2024 Spectrex -
        <NuxtLink
          href="https://scriptkiddie5.vercel.app"
          target="_blank"
          class="underline"
        >
          by scriptkiddie
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
