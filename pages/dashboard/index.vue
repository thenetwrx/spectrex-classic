<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Manage Servers</h2>
          <button
            class="btn btn-ghost btn-sm ml-auto"
            :class="syncing ? 'btn-disabled' : ''"
            v-on:click="syncDiscordServers"
          >
            <span v-if="syncing">Syncing</span>
            <span v-else>Sync</span>
            <i
              class="fa-solid fa-arrows-rotate"
              :class="syncing ? 'fa-spin' : ''"
            ></i>
          </button>
        </div>

        <ResourcePending v-if="servers_pending" />
        <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-3" v-else>
          <NuxtLink
            v-for="(server, index) in servers?.result
              ?.filter((server) => server.approved_at !== null)
              .sort((a, b) => a.name.localeCompare(b.name))
              .sort(
                (c, d) => Number(c.bumped_at || 0) - Number(d.bumped_at || 0)
              )"
            :key="index"
            class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
            :href="'/dashboard/servers/' + server.id"
          >
            <div class="flex flex-row items-center w-full">
              <div class="flex flex-col w-full">
                <div class="w-16 h-16 overflow-hidden rounded-lg">
                  <div class="avatar" v-if="server.icon">
                    <div class="rounded-full w-full">
                      <NuxtImg
                        alt="Server Image"
                        :src="
                          discordCdn.server_icon(
                            server.provider_id,
                            server.icon
                          )
                        "
                      />
                    </div>
                  </div>
                  <div class="h-full" v-else>
                    <div
                      class="rounded-full w-full h-full bg-secondary flex flex-col"
                    >
                      <span class="text-xl opacity-50 m-auto">{{
                        server.name.slice(0, 2).toUpperCase()
                      }}</span>
                    </div>
                  </div>
                </div>
                <span class="font-medium text-lg">{{ server.name }}</span>
              </div>

              <div>
                <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
              </div>
              <!-- Server Details -->
            </div>
          </NuxtLink>
          <div
            class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
            v-on:click="
              () => {
                if (!servers?.result?.length) syncDiscordServers();
              }
            "
            onclick="my_modal_1.showModal()"
          >
            <div class="w-full h-full flex justify-center items-center py-10">
              <i class="fa-solid fa-plus fa-2xl"></i>
            </div>
          </div>
        </div>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
  <dialog class="modal" id="my_modal_1">
    <div class="modal-box bg-base-200">
      <div class="flex flex-row gap-1 items-center w-full pb-4">
        <h3 class="text-lg font-bold">Add server</h3>
        <button
          class="btn btn-ghost btn-sm ml-auto"
          :class="syncing ? 'btn-disabled' : ''"
          v-on:click="syncDiscordServers"
        >
          <span v-if="syncing">Syncing</span>
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
        v-on:change="((event:any) => navigateTo(event?.target?.value || '/'))"
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
  import type Server from "~/types/Server";

  definePageMeta({
    middleware: ["1-protected"],
  });
  useHead({
    title: "Dashboard",
  });
  const lucia = useLucia();
  const discordCdn = useDiscordCdn();
  const syncing = ref<boolean>(false);

  const {
    data: servers,
    pending: servers_pending,
    refresh: refreshServers,
  } = useFetch<{ message: string | null; result: Server[] | null }>(
    "/api/v1/servers/all",
    { retry: false }
  );

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

    refreshServers();
    syncing.value = false;
  };

  function formatDateString(dynamicString: string) {
    const date = new Date(Number(dynamicString));

    return date ? date.toString() : "Unknown";
  }
</script>
