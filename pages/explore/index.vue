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
    <div class="w-full text-center my-16" v-if="servers_pending">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <p
      class="w-full text-center opacity-50 my-16"
      v-else-if="!servers?.result?.length"
    >
      No servers found
    </p>
    <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4" v-else>
      <div
        v-for="server in servers?.result
          ?.filter((_server) => _server.approved_at !== null)
          .sort((a, b) => Number(b.bumped_at || 0) - Number(a.bumped_at || 0))"
        class="flex flex-col"
      >
        <div class="bg-base-200 rounded-t-md">
          <!-- Added relative positioning -->
          <!-- Server Image -->
          <div class="flex flex-row items-center gap-2 w-full p-2 relative">
            <div class="w-16 h-16 overflow-hidden rounded-lg">
              <NuxtLink :href="'/servers/' + server.discord_id">
                <img
                  v-if="server.icon"
                  :src="discordCdn.server_icon(server.discord_id, server.icon)"
                  alt="Server Image"
                  class="object-cover rounded-full w-full h-full"
                  :class="server.nsfw ? 'blur-sm' : ''"
                />
                <div
                  v-else
                  class="h-full flex flex-col items-center rounded-full bg-base-100"
                >
                  <p class="opacity-50 mt-auto mb-auto text-3xl">
                    {{ server.name.slice(0, 1).toUpperCase() || "?" }}
                  </p>
                </div>
              </NuxtLink>
            </div>
            <div class="flex flex-col">
              <NuxtLink :href="'/servers/' + server.discord_id">
                <span class="font-medium text-lg">{{ server.name }}</span>
              </NuxtLink>
              <div class="flex flex-wrap gap-1 items-center">
                <div class="bg-accent bg-opacity-50 px-1 rounded-md">
                  <span class="opacity-75">{{ server.category }}</span>
                </div>
                <div
                  class="bg-error bg-opacity-50 px-1 rounded-md"
                  v-if="server.nsfw"
                >
                  <span class="opacity-75">NSFW</span>
                </div>
                <div class="flex flex-row gap-1 items-center">
                  <div class="bg-[#23A55A] h-4 w-4 rounded-full"></div>
                  <p class="opacity-50">
                    {{ server.approximate_presence_count }} online
                  </p>
                </div>
              </div>
            </div>
            <div
              class="absolute top-1 right-1 flex flex-row gap-1 items-center justify-start"
            >
              <NuxtLink
                :href="'/servers/' + server.discord_id + '/report'"
                class="btn btn-ghost max-sm:btn-sm"
              >
                <i class="fa-solid md:fa-lg fa-flag"></i>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="bg-base-300 rounded-b-md py-2 px-4">
          <template v-if="server.tags.length">
            <div
              class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto my-2"
            >
              <span
                v-for="tag in server.tags"
                class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
              >
                <span class="text-accent">#</span>
                {{ tag }}
              </span>
            </div>
            <div class="divider m-0"></div>
          </template>

          <p class="opacity-75 break-words">{{ server.description }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-row items-center place-self-center mt-8">
      <button
        class="btn btn-accent btn-sm"
        :class="page === 0 ? 'btn-disabled' : ''"
        v-on:click="go_to_page(page - 1)"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <span class="mx-2 bg-base-200 px-2 py-1 rounded-md"
        >Page {{ page + 1 }}</span
      >
      <button
        class="btn btn-accent btn-sm"
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
  }>("/api/v1/servers/fetch/feed", {
    query: { page, category },
    retry: false,
  });
</script>
