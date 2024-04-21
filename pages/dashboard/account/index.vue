<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="account" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Manage Account</h2>
        </div>

        <div class="flex flex-col gap-2">
          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">Premium</p>
            </DashboardCardHeader>
            <DashboardCardContent>
              <p class="opacity-75" v-if="lucia?.user?.premium_since !== null">
                Thanks for being a Spectrex Supporter. You have
                <span class="font-bold">exclusive benefits</span>!
              </p>
              <p class="opacity-75" v-else>
                Not found. You're missing out on
                <span class="font-bold">exclusive benefits</span>!
              </p>

              <NuxtLink
                href="/premium"
                class="btn btn-primary btn-sm mt-auto ml-auto"
                :class="
                  lucia?.user?.premium_since !== null ? 'btn-disabled' : ''
                "
              >
                Buy Now
              </NuxtLink>
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">Email Preferences</p>
            </DashboardCardHeader>
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
          </DashboardCardContainer>

          <button v-on:click="edit" class="btn btn-primary btn-sm my-6 ml-auto">
            Save Changes
          </button>
        </div>
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

  const edit = async () => {
    const response = await fetch("/api/v1/users/me/account", {
      method: "PATCH",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        monthly_server_reports: monthly_server_reports.value,
      }),
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
      alert("Changes have been saved");
      const data = await useRequestFetch()("/api/v1/auth/information");
      if (data) {
        lucia.value = data as any;
      } else lucia.value = null;
    } else {
      const json = await response.json();
      alert(json.message);
    }
  };

  onMounted(() => {
    is_public.value = lucia.value?.user.public!;
    monthly_server_reports.value = lucia.value?.user.monthly_server_reports!;
  });
</script>
