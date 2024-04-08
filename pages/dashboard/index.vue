<template>
  <div class="container max-w-6xl mx-auto pt-32 min-h-screen px-4">
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-row items-center gap-2">
        <div class="w-16 h-16 overflow-hidden rounded-full">
          <div class="avatar" v-if="lucia?.user?.avatar">
            <div class="rounded-full w-full">
              <NuxtImg
                alt="User Image"
                :src="
                  discordCdn.user_avatar(
                    lucia.user.discord_id,
                    lucia.user.avatar
                  )
                "
              />
            </div>
          </div>
          <div class="h-full" v-else>
            <div class="rounded-full w-full h-full bg-secondary flex flex-col">
              <span class="text-xl opacity-50 m-auto">{{
                lucia?.user?.global_name?.slice(0, 2).toUpperCase() || "?"
              }}</span>
            </div>
          </div>
        </div>
        <div>
          <h2 class="text-lg">
            Welcome back,
            <span
              :class="
                lucia?.user?.premium_since !== null ? 'text-[#ffbf28]' : ''
              "
            >
              <i
                class="fa-solid fa-crown"
                v-if="lucia?.user?.premium_since !== null ? true : false"
              ></i>
              {{
                lucia?.user?.global_name || lucia?.user?.username || "Unknown"
              }}
            </span>
          </h2>
          <p class="opacity-30">
            Logged in at: {{ formatDateString(lucia?.session?.created_at!) }}
          </p>
        </div>
      </div>
    </div>
    <h2 class="text-lg font-semibold">Dashboard</h2>
    <div class="divider"></div>
    <div class="flex flex-row max-md:flex-col gap-2 w-full py-4">
      <div class="flex flex-col gap-1 w-full md:max-w-xs">
        <NuxtLink class="bg-base-200 rounded-md p-2" href="/dashboard">
          Servers
        </NuxtLink>
        <NuxtLink
          class="hover:bg-base-200 rounded-md p-2 opacity-75"
          href="/dashboard/account"
        >
          Account
        </NuxtLink>
      </div>
      <div class="w-full px-2">
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

        <div class="w-full text-center my-16" v-if="servers_pending">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
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
              <!-- Added relative positioning -->
              <!-- Server Image -->
              <div class="flex flex-col w-full">
                <div class="w-16 h-16 overflow-hidden rounded-lg">
                  <div class="avatar" v-if="server.icon">
                    <div class="rounded-full w-full">
                      <NuxtImg
                        alt="Server Image"
                        :src="
                          discordCdn.server_icon(server.discord_id, server.icon)
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
      </div>
    </div>
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
  </div>
</template>

<script setup lang="ts">
  import type Server from "~/types/Server";

  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const discordCdn = useDiscordCdn();
  const syncing = ref<boolean>(false);

  const {
    data: servers,
    pending: servers_pending,
    refresh: refreshServers,
  } = useFetch<{ message: string | null; result: Server[] | null }>(
    "/api/v1/servers/all/fetch",
    { retry: false }
  );

  const syncDiscordServers = async () => {
    syncing.value = true;
    const response = await fetch("/api/v1/servers/all/sync");
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
