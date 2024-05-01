<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Admin Panel" class="pb-6">
          <div class="flex flex-row gap-1 ml-auto">
            <button
              class="btn btn-ghost btn-sm"
              :class="refreshing || !lucia?.user ? 'btn-disabled' : ''"
              v-on:click="refresh_users()"
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

        <ResourcePending v-if="users_pending" />
        <ResourceNotFound v-else-if="!users?.result" :message="users_error" />
        <div class="overflow-x-auto" v-else>
          <table class="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Subscription</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users.result">
                <td>
                  <NuxtLink :href="'/dashboard/admin/users/' + user.id">
                    <div class="flex items-center gap-3 w-52">
                      <UserAvatar :resource="user" />
                      <div>
                        <span class="font-medium text-lg">{{
                          user.username
                        }}</span>
                      </div>
                    </div>
                  </NuxtLink>
                </td>
                <td>
                  {{ user.email }}
                </td>
                <td>
                  <span
                    class="badge badge-accent badge-sm"
                    v-if="user.premium_since"
                    >Premium</span
                  >
                  <span class="badge badge-ghost badge-sm" v-else> None </span>
                </td>
                <td>
                  {{ new Date(user.created_at).toDateString() }}
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
    title: "Dashboard - Admin Panel (User Management)",
  });

  const lucia = useLucia();
  const refreshing = ref<boolean>(false);

  const {
    data: users,
    pending: users_pending,
    refresh: refresh_users,
    error: users_error,
  } = useFetch<{
    message: string | null;
    result: (typeof users_table.$inferSelect)[] | null;
  }>("/api/v1/admin/users", { retry: false });
</script>
