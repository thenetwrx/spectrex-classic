<template>
  <div class="container max-w-4xl mx-auto px-4 pt-32 min-h-screen">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <img
          :src="
            discordCdn.user_avatar(user?.discord_id!, user?.avatar!)
          "
          alt="User Avatar"
          class="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2
            class="text-lg"
            :class="user?.premium_since !== null ? 'text-[#ffbf28]' : ''"
          >
            <i
              class="fa-solid fa-crown"
              v-if="user?.premium_since !== null ? true : false"
            ></i>
            {{ user?.global_name || user?.username }}
          </h2>
          <p class="text-gray-500">@{{ user?.username }}</p>
        </div>
      </div>
    </div>

    <!-- Server List -->
    <div class="flex flex-row items-center">
      <h2 class="text-lg font-semibold">Your servers</h2>
      <button
        class="btn btn-ghost btn-sm ml-auto"
        :class="syncing ? 'btn-disabled' : ''"
        @click.stop="syncDiscordServers"
      >
        <span v-if="syncing">Syncing...</span>
        <span v-else>Sync</span>
        <i
          class="fa-solid fa-arrows-rotate"
          :class="syncing ? 'fa-spin' : ''"
        ></i>
      </button>
    </div>
    <div class="divider"></div>
    <div class="w-full text-center my-16" v-if="servers_pending">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <ul class="grid md:grid-cols-1 lg:grid-cols-2 gap-3" v-else>
      <li
        v-for="(server, index) in servers?.result
          ?.filter((server) => server.approved_at !== null)
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((c, d) => Number(c.bumped_at || 0) - Number(d.bumped_at || 0))"
        :key="index"
        class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
        @click="navigateTo('/servers/' + server.discord_id)"
      >
        <div class="flex flex-row items-center w-full">
          <!-- Added relative positioning -->
          <!-- Server Image -->
          <div class="flex flex-col w-full">
            <div class="w-16 h-16 overflow-hidden rounded-lg">
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
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{ server.name.slice(0, 1).toUpperCase() || "?" }}
                </p>
              </div>
            </div>
            <span class="font-medium text-lg">{{ server.name }}</span>
          </div>

          <div>
            <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
          </div>
          <!-- Server Details -->
        </div>
      </li>
      <li
        class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
        @click="syncDiscordServers"
        onclick="my_modal_1.showModal()"
      >
        <div class="w-full h-full flex justify-center items-center py-10">
          <i class="fa-solid fa-plus fa-2xl"></i>
        </div>
      </li>
    </ul>
  </div>
  <dialog class="modal" id="my_modal_1">
    <div class="modal-box bg-base-200">
      <div class="flex flex-row gap-1 items-center w-full pb-4">
        <h3 class="text-lg font-bold">Add server</h3>
        <button
          class="btn btn-ghost btn-sm ml-auto"
          :class="syncing ? 'btn-disabled' : ''"
          @click.stop="syncDiscordServers"
        >
          <span v-if="syncing">Syncing...</span>
          <span v-else>Sync</span>
          <i
            class="fa-solid fa-arrows-rotate"
            :class="syncing ? 'fa-spin' : ''"
          ></i>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="my_modal_1.close()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <select
        class="select select-bordered rounded-none w-full"
        @change="((event:any) => navigateTo(event?.target?.value || '/'))"
      >
        <option disabled selected>Select server</option>
        <option
          v-for="server in servers?.result
            ?.filter((server) => server.approved_at === null)
            .sort((a, b) => a.name.localeCompare(b.name))"
          :value="'/dashboard/servers/' + server.discord_id + '/add'"
        >
          {{ server.name }}
        </option>
      </select>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import type Server from "~/types/Server";

definePageMeta({
  middleware: ["1-protected"],
});
const discordCdn = useDiscordCdn();
const user = useUser();
const syncing = ref<boolean>(false);

const {
  data: servers,
  pending: servers_pending,
  refresh: refreshServers,
} = useFetch<{ message: string | null; result: Server[] | null }>(
  "/api/v1/servers/fetch/all",
  { retry: false }
);

const syncDiscordServers = async () => {
  syncing.value = true;
  const response = await fetch("/api/v1/servers/sync");
  if (response.status === 401) {
    await $fetch("/api/v1/auth/logout", {
      method: "POST",
      retry: false,
    });
    user.value = null;
    await navigateTo("/");
  }
  refreshServers();
  syncing.value = false;
};
</script>
