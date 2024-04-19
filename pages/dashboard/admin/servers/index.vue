<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Admin Panel (Server Management)</h2>

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
        </div>

        <ResourcePending v-if="servers_pending" />
        <ResourceNotFound
          v-else-if="!servers?.result"
          :message="servers_error"
        />
        <div class="overflow-x-auto" v-else>
          <table class="table">
            <!-- head -->
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner ID</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <!-- row 1 -->
              <tr v-for="server in servers.result">
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
                  {{ new Date(Number(server.created_at)).toDateString() }}
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

  const {
    data: servers,
    pending: servers_pending,
    refresh: refresh_servers,
    error: servers_error,
  } = useFetch<{
    message: string | null;
    result: (typeof servers_table.$inferSelect)[] | null;
  }>("/api/v1/admin/servers", { retry: false });
</script>
