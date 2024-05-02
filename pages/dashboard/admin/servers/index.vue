<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Admin Panel - Servers" class="pb-6">
          <div class="flex flex-row gap-1 ml-auto">
            <button
              class="btn btn-ghost btn-sm"
              :class="refreshing || !lucia?.user ? 'btn-disabled' : ''"
              v-on:click="refresh_servers()"
            >
              <span v-if="refreshing">Refreshing</span>
              <span v-else>Refresh</span>
              <span
                v-if="refreshing"
                class="loading loading-spinner loading-xs"
              ></span>
              <i v-else class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </DashboardMainContentHeader>

        <input
          type="text"
          placeholder="Server ID"
          v-model="id"
          v-on:keydown="handle_event($event)"
          class="input input-bordered rounded-none w-full mb-4"
        />

        <div class="divider">Pending servers</div>
        <ResourcePending v-if="servers_pending" />
        <ResourceNotFound
          v-else-if="!servers?.result"
          :message="servers_error?.data.message"
        />
        <div class="overflow-x-auto" v-else>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner ID</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="server in servers.result.sort(
                  (_server_1, _server_2) =>
                    (_server_1.submitted_at || 0) -
                    (_server_2.submitted_at || 0)
                )"
              >
                <td class="w-52">
                  <NuxtLink :href="'/dashboard/admin/servers/' + server.id">
                    <div class="flex items-center gap-3">
                      <ServerIcon :resource="server" />
                      <div>
                        <span class="font-medium text-lg">{{
                          server.name
                        }}</span>
                      </div>
                    </div>
                  </NuxtLink>
                </td>
                <td>
                  <NuxtLink :href="'/dashboard/admin/users/' + server.owner_id">
                    {{ server.owner_id }}
                  </NuxtLink>
                </td>

                <td>
                  {{ new Date(server.submitted_at || 0).toDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected", "2-only-admin"],
  });
  useHead({
    title: "Dashboard - Admin Panel (Server Management)",
  });

  const lucia = useLucia();
  const refreshing = ref<boolean>(false);

  const id = ref<string>("");

  const navigate_to_server = () => {
    return navigateTo("/dashboard/admin/servers/" + id.value);
  };

  const handle_event = (event: KeyboardEvent) => {
    if (event.code === "Enter") {
      event.preventDefault();
      navigate_to_server();
    }
  };

  const {
    data: servers,
    pending: servers_pending,
    refresh: refresh_servers,
    error: servers_error,
  } = useFetch<{
    message: string | null;
    result: (typeof servers_table.$inferSelect)[] | null;
  }>("/api/v1/admin/servers/pending", { retry: false });
</script>
