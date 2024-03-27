<template>
  <div class="container max-w-4xl mx-auto px-4 py-8 text-center">
    <div
      class="w-full text-center mt-12"
      v-if="server_pending || profile_pending"
    >
      <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
    </div>
    <p class="text-4xl" v-else-if="!server?.result?.length">
      Hm... That server doesn't seem to exist!
    </p>
    <template v-else>
      <div class="w-full flex flex-row gap-2 items-center">
        <div
          class="ml-auto flex flex-wrap gap-1 w-fit max-sm:max-w-fit overflow-x-auto"
        >
          <NuxtLink
            class="btn btn-ghost btn-sm"
            :href="'/dashboard/servers/' + server.result[0].server_id"
            v-if="
              server.result[0].owner_provider_id ===
              user?.user_metadata.provider_id
            "
          >
            Manage <i class="fa-solid fa-gear"></i>
          </NuxtLink>
          <button
            class="btn btn-ghost btn-sm"
            :class="syncing ? 'btn-disabled' : ''"
            v-if="
              server.result[0].owner_provider_id ===
              user?.user_metadata.provider_id
            "
            @click.stop="syncDiscordServers"
          >
            <span v-if="syncing">Syncing...</span>
            <span v-else>Sync</span>
            <i
              class="fa-solid fa-arrows-rotate"
              :class="syncing ? 'fa-spin' : ''"
            ></i>
          </button>
          <button
            class="btn btn-ghost btn-sm"
            :class="
              server_metadata.bumping || server_metadata.on_cooldown
                ? 'btn-disabled'
                : ''
            "
            v-if="
              server.result[0].owner_provider_id ===
              user?.user_metadata.provider_id
            "
            @click.stop="bump_server"
          >
            <span v-if="server_metadata.on_cooldown">
              {{ formatRemainingTime(server.result[0].bumped_at || 0) }}
            </span>
            <div v-if="!server_metadata.on_cooldown">
              <span v-if="!server_metadata.bumping">Bump </span>
              <span v-else>Bumping... </span>
            </div>
            <i class="fa-solid fa-up-from-line"></i>
          </button>
          <NuxtLink
            :href="'/servers/' + server.result[0].server_id + '/report'"
            class="btn btn-ghost btn-sm"
            v-if="
              server.result[0].owner_provider_id !==
              user?.user_metadata.provider_id
            "
          >
            Report <i class="fa-solid fa-flag"></i>
          </NuxtLink>
          <button class="btn btn-ghost btn-sm" @click="copy_current_url">
            Copy <i class="fa-solid fa-link"></i>
          </button>
        </div>
      </div>
      <div class="flex flex-col py-4">
        <div class="bg-base-200 w-full h-fit p-2 rounded-t-md">
          <div class="flex flex-wrap gap-2 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-full">
              <img
                v-if="server.result[0].icon"
                :src="
                  'https://cdn.discordapp.com/icons/' +
                  server.result[0].server_id +
                  '/' +
                  server.result[0].icon +
                  '.webp?size=96'
                "
                alt="Server Image"
                class="object-cover w-full h-full"
                :class="server.result[0].nsfw ? 'blur-sm' : ''"
              />
              <div
                v-else
                class="h-full flex flex-col items-center rounded-full bg-base-100"
              >
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{
                    server.result[0].server_name?.slice(0, 1).toUpperCase() ||
                    "?"
                  }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-medium text-lg">{{
                server.result[0].server_name
              }}</span>
              <div class="flex flex-wrap gap-1 items-center">
                <div
                  class="bg-primary bg-opacity-50 px-1 rounded-md"
                  v-if="
                    server.result[0].category !== null &&
                    server.result[0].approved_at !== null
                  "
                >
                  <span class="opacity-75">{{
                    server.result[0].category
                  }}</span>
                </div>
                <div class="bg-error bg-opacity-50 px-1 rounded-md" v-else>
                  <span class="opacity-75">Not Approved</span>
                </div>
                <div
                  class="bg-warning bg-opacity-50 px-1 rounded-md"
                  v-if="!server.result[0].public"
                >
                  <span class="opacity-75">Private</span>
                </div>
                <div
                  class="bg-error bg-opacity-50 px-1 rounded-md"
                  v-if="server.result[0].nsfw"
                >
                  <span class="opacity-75">NSFW</span>
                </div>
                <div class="flex flex-row gap-1 items-center">
                  <div class="bg-[#23A55A] h-4 w-4 rounded-full"></div>
                  <p class="opacity-50">
                    {{ server.result[0].approximate_presence_count }}
                    online
                  </p>
                </div>
              </div>
            </div>
            <NuxtLink
              class="btn btn-success text-white rounded-md px-6 ml-auto"
              :href="server.result[0].invite_link || '#'"
              >Join</NuxtLink
            >
          </div>
        </div>
        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col gap-4"
        >
          <div>
            <p class="text-2xl pb-2">Tags</p>

            <div
              class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto"
              v-if="server.result[0].tags?.length"
            >
              <span
                v-for="tag in server.result[0].tags"
                class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
              >
                <span class="text-primary">#</span>
                {{ tag.toLowerCase() }}
              </span>
            </div>
            <p class="opacity-50" v-else>No tags provided</p>
          </div>
          <div>
            <p class="text-2xl pb-2">Description</p>

            <p class="break-words opacity-50">
              {{ server.result[0].description }}
            </p>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div>
        <p class="text-2xl pt-10">Reviews</p>
        <p class="opacity-50">
          No reviews yet...
          <NuxtLink href="#" class="text-primary">Create one!</NuxtLink>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import useClipboard from "~/composables/useClipboard";
const route = useRoute();
const user = useSupabaseUser();
const client = useSupabaseClient();
const server_id = route.params.id;

const syncing = ref<boolean>(false);
const server_metadata = ref<{
  on_cooldown: boolean;
  bumping: boolean;
}>({ on_cooldown: false, bumping: false });

const {
  data: profile,
  refresh: refreshProfile,
  pending: profile_pending,
} = useFetch(`/api/v1/profiles/fetch/${user.value?.user_metadata.provider_id}`);
const {
  data: server,
  refresh: refreshServer,
  pending: server_pending,
} = useFetch(`/api/v1/servers/fetch/${server_id}`);

const copy_current_url = async () => {
  const { toClipboard } = useClipboard();
  toClipboard(window.location.href);
};

onMounted(async () => refreshServerMetadata());
watch(server, () => {
  refreshServerMetadata();
});

const refreshServerMetadata = () => {
  if (server.value !== null) {
    const premium =
      profile.value?.result && profile.value.result[0].premium_since !== null;

    const cooldown = premium ? 3600000 : 7200000;
    const on_cooldown =
      ((server.value.result !== null && server.value.result[0].bumped_at) ||
        0) +
        cooldown <=
      Date.now()
        ? false
        : true;

    server_metadata.value.bumping = false;
    server_metadata.value.on_cooldown = on_cooldown;
  }
};

const syncDiscordServers = async () => {
  syncing.value = true;
  const response = await fetch("/api/v1/servers/sync/" + server_id);
  if (response.status === 401) {
    await client.auth.signOut();
    navigateTo("/login");
  }
  refreshServer();
  syncing.value = false;
};

const bump_server = async () => {
  if (server.value !== null) {
    server_metadata.value.bumping = true;
    const response = await fetch("/api/v1/servers/bump/" + server_id);
    if (response.status === 401) {
      await client.auth.signOut();
      navigateTo("/login");
    }
    server_metadata.value.bumping = false;

    await syncDiscordServers();
  }
};

function formatRemainingTime(bumped_at: number) {
  const premium =
    profile.value?.result && profile.value.result[0].premium_since !== null;

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
