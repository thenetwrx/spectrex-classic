<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <div
          class="flex flex-row sm:items-center w-full max-sm:flex-col-reverse max-sm:gap-2"
        >
          <h2 class="text-lg font-semibold">Admin Panel (User Management)</h2>

          <div class="flex flex-row gap-1 ml-auto">
            <button
              class="btn btn-ghost btn-sm"
              :class="refreshing || !lucia?.user ? 'btn-disabled' : ''"
              v-on:click="refresh_user()"
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

        <ResourcePending v-if="user_pending" />
        <ResourceNotFound
          v-else-if="!user?.result"
          :message="user_error?.data.message"
        />
        <div class="flex flex-col gap-2" v-else>
          <p class="opacity-75 pb-6">
            {{ user.result.username }}
          </p>
          <p>Actions</p>
          <button class="btn btn-sm btn-primary w-fit">Set Premium</button>
          <button class="btn btn-sm btn-primary w-fit">Set Public</button>
          <button class="btn btn-sm btn-primary w-fit">Set Admin</button>
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
    title: "Dashboard - Admin Panel (User Management)",
  });

  const route = useRoute();
  const user_id = route.params.id;

  const lucia = useLucia();
  const refreshing = ref<boolean>(false);

  const {
    data: user,
    pending: user_pending,
    refresh: refresh_user,
    error: user_error,
  } = useFetch<{
    message: string | null;
    result: typeof users_table.$inferSelect | null;
  }>(`/api/v1/admin/users/${user_id}`, { retry: false });
</script>
