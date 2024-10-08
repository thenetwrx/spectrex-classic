<template>
  <Container class="max-w-6xl flex flex-col">
    <h1 class="text-center text-4xl font-bold pb-12">Explore</h1>

    <div class="flex flex-wrap gap-2 overflow-x-auto mb-6 w-fit mx-auto">
      <button
        v-on:click="() => handleQuery('category', undefined)"
        class="block max-w-fit px-2 py-1 bg-accent border-none rounded-sm gap-2 hover:cursor-pointer text-white"
        :class="
          category === 'everything'
            ? 'bg-opacity-100'
            : 'bg-opacity-50 hover:bg-opacity-65 transition-colors duration-200 ease-in-out'
        "
      >
        <span :class="category === 'everything' ? 'text-white' : 'text-accent'">
          /
        </span>
        Everything
      </button>
      <button
        v-for="_category in permitted_categories"
        v-on:click="() => handleQuery('category', _category[0])"
        class="block max-w-fit px-2 py-1 bg-accent border-none rounded-sm gap-2 hover:cursor-pointer text-white"
        :class="
          category === _category[0]
            ? 'bg-opacity-100'
            : 'bg-opacity-50 hover:bg-opacity-65 transition-colors duration-200 ease-in-out'
        "
      >
        <span :class="category === _category[0] ? 'text-white' : 'text-accent'">
          /
        </span>
        {{ _category[1] }}
      </button>
    </div>

    <div class="w-full h-fit my-4 flex flex-row items-center gap-2">
      <h3 class="text-xl">
        Showing
        <span class="font-bold"
          >{{ max_per_page * page + 1 }}-{{
            page === 0 ? max_per_page : page * max_per_page + max_per_page
          }}</span
        >
        of <span class="font-bold">{{ servers?.amount }}</span> servers
      </h3>
      <div class="dropdown dropdown-end ml-auto">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-sm items-center flex flex-row"
        >
          Language
          <i class="fa-solid fa-angle-down"></i>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-200 border border-secondary rounded-md w-48 mt-2"
        >
          <li v-on:click="handleQuery('language', undefined)">
            <span>
              <i class="fa-solid fa-check" v-if="language === 'all'"></i>
              All
            </span>
          </li>
          <li
            v-for="_language in permitted_languages"
            v-on:click="handleQuery('language', _language[0])"
          >
            <span>
              <i class="fa-solid fa-check" v-if="language === _language[0]"></i>
              {{ _language[1] }}
            </span>
          </li>
        </ul>
      </div>
      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-sm flex flex-row items-center"
        >
          Sort
          <i class="fa-solid fa-angle-down"></i>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-200 border border-secondary rounded-md w-48 mt-2"
        >
          <li v-on:click="handleQuery('sort', undefined)">
            <span>
              <i class="fa-solid fa-check" v-if="sort === 'bumped_at'"></i>
              Bumped Recently
            </span>
          </li>
          <li v-on:click="handleQuery('sort', 'approximate_member_count')">
            <span>
              <i
                class="fa-solid fa-check"
                v-if="sort === 'approximate_member_count'"
              ></i>
              Member Count
            </span>
          </li>
        </ul>
      </div>
    </div>

    <ResourcePending v-if="servers_pending" />
    <ResourceNotFound
      v-else-if="!servers?.result?.length"
      message="No servers found"
    />
    <div class="w-fit mx-auto" v-else>
      <div class="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4">
        <ResourceCardContainer v-for="server in servers.result">
          <ResourceCardHeader class="relative">
            <NuxtLink :href="'/servers/' + server.id">
              <ServerIcon :resource="server" />
            </NuxtLink>
            <div class="flex flex-col">
              <NuxtLink :href="'/servers/' + server.id">
                <span class="font-medium text-lg">{{ server.name }}</span>
              </NuxtLink>
              <div class="flex flex-wrap gap-1 items-center">
                <div class="bg-accent bg-opacity-50 px-1 rounded-md">
                  <span class="opacity-75">
                    {{
                      server.category
                        ? server.category[0].toUpperCase() +
                          server.category?.slice(1)
                        : "Unknown"
                    }}
                  </span>
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
                class="btn btn-ghost btn-sm"
              >
                <i class="fa-solid md:fa-lg fa-flag"></i>
              </NuxtLink>
            </div>
          </ResourceCardHeader>
          <ResourceCardContent>
            <div v-if="server.tags?.length">
              <div
                class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto"
              >
                <span
                  v-for="tag in server.tags"
                  class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
                >
                  <span class="text-accent">#</span>
                  {{ tag.toLowerCase() }}
                </span>
              </div>
            </div>
            <div class="divider my-0"></div>
            <div class="relative">
              <p
                class="break-words whitespace-pre-wrap opacity-90"
                :class="[
                  server.expanded
                    ? ''
                    : 'max-h-[7.50rem] overflow-clip whitespace-nowrap',
                ]"
              >
                {{ server.description }}
              </p>
              <div
                class="absolute inset-x-0 bottom-0 h-16"
                :class="
                  server.expanded
                    ? 'hidden'
                    : 'bg-gradient-to-b from-transparent to-[var(--fallback-b3,oklch(var(--b3)/var(--tw-bg-opacity)))]'
                "
              ></div>
            </div>
            <button
              @click="server.expanded = !server.expanded"
              class="btn btn-circle btn-sm btn-secondary mx-auto"
            >
              <i
                class="fa-solid"
                :class="server.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"
              ></i>
            </button>

            <div class="flex flex-row items-center w-full gap-2">
              <p class="opacity-25">
                {{ formatDistance(new Date(), new Date(server.bumped_at!)) }}
                ago
              </p>
              <NuxtLink
                class="ml-auto btn btn-sm btn-primary px-10"
                target="_blank"
                :href="'/api/v1/servers/' + server.id + '/join'"
                :external="true"
                :prefetch="false"
              >
                Join
              </NuxtLink>
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
        <i class="fa-solid fa-backward"></i>
      </button>

      <div class="bg-base-200 p-3 rounded-md h-full">
        Viewing Page <span class="font-bold">{{ page + 1 }}</span>
        <span class="opacity-25"> / </span>
        <span class="font-bold">{{
          Math.ceil((servers?.amount || max_per_page) / max_per_page)
        }}</span>
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
        <i class="fa-solid fa-forward"></i>
      </button>
    </div>
  </Container>
</template>

<script setup lang="ts">
  import { formatDistance } from "date-fns";
  import {
    permitted_languages,
    permitted_categories,
  } from "@/server/utils/permit";

  useHead({
    title: "Explore",
  });

  const route = useRoute();
  const router = useRouter();

  const language = computed(() => {
    go_to_page(0);
    return route.query.language || "all";
  });
  const category = computed(() => {
    go_to_page(0);
    return route.query.category || "everything";
  });
  const sort = computed(() => {
    go_to_page(0);
    return route.query.sort || "bumped_at";
  });

  const handleQuery = (paramName: string, paramValue: string | undefined) => {
    const query = { ...router.currentRoute.value.query }; // Get current query parameters

    // Set the query parameter dynamically
    if (paramValue?.length) query[paramName] = paramValue;
    else delete query[paramName];

    // Use router.push() with the updated query parameters
    router.push({ query });
  };

  const go_to_page = async (num: number) => {
    page.value = num;
    if (process.client) {
      window.scrollTo(0, 0);
    }
  };

  const page = ref<number>(0);
  const max_per_page = ref<number>(21);

  const { data: servers, pending: servers_pending } = useFetch<{
    message: string | null;
    result:
      | (typeof servers_table.$inferSelect & { expanded: boolean })[]
      | null;
    amount: number;
  }>("/api/v1/servers/all/feed", {
    query: { page, category, language, sort, limit: max_per_page },
    retry: false,
  });
</script>
