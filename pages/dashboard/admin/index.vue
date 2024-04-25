<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Admin Panel" class="pb-6" />

        <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-3">
          <NuxtLink
            class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
            href="/dashboard/admin/servers"
          >
            <div class="flex flex-row items-center w-full">
              <div class="flex flex-col w-full">
                <span class="font-medium text-lg">Server Management</span>
              </div>

              <div>
                <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
              </div>
              <!-- Server Details -->
            </div>
          </NuxtLink>
          <NuxtLink
            class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
            href="/dashboard/admin/users"
          >
            <div class="flex flex-row items-center w-full">
              <div class="flex flex-col w-full">
                <span class="font-medium text-lg">User Management</span>
              </div>

              <div>
                <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
              </div>
              <!-- Server Details -->
            </div>
          </NuxtLink>
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
    title: "Dashboard - Admin Panel",
  });
</script>
