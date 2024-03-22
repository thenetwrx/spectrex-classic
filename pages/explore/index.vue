<template>
  <div class="container max-w-8xl mx-auto px-4 py-8 flex flex-col">
    <div class="flex items-center justify-center">
      <div class="container mx-auto p-4">
        <p class="text-4xl font-bold mb-4">Explore</p>

        <div
          class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto mb-6"
        >
          <NuxtLink
            v-for="tag in popular_tags"
            :href="'/explore?tag=' + tag"
            class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
          >
            <span class="text-black dark:text-primary">#</span>
            {{ tag.toLowerCase() }}
          </NuxtLink>
        </div>
        <p class="opacity-75 text-md mb-3">
          Showing ({{ servers?.data?.length || 0 }} / {{ max_per_page }})
          results
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-if="servers?.data?.length"
            v-for="server in servers?.data
              ?.filter((_server) => _server.approved_at !== null)
              .sort((a, b) => b.bumped_at - a.bumped_at)"
            class="flex flex-col"
          >
            <div class="bg-base-200 rounded-t-md">
              <!-- Added relative positioning -->
              <!-- Server Image -->
              <div class="flex flex-row items-center gap-2 w-full p-2">
                <div class="w-16 h-16 overflow-hidden rounded-lg">
                  <img
                    v-if="server.icon"
                    :src="
                      'https://cdn.discordapp.com/icons/' +
                      server.server_id +
                      '/' +
                      server.icon +
                      '.webp?size=96'
                    "
                    alt="Server Image"
                    class="object-cover rounded-md w-full h-full"
                  />
                  <div
                    v-else
                    class="h-full flex flex-col items-center rounded-full bg-base-100"
                  >
                    <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                      {{ server.server_name.slice(0, 1).toUpperCase() || "?" }}
                    </p>
                  </div>
                </div>
                <div class="flex flex-col">
                  <span class="font-medium">{{ server.server_name }}</span>
                  <div class="flex flex-row gap-1 items-center">
                    <div class="bg-[#23A55A] h-4 w-4 rounded-full"></div>
                    <p class="text-zinc-500">
                      {{ server.approximate_presence_count }} online
                    </p>
                  </div>
                </div>
                <div class="flex flex-row gap-1 items-center ml-auto">
                  <NuxtLink
                    :href="'/servers/' + server.server_id"
                    class="btn btn-ghost"
                  >
                    <i class="fa-solid fa-lg fa-arrow-up-right-from-square"></i>
                  </NuxtLink>
                  <NuxtLink
                    :href="'/servers/' + server.server_id + '/report'"
                    class="btn btn-ghost"
                  >
                    <i class="fa-solid fa-lg fa-flag"></i>
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div class="bg-base-300 rounded-b-md py-2 px-4">
              <template v-if="server.tags.length">
                <div
                  class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto my-2"
                >
                  <NuxtLink
                    v-for="tag in server.tags"
                    :href="'/explore?tag=' + tag"
                    class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
                  >
                    <span class="text-black dark:text-primary">#</span>
                    {{ tag.toLowerCase() }}
                  </NuxtLink>
                </div>
                <div class="divider m-0"></div>
              </template>

              <p class="opacity-75 break-words">{{ server.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row items-center place-self-center mt-8">
      <button class="btn btn-primary btn-sm" @click="go_to_page(page - 1)">
        Previous
      </button>
      <span class="mx-2">{{ page + 1 }} / {{ max_pages }}</span>
      <button class="btn btn-primary btn-sm" @click="go_to_page(page + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const client = useSupabaseClient();
const popular_tags = ref<Array<string>>([
  "community",
  "gaming",
  "memes",
  "anime",
  "giveaways",
  "music",
  "chill",
  "dating",
  "friends",
]);

const go_to_page = async (num: number) => {
  page.value = num;
  refreshNuxtData("servers");
};

const page = ref<number>(0);
const max_per_page = ref<number>(10);
const max_pages = ref<number>(50);

const { data: servers } = await useAsyncData(
  "servers",
  async () =>
    await client
      .from("servers")
      .select("*")
      .not("approved_at", "is", null)
      .order("bumped_at")
      .limit(max_per_page.value)
      .range(
        max_per_page.value * page.value,
        (page.value + 1) * max_per_page.value - 1
      )
);
</script>
