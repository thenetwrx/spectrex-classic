<template>
  <ResourceContainer>
    <ResourcePending v-if="server_pending" />
    <ResourceNotFound v-else-if="!server?.result" />
    <template v-else>
      <ResourceRow>
        <NuxtLink
          class="btn btn-ghost btn-sm"
          :href="'/dashboard/servers/' + server.result.id"
          v-if="server.result.owner_id === lucia?.user?.id"
        >
          Manage <i class="fa-solid fa-gear"></i>
        </NuxtLink>
        <button
          class="btn btn-ghost btn-sm"
          :class="
            server_metadata.bumping || server_metadata.on_cooldown
              ? 'btn-disabled'
              : ''
          "
          v-if="server.result.owner_id === lucia?.user?.id"
          v-on:click="bump_server"
        >
          <span v-if="server_metadata.on_cooldown">
            {{ formatRemainingTime(Number(server.result.bumped_at || 0)) }}
          </span>
          <div v-if="!server_metadata.on_cooldown">
            <span v-if="!server_metadata.bumping">Bump </span>
            <span v-else>Bumping </span>
          </div>
          <i class="fa-solid fa-up-from-line"></i>
        </button>
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
          <ResourceCardHeaderImage
            :resource="
              server.result.icon
                ? discordCdn.server_icon(
                    server.result.discord_id,
                    server.result.icon
                  )
                : null
            "
            :abbreviation="server.result.name.slice(0, 2).toUpperCase()"
          />
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
                <span class="opacity-75">{{ server.result.category }}</span>
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
            :href="server.result.invite_link || '#'"
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
            <p class="opacity-50" v-else>No tags provided</p>
          </div>
          <div>
            <p class="text-2xl pb-2">Description</p>

            <p class="break-words opacity-50">
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
  </ResourceContainer>
</template>

<script setup lang="ts">
  import useClipboard from "~/composables/useClipboard";
  import type Server from "~/types/Server";

  const discordCdn = useDiscordCdn();
  const lucia = useLucia();
  const route = useRoute();
  const server_id = route.params.id;

  const server_metadata = ref<{
    on_cooldown: boolean;
    bumping: boolean;
  }>({ on_cooldown: false, bumping: false });

  const {
    data: server,
    refresh: refreshServer,
    pending: server_pending,
  } = useFetch<{ message: string | null; result: Server | null }>(
    `/api/v1/servers/${server_id}/fetch`,
    { retry: false }
  );

  const copy_current_url = async () => {
    const { toClipboard } = useClipboard();
    toClipboard(window.location.href);
  };

  onMounted(async () => refreshServerMetadata());
  watch(server, () => refreshServerMetadata());

  const refreshServerMetadata = () => {
    const premium = lucia.value?.user.premium_since !== null ? true : false;

    const cooldown = premium ? 3600000 : 7200000;
    const on_cooldown =
      Number(server.value?.result?.bumped_at || 0) + cooldown <= Date.now()
        ? false
        : true;

    server_metadata.value.bumping = false;
    server_metadata.value.on_cooldown = on_cooldown;
  };

  const bump_server = async () => {
    if (server.value !== null) {
      server_metadata.value.bumping = true;
      const response = await fetch(`/api/v1/servers/${server_id}/bump`, {
        method: "POST",
      });
      if (response.status === 401) {
        await $fetch("/api/v1/auth/logout", {
          method: "POST",
          retry: false,
        });
        lucia.value = null;
        navigateTo("/");
      }

      server_metadata.value.bumping = false;

      await refreshServer();
    }
  };

  function formatRemainingTime(bumped_at: number) {
    const premium = lucia.value?.user.premium_since ? true : false;

    const cooldownDuration = premium ? 3600000 : 7200000;
    const targetTime = new Date(bumped_at + cooldownDuration);
    const timeDifference = targetTime.getTime() - Date.now();

    if (timeDifference <= 0) {
      return "00:00:00"; // Cooldown ended
    }

    const totalSeconds = Math.floor(timeDifference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
</script>
