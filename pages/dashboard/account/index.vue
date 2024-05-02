<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="account" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Manage Account" class="pb-6" />

        <DashboardMainStack>
          <DashboardCardContainer>
            <DashboardCardHeader title="Email Preferences" />
            <DashboardCardContent>
              <div class="form-control">
                <label class="label w-fit gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :disabled="true"
                    :checked="true"
                    class="checkbox"
                  />
                  <span class="label-text">Policy changes</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label w-fit gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="true"
                    v-model="monthly_server_reports"
                    class="checkbox"
                  />
                  <span class="label-text">Monthly server reports</span>
                </label>
              </div>
            </DashboardCardContent>
            <DashboardCardSave
              :callback="
                () =>
                  edit('monthly_server_reports', {
                    monthly_server_reports,
                  })
              "
              :matches="
                () =>
                  lucia?.user.monthly_server_reports === monthly_server_reports
              "
            />
          </DashboardCardContainer>
        </DashboardMainStack>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected"],
  });
  useHead({
    title: "Dashboard - Account",
  });

  const lucia = useLucia();
  const is_public = ref<boolean | null>(null);
  const monthly_server_reports = ref<boolean | null>(null);

  const edit = async (name: string, data: Record<string, any>) => {
    const response = await fetch(`/api/v1/users/me/account/${name}`, {
      method: "PATCH",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify(data),
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
      useNuxtApp().$toast.success("Your changes have been saved");
      const data: any = await useRequestFetch()("/api/v1/auth/information");
      if (data) {
        lucia.value = data;
      } else lucia.value = null;
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
  };

  onMounted(() => {
    is_public.value = lucia.value?.user.public!;
    monthly_server_reports.value = lucia.value?.user.monthly_server_reports!;
  });
</script>
