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
    script: [
      `
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ly7fg3ab0j");
      `,
    ],
    titleTemplate: (titleChunk) => {
      return titleChunk
        ? `${titleChunk}`
        : "Spectrex: Discover, connect and engage with people!";
    },
  });

  useSeoMeta({
    ogTitle: "Spectrex: Discover, connect and engage with people!",
    description:
      "Grow your Discord community or find your next online home. Our server list advocates for equal exposure, helping servers connect with the right audience.",
    ogDescription:
      "Grow your Discord community or find your next online home. Our server list advocates for equal exposure, helping servers connect with the right audience.",
    ogImage: "https://spectrex.app/images/logo.png",
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

  .sidebar-enter-active,
  .sidebar-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .sidebar-enter-from,
  .sidebar-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }
</style>

<template>
  <ClientOnly>
    <Toaster
      position="top-center"
      :expand="true"
      theme="dark"
      :toastOptions="{
        style: {
          background: '#0a0a0a',
        },
      }"
    />
  </ClientOnly>
  <div class="min-h-screen flex flex-col">
    <div class="md:hidden fixed top-0 left-4 z-[9999]">
      <button
        v-on:click="isMobileSidebarOpen = !isMobileSidebarOpen"
        class="bg-base-200 p-4 mt-4 btn"
      >
        <i class="fas fa-bars"></i>
      </button>
      <Transition name="sidebar">
        <div
          v-if="isMobileSidebarOpen"
          v-on:click="isMobileSidebarOpen = false"
          class="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
        ></div>
      </Transition>
      <Transition name="sidebar">
        <div
          v-if="isMobileSidebarOpen"
          class="fixed inset-y-0 left-0 bg-base-200 w-64 z-[9999] flex flex-col justify-between"
        >
          <div class="flex flex-col gap-3 p-2">
            <NuxtLink
              href="/"
              v-on:click="isMobileSidebarOpen = false"
              class="flex flex-row items-center gap-1 h-fit text-xl py-3"
            >
              <img src="/images/logo.png" class="h-12" />
            </NuxtLink>
            <NuxtLink
              href="/explore"
              v-on:click="isMobileSidebarOpen = false"
              class="p-2 bg-secondary rounded-md"
            >
              <span>Explore</span>
            </NuxtLink>
            <NuxtLink
              href="/legal/guidelines"
              v-on:click="isMobileSidebarOpen = false"
              class="p-2 bg-secondary rounded-md"
            >
              <span>Guidelines</span>
            </NuxtLink>
            <NuxtLink
              href="/pricing"
              v-on:click="isMobileSidebarOpen = false"
              class="p-2 bg-secondary rounded-md"
            >
              <span>Pricing</span>
            </NuxtLink>
          </div>
          <div class="flex flex-col items-start gap-2 p-4 w-full">
            <div
              class="join flex flex-row w-full items-center gap-1"
              v-if="lucia?.user"
            >
              <NuxtLink
                href="/dashboard"
                v-on:click="isMobileSidebarOpen = false"
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
              :prefetch="false"
              class="btn btn-sm btn-secondary w-full"
            >
              <i class="fa-brands fa-discord"></i>
              Login
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>

    <div
      class="hidden md:block w-full p-0 fixed top-0 z-[9999] animate-once animate-fade-down animate-ease-in-out border-b-2 border-y-[#2D2D2D]"
    >
      <div
        class="py-4 px-2 max-md:px-4 h-14 bg-base-200 flex flex-row items-center gap-3"
      >
        <NuxtLink href="/" class="px-3">
          <img src="/images/logo.png" class="h-10" />
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
          href="/pricing"
          class="text-[#a1a1a1] hover:text-[#fff] transition-all duration-300"
          >Pricing
        </NuxtLink>

        <div class="flex items-center gap-1 ml-auto">
          <div class="dropdown dropdown-end" v-if="lucia?.user">
            <div tabindex="0" class="btn btn-ghost avatar">
              <UserAvatar :resource="lucia.user" class="w-8 h-8" />
              <i class="fa-solid fa-caret-down"></i>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-200 border border-secondary rounded-md w-48 mt-4"
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
            :prefetch="false"
            class="btn btn-sm btn-secondary px-4"
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
          <img src="/images/logo.png" class="h-12" />
          <span class="text-3xl">SPECTREX</span>
        </NuxtLink>
        <div class="flex flex-col gap-2">
          <p class="opacity-75 text-md whitespace-break-spaces">SERVICE</p>
          <NuxtLink
            href="/explore?utm_source=site&utm_medium=direct&utm_campaign=footer"
            class="hover:underline"
            >Find a server</NuxtLink
          >
          <NuxtLink
            href="/dashboard?utm_source=site&utm_medium=direct&utm_campaign=footer"
            class="hover:underline"
            >Add a server</NuxtLink
          >
          <NuxtLink
            href="/pricing?utm_source=site&utm_medium=direct&utm_campaign=footer"
            class="hover:underline"
            >Pricing</NuxtLink
          >
        </div>
        <div class="flex flex-col gap-2">
          <p class="opacity-75 text-md whitespace-break-spaces">LEGAL</p>
          <NuxtLink href="/legal/guidelines" class="hover:underline"
            >Guidelines</NuxtLink
          >
          <NuxtLink href="/legal/terms-of-service" class="hover:underline"
            >Terms of Service</NuxtLink
          >
          <NuxtLink href="/legal/privacy-policy" class="hover:underline"
            >Privacy Policy</NuxtLink
          >
        </div>
        <div class="flex flex-col gap-2">
          <p class="opacity-75 text-md whitespace-break-spaces">SUPPORT</p>
          <NuxtLink
            href="/discord?utm_source=site&utm_medium=direct&utm_campaign=footer"
            class="hover:underline"
            >Discord Support</NuxtLink
          >
          <NuxtLink href="mailto:contact@spectrex.app" class="hover:underline"
            >Email Support</NuxtLink
          >
        </div>
      </div>

      <div
        class="flex flex-row max-md:flex-col justify-between text-sm opacity-75"
      >
        <p>Spectrex is not affiliated with Discord.</p>
        <p>&copy; 2024 Spectrex</p>
      </div>
    </div>
  </div>
</template>
