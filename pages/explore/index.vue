<template>
  <Container class="max-w-6xl flex flex-col">
    <p class="text-4xl font-bold mb-4">Explore</p>

    <div class="flex flex-wrap gap-2 overflow-x-auto mb-6">
      <NuxtLink
        href="/explore"
        class="block max-w-fit px-2 py-1 bg-accent border-none rounded-sm gap-2 hover:cursor-pointer text-white"
        :class="
          category === undefined
            ? 'bg-opacity-100'
            : 'bg-opacity-50 hover:bg-opacity-65 transition-colors duration-200 ease-in-out'
        "
      >
        <span :class="category === undefined ? 'text-white' : 'text-accent'"
          >/</span
        >
        All Categories
      </NuxtLink>
      <NuxtLink
        v-for="_category in popular_categories"
        :href="'/explore?category=' + _category"
        class="block max-w-fit px-2 py-1 bg-accent border-none rounded-sm gap-2 hover:cursor-pointer text-white"
        :class="
          category === _category
            ? 'bg-opacity-100'
            : 'bg-opacity-50 hover:bg-opacity-65 transition-colors duration-200 ease-in-out'
        "
      >
        <span :class="category === _category ? 'text-white' : 'text-accent'"
          >/</span
        >
        {{ _category }}
      </NuxtLink>
    </div>
    <div class="flex flex-row items-center mb-3">
      <p class="opacity-75 text-lg">
        Showing
        <span class="font-bold"
          >{{ max_per_page * page + 1 }}-{{
            page === 0 ? max_per_page : page * max_per_page + max_per_page
          }}</span
        >
        of <span class="font-bold">{{ servers?.amount }}</span> servers
      </p>

      <button
        class="btn btn-ghost btn-sm ml-auto"
        v-if="!refreshing"
        v-on:click="refresh"
      >
        <span>Refresh</span>
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>
    <ResourcePending v-if="servers_pending" />
    <ResourceNotFound
      v-else-if="!servers?.result?.length"
      message="No servers found"
    />
    <div class="w-fit mx-auto" v-else>
      <div class="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4">
        <ResourceCardContainer v-for="server in servers?.result">
          <ResourceCardHeader class="relative">
            <NuxtLink :href="'/servers/' + server.id">
              <ResourceCardHeaderImage
                :resource="
                  server.icon
                    ? discordCdn.server_icon(server.provider_id, server.icon)
                    : null
                "
                :abbreviation="server.name.slice(0, 2).toUpperCase()"
              />
            </NuxtLink>
            <div class="flex flex-col">
              <NuxtLink :href="'/servers/' + server.id">
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
                :href="'/servers/' + server.id + '/report'"
                class="btn btn-ghost max-sm:btn-sm"
              >
                <i class="fa-solid md:fa-lg fa-flag"></i>
              </NuxtLink>
            </div>
          </ResourceCardHeader>
          <ResourceCardContent>
            <div>
              <p class="text-2xl pb-2">Tags</p>

              <div
                class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto"
                v-if="server.tags?.length"
              >
                <span
                  v-for="tag in server.tags"
                  class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
                >
                  <span class="text-accent">#</span>
                  {{ tag.toLowerCase() }}
                </span>
              </div>
              <p class="opacity-75" v-else>No tags provided</p>
            </div>
            <div>
              <p class="text-2xl pb-2">Description</p>

              <p class="break-words whitespace-pre-wrap opacity-75">
                {{ server.description }}
              </p>
            </div>
          </ResourceCardContent>
        </ResourceCardContainer>
      </div>
    </div>

    <div class="flex flex-row gap-2 mx-auto my-8">
      <button
        class="btn"
        v-on:click="go_to_page(page - 1)"
        :class="page === 0 ? 'btn-disabled' : ''"
      >
        <i class="fa-solid fa-chevrons-left"></i>
      </button>

      <div class="bg-base-200 p-3 rounded-md h-full">
        {{ page + 1 }} <span class="opacity-25">/</span>
        {{ Math.ceil((servers?.amount || max_per_page) / max_per_page) }}
      </div>

      <button
        class="btn"
        v-on:click="go_to_page(page + 1)"
        :class="
          page + 1 ===
          Math.ceil((servers?.amount || max_per_page) / max_per_page)
            ? 'btn-disabled'
            : ''
        "
      >
        <i class="fa-solid fa-chevrons-right"></i>
      </button>
    </div>
  </Container>
</template>

<script setup lang="ts">
  import type Server from "~/types/Server";

  useHead({
    title: "Explore",
  });
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
  const category = computed(() => {
    go_to_page(0);
    return route.query.category;
  });
  const refreshing = ref<boolean>(false);

  const go_to_page = async (num: number) => {
    page.value = num;
  };
  const refresh = async () => {
    refreshing.value = true;
    go_to_page(0);
    await refreshServers();
    refreshing.value = false;
  };

  const page = ref<number>(0);
  const max_per_page = ref<number>(10);

  const {
    data: servers,
    pending: servers_pending,
    refresh: refreshServers,
  } = useFetch<{
    message: string | null;
    result: Server[] | null;
    amount: number;
  }>("/api/v1/servers/all/feed", {
    query: { page, category },
    retry: false,
  });

  watch(
    () => servers.value,
    () => {
      if (process.client) {
        window.scrollTo(0, 0);
      }
    },
    { immediate: true }
  );
</script>
