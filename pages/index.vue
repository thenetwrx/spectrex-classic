<template>
  <div class="max-w-5xl mx-auto px-4 py-16">
    <div class="flex flex-col">
      <div class="flex flex-col">
        <h1 class="text-5xl text-center">
          Find <span class="font-bold">your</span> Discord server
        </h1>
        <p class="py-2 text-xl max-w-2xl mx-auto text-center">
          Unleash a world of niche communities, passionate gamers, and endless
          possibilities. Curated listings, tailored just for you.
        </p>

        <div
          class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit mx-auto overflow-x-auto py-2"
        >
          <NuxtLink
            v-for="category in categories"
            :href="'/explore?category=' + category"
            class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
          >
            <span class="text-black dark:text-primary">/</span>
            {{ category }}
          </NuxtLink>
        </div>

        <div class="flex flex-row gap-2 mx-auto py-8">
          <NuxtLink class="btn btn-primary" href="/explore">
            Find a server
          </NuxtLink>
          <NuxtLink
            class="btn btn-secondary btn-outline"
            href="/dashboard/servers"
          >
            Add your server
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Spectrex - Home",
  ogTitle: "Spectrex - Find your Discord server",
  ogImage: "https://spectrex.app/images/logo_spectrex_white.png",
  description:
    "Unleash a world of niche communities, passionate gamers, and endless possibilities. Curated listings, tailored just for you.",
});

const categories = ref<Array<string>>([
  "Community",
  "Music",
  "Gaming",
  "Anime",
  "Technology",
  "Movies",
  "Other",
]);
</script>
