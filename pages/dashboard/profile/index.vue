<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="profile" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Manage Profile</h2>

          <div class="flex flex-row gap-1 ml-auto">
            <NuxtLink
              class="btn btn-ghost btn-sm"
              :class="!lucia?.user ? 'btn-disabled' : ''"
              :href="'/users/' + lucia?.user.id"
            >
              View
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </NuxtLink>
            <button
              class="btn btn-ghost btn-sm"
              :class="syncing || !lucia?.user ? 'btn-disabled' : ''"
              v-on:click="sync"
            >
              <span v-if="syncing">Syncing</span>
              <span v-else>Sync</span>
              <span
                v-if="syncing"
                class="loading loading-spinner loading-xs"
              ></span>
              <i v-else class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">Public</p>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div class="flex flex-col">
                <div class="form-control items-start">
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="radio-is_public"
                      class="radio"
                      v-model="is_public"
                      :value="true"
                    />
                    <span class="label-text">Yes</span>
                  </label>
                </div>
                <div class="form-control items-start">
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="radio-is_public"
                      class="radio"
                      v-model="is_public"
                      :value="false"
                    />
                    <span class="label-text">No</span>
                  </label>
                </div>
              </div>
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">Description</p>
            </DashboardCardHeader>
            <DashboardCardContent>
              <textarea
                type="text"
                placeholder="A very interesting person..."
                v-model="description"
                class="textarea textarea-bordered rounded-none w-full"
              ></textarea>
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
    title: "Dashboard - Profile",
  });

  const lucia = useLucia();
  const syncing = ref<boolean>(false);
  const is_public = ref<boolean | null>(null);
  const description = ref<string | null>(null);

  const sync = async () => {
    syncing.value = true;
    const response = await fetch("/api/v1/users/me/profile/sync", {
      method: "PATCH",
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
      alert("Profile synced with Discord");
      const data = await useRequestFetch()("/api/v1/auth/information");
      if (data) {
        lucia.value = data as any;
      } else lucia.value = null;
    } else {
      const json = await response.json();
      alert(json.message);
    }
    syncing.value = false;
  };

  const edit = async () => {
    const response = await fetch("/api/v1/users/me/profile", {
      method: "PATCH",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        public: is_public.value,
        description: description.value,
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
    description.value = lucia.value?.user.description!;
  });
</script>
