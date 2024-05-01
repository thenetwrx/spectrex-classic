<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <div class="flex flex-row items-center">
          <h2 class="text-lg font-semibold">Manage Servers</h2>
          <button
            class="btn btn-ghost btn-sm ml-auto"
            :class="syncing ? 'btn-disabled' : ''"
            v-on:click="syncDiscordServers"
          >
            <span v-if="syncing">Syncing</span>
            <span v-else>Sync</span>
            <span
              v-if="syncing"
              class="loading loading-spinner loading-xs"
            ></span>
            <i v-else class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>

        <p class="opacity-75 pb-6">
          Want quick access to bumping your Discord server?
          <NuxtLink
            class="text-accent hover:underline"
            :href="discord.invite.bot()"
            >Add the Discord bot!</NuxtLink
          >
        </p>
        <ResourcePending v-if="servers_pending" />
        <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-3" v-else>
          <NuxtLink
            v-for="(server, index) in servers?.result
              ?.filter((server) => server.approved_at !== null)
              .sort((a, b) => a.name.localeCompare(b.name))
              .sort((c, d) => c.bumped_at! - d.bumped_at!)"
            :key="index"
            class="flex flex-row bg-base-200 hover:bg-base-300 border border-secondary rounded-md cursor-pointer transition-colors duration-200 p-4"
            :href="'/dashboard/servers/' + server.id"
          >
            <div class="flex flex-row items-center w-full">
              <div class="flex flex-col w-full">
                <ServerIcon :resource="server" />
                <span class="font-medium text-lg">{{ server.name }}</span>
              </div>

              <div>
                <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
              </div>
            </div>
          </NuxtLink>
          <div
            class="flex flex-row bg-base-200 hover:bg-base-300 border border-secondary rounded-md cursor-pointer transition-colors duration-200 p-4"
            v-on:click="
              () => {
                if (!servers?.result?.length) syncDiscordServers();
              }
            "
            onclick="modal.showModal()"
          >
            <div class="w-full h-full flex justify-center items-center py-10">
              <i class="fa-solid fa-plus fa-2xl"></i>
            </div>
          </div>
        </div>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
  <dialog class="modal" id="modal">
    <div class="modal-box bg-base-200 border border-secondary">
      <div class="flex flex-row gap-1 items-center w-full">
        <h3 class="text-lg font-bold">Add server</h3>
        <button
          class="btn btn-ghost btn-sm ml-auto"
          :class="syncing ? 'btn-disabled' : ''"
          v-on:click="syncDiscordServers"
        >
          <span v-if="syncing">Syncing</span>
          <span v-else>Sync</span>
          <span
            v-if="syncing"
            class="loading loading-spinner loading-xs"
          ></span>
          <i v-else class="fa-solid fa-arrows-rotate"></i>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="modal.close()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <p class="opacity-75 text-sm py-2">
        Not seeing a server? Your Discord account has to be the owner of it
        before you can add it.
      </p>
      <select
        class="select select-bordered rounded-none w-full"
        v-on:change="(event) => {
          const target = event.target as HTMLSelectElement;
          navigateTo(target?.value || '/')
        }"
      >
        <option disabled selected>Select server</option>
        <option
          v-for="server in servers?.result
            ?.filter((server) => server.approved_at === null)
            .sort((a, b) => a.name.localeCompare(b.name))"
          :value="'/dashboard/servers/' + server.id + '/add'"
        >
          {{ server.name }}
        </option>
      </select>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected"],
  });
  useHead({
    title: "Dashboard",
  });
  const lucia = useLucia();
  const discord = useDiscord();
  const syncing = ref<boolean>(false);

  const {
    data: servers,
    pending: servers_pending,
    refresh: refresh_servers,
  } = useFetch<{
    message: string | null;
    result: (typeof servers_table.$inferSelect)[] | null;
  }>("/api/v1/servers/all", { retry: false });

  const syncDiscordServers = async () => {
    syncing.value = true;
    const response = await fetch("/api/v1/servers/all/sync", {
      method: "PATCH",
    });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    if (response.ok) {
      await refresh_servers();
      useNuxtApp().$toast.info("Your servers have been synced with Discord");
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
    syncing.value = false;
  };
</script>
