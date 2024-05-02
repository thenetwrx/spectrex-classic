<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Admin Panel - Servers">
          <div class="flex flex-row gap-1 ml-auto">
            <NuxtLink
              class="btn btn-ghost btn-sm"
              href="/dashboard/admin/servers"
            >
              <span>Back</span>
              <i class="fa-solid fa-arrow-left"></i>
            </NuxtLink>
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
          <div class="divider">Meta</div>
          <h2 class="text-xl">Status</h2>
          <p class="opacity-75">
            {{ server.result.banned ? "Is Banned" : "Not Banned" }}
          </p>
          <p class="opacity-75">
            {{ server.result.pending ? "Is Pending" : "Not Pending" }}
          </p>
          <p class="opacity-75">
            {{ server.result.approved_at ? "Is Approved" : "Not Approved" }}
          </p>
          <p class="opacity-75">
            {{ server.result.rejected ? "Is Rejected" : "Not Rejected" }}
          </p>
          <p class="opacity-75">
            {{ server.result.nsfw ? "Is NSFW" : "Not NSFW" }}
          </p>
          <p class="opacity-75">
            {{ server.result.public ? "Is Public" : "Not Public" }}
          </p>

          <h2 class="text-xl">Member count</h2>
          <p class="opacity-75">
            {{ server.result.approximate_member_count }} total,
            {{ server.result.approximate_presence_count }} online
          </p>
          <h2 class="text-xl">Description</h2>
          <textarea
            class="textarea h-48"
            :value="server.result.description"
            :disabled="true"
          ></textarea>
          <h2 class="text-xl">Tags</h2>
          <p class="opacity-75">
            {{ server.result.tags.join(", ") || "No tags" }}
          </p>
          <div class="divider">Actions</div>
          <NuxtLink
            class="btn btn-sm btn-primary w-fit mb-4"
            :href="'/dashboard/admin/users/' + server.result.owner_id"
            target="_blank"
            >View Owner</NuxtLink
          >
          <button class="btn btn-sm btn-success w-fit" v-on:click="accept">
            Accept
          </button>
          <button class="btn btn-sm btn-warning w-fit" v-on:click="reject">
            Reject
          </button>
          <button class="btn btn-sm btn-error w-fit mt-4" v-on:click="ban">
            Ban
          </button>
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

  const {
    data: server,
    pending: server_pending,
    refresh: refresh_server,
    error: server_error,
  } = useFetch<{
    message: string | null;
    result: typeof servers_table.$inferSelect | null;
  }>(`/api/v1/admin/servers/${server_id}`, { retry: false });

  const accept = async () => {
    const response = await fetch(`/api/v1/admin/servers/${server_id}/accept`, {
      method: "POST",
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
      await refresh_server();
      useNuxtApp().$toast.info("Accepted server");
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
  };

  const reject = async () => {
    const response = await fetch(`/api/v1/admin/servers/${server_id}/reject`, {
      method: "POST",
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
      await refresh_server();
      useNuxtApp().$toast.info("Rejected server");
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
  };

  const ban = async () => {
    const response = await fetch(`/api/v1/admin/servers/${server_id}/ban`, {
      method: "POST",
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
      await refresh_server();
      useNuxtApp().$toast.info("Banned server");
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
  };
</script>
