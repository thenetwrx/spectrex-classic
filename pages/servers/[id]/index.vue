<template>
  <Container class="max-w-4xl text-center">
    <ResourcePending v-if="server_pending" />
    <ResourceNotFound
      v-else-if="!server?.result"
      :message="server_error?.data.message"
    />
    <template v-else>
      <ResourceRow>
        <NuxtLink
          class="btn btn-ghost btn-sm"
          :href="'/dashboard/servers/' + server.result.id"
          v-if="server.result.owner_id === lucia?.user?.id"
        >
          Manage <i class="fa-solid fa-gear"></i>
        </NuxtLink>
        <NuxtLink
          :href="'/servers/' + server.result.id + '/report'"
          class="btn btn-ghost btn-sm"
          v-if="server.result.owner_id !== lucia?.user?.id"
        >
          Report <i class="fa-solid fa-flag"></i>
        </NuxtLink>
        <button class="btn btn-ghost btn-sm" v-on:click="copy_current_url">
          Copy <i class="fa-solid fa-link"></i>
        </button>
      </ResourceRow>

      <ResourceCardContainer>
        <ResourceCardHeader>
          <ServerIcon :resource="server.result" />
          <div class="flex flex-col items-start">
            <span class="font-medium text-lg">{{ server.result.name }}</span>
            <div class="flex flex-wrap gap-1 items-center">
              <div
                class="bg-accent bg-opacity-50 px-1 rounded-md"
                v-if="
                  server.result.category !== null &&
                  server.result.approved_at !== null
                "
              >
                <span class="opacity-75">
                  {{ server.result.category }}
                </span>
              </div>
              <div class="bg-error bg-opacity-50 px-1 rounded-md" v-else>
                <span class="opacity-75">Not Approved</span>
              </div>
              <div
                class="bg-warning bg-opacity-50 px-1 rounded-md"
                v-if="!server.result.public"
              >
                <span class="opacity-75">Private</span>
              </div>
              <div
                class="bg-error bg-opacity-50 px-1 rounded-md"
                v-if="server.result.nsfw"
              >
                <span class="opacity-75">NSFW</span>
              </div>
              <div class="flex flex-row gap-1 items-center">
                <div class="bg-[#23A55A] h-4 w-4 rounded-full"></div>
                <p class="opacity-50">
                  {{ server.result.approximate_presence_count }}
                  online
                </p>
              </div>
            </div>
          </div>
          <NuxtLink
            class="btn btn-success text-white rounded-md px-6 ml-auto"
            :href="'/api/v1/servers/' + server.result.id + '/join'"
            :external="true"
            :prefetch="false"
            >Join</NuxtLink
          >
        </ResourceCardHeader>
        <ResourceCardContent>
          <div>
            <p class="text-2xl pb-2">Tags</p>

            <div
              class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto"
              v-if="server.result.tags?.length"
            >
              <span
                v-for="tag in server.result.tags"
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
              {{ server.result.description }}
            </p>
          </div>
        </ResourceCardContent>
      </ResourceCardContainer>

      <ResourceReviewsContent>
        <p class="opacity-50">
          No reviews yet...
          <NuxtLink href="#" class="text-accent">Create one!</NuxtLink>
        </p>
      </ResourceReviewsContent>
    </template>
  </Container>
</template>

<script setup lang="ts">
  import useClipboard from "~/composables/useClipboard";

  const lucia = useLucia();
  const discord = useDiscord();
  const route = useRoute();
  const server_id = route.params.id;

  const {
    data: server,
    pending: server_pending,
    error: server_error,
  } = useFetch<{
    message: string | null;
    result: typeof servers_table.$inferSelect;
  }>(`/api/v1/servers/${server_id}`, { retry: false });

  useHead({
    title: computed(() =>
      server.value?.result ? `${server.value.result.name}` : "unknown server"
    ),
  });

  const copy_current_url = async () => {
    const { toClipboard } = useClipboard();
    toClipboard(window.location.href);
  };
</script>
