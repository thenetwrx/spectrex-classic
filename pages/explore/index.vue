<template>
  <div
    class="container max-w-6xl mx-auto px-4 pt-32 min-h-screen flex flex-col"
  >
    <p class="text-4xl font-bold mb-4">Explore</p>

    <div class="flex flex-wrap gap-2 overflow-x-auto mb-6">
      <NuxtLink
        href="/explore"
        class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
      >
        <span class="text-accent">/</span>
        All
      </NuxtLink>
      <NuxtLink
        v-for="category in popular_categories"
        :href="'/explore?category=' + category"
        class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
      >
        <span class="text-accent">/</span>
        {{ category }}
      </NuxtLink>
    </div>
    <p class="opacity-75 text-md mb-3">
      Showing ({{ servers?.result?.length || 0 }} / {{ max_per_page }}) results
    </p>
    <FallbackContainer v-if="servers_pending">
      <span class="loading loading-spinner loading-lg"></span>
    </FallbackContainer>
    <FallbackContainer v-else-if="!servers?.result?.length">
      <span>No servers found</span>
    </FallbackContainer>
    <div class="w-fit mx-auto" v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ServerCard v-for="server in servers.result" :server="server" />
      </div>
    </div>

    <div class="flex flex-row items-center place-self-center my-8">
      <button
        class="btn btn-primary btn-sm"
        :class="page === 0 ? 'btn-disabled' : ''"
        v-on:click="go_to_page(page - 1)"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <span class="mx-2 bg-base-200 px-2 py-1 rounded-md"
        >Page {{ page + 1 }}</span
      >
      <button
        class="btn btn-primary btn-sm"
        :class="
          page === max_pages || (servers?.result?.length || 0) < max_per_page
            ? 'btn-disabled'
            : ''
        "
        v-on:click="go_to_page(page + 1)"
      >
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type Server from "~/types/Server";

  const discordCdn = useDiscordCdn();

  const route = useRoute();
  const popular_categories = ref<Array<string>>([
    "Community",
    "Music",
    "Gaming",
    "Anime",
    "Technology",
    "Movies",
    "Other",
  ]);
  const category = computed(() => route.query.category);

  const go_to_page = async (num: number) => {
    page.value = num;
  };

  const page = ref<number>(0);
  const max_per_page = ref<number>(10);
  const max_pages = ref<number>(50);

  const { data: servers, pending: servers_pending } = useFetch<{
    message: string | null;
    result: Server[] | null;
  }>("/api/v1/servers/all/feed", {
    query: { page, category },
    retry: false,
  });
</script>
