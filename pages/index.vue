<template>
  <Container class="max-w-4xl text-center">
    <div class="flex flex-col">
      <h1 class="text-5xl">
        Find <span class="font-bold underline">your</span> Discord server
      </h1>
      <p class="py-2 text-xl max-w-2xl mx-auto opacity-80">
        Unleash a world of niche communities, passionate gamers, and endless
        possibilities. Curated listings, tailored just for you.
      </p>

      <div
        class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit mx-auto overflow-x-auto py-2"
      >
        <NuxtLink
          v-for="category in categories"
          :href="'/explore?category=' + category"
          class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
        >
          <span class="text-accent">/</span>
          {{ category }}
        </NuxtLink>
      </div>
      <p class="ml-auto opacity-75">
        <i class="fa-solid fa-up-left"></i> select a category
      </p>

      <div class="flex flex-row gap-2 mx-auto py-12">
        <NuxtLink class="btn btn-primary btn-sm" href="/explore">
          Find a server
        </NuxtLink>
        <NuxtLink class="btn btn-secondary btn-sm" href="/dashboard">
          Add a server
        </NuxtLink>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
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
