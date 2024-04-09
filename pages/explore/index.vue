<template>
  <Container class="max-w-6xl flex flex-col">
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
    <ResourcePending v-if="servers_pending" />
    <ResourceNotFound
      v-else-if="!servers?.result?.length"
      message="No servers found"
    />
    <div class="w-fit mx-auto" v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResourceCardContainer v-for="server in servers?.result">
          <ResourceCardHeader class="relative">
            <NuxtLink :href="'/servers/' + server.id">
              <ResourceCardHeaderImage
                :resource="
                  server.icon
                    ? discordCdn.server_icon(server.discord_id, server.icon)
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
              <p class="opacity-50" v-else>No tags provided</p>
            </div>
            <div>
              <p class="text-2xl pb-2">Description</p>

              <p class="break-words opacity-50">
                {{ server.description }}
              </p>
            </div>
          </ResourceCardContent>
        </ResourceCardContainer>
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
