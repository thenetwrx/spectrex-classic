<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Admin Panel (Server Management)">
          <div class="flex flex-row gap-1 ml-auto">
            <button
              class="btn btn-ghost btn-sm"
              :class="refreshing || !lucia?.user ? 'btn-disabled' : ''"
              v-on:click="refresh_server()"
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

        <ResourcePending v-if="server_pending" />
        <ResourceNotFound
          v-else-if="!server?.result"
          :message="server_error?.data?.message"
        />
        <div class="flex flex-col gap-2" v-else>
          <p class="opacity-75 pb-6">
            {{ server.result.name }}
          </p>
          <p>Actions</p>
          <button class="btn btn-sm btn-primary w-fit">Set Public</button>
          <button class="btn btn-sm btn-error w-fit">Ban</button>
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

  const route = useRoute();
  const server_id = route.params.id;

  const lucia = useLucia();
  const refreshing = ref<boolean>(false);

  const {
    data: server,
    pending: server_pending,
    refresh: refresh_server,
    error: server_error,
  } = useFetch<{
    message: string | null;
    result: typeof servers_table.$inferSelect | null;
  }>(`/api/v1/admin/servers/${server_id}`, { retry: false });
</script>
