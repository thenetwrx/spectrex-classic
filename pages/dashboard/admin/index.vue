<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="admin" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Admin Panel</h2>
        </div>

        <div class="flex flex-col gap-2">
          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">Testing</p>
            </DashboardCardHeader>
            <DashboardCardContent>
              <p class="opacity-75">Test</p>
            </DashboardCardContent>
          </DashboardCardContainer>
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
    title: "Dashboard - Admin",
  });

  const lucia = useLucia();
</script>
