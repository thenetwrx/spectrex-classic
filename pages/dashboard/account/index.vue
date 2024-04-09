<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="account" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Manage Account</h2>

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
              <i
                class="fa-solid fa-arrows-rotate"
                :class="syncing ? 'fa-spin' : ''"
              ></i>
            </button>
          </div>
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
              <p class="text-xl">Profile Public</p>
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
              <p class="text-xl">Profile Description</p>
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
    title: "Dashboard - Account",
  });

  const lucia = useLucia();
  const syncing = ref<boolean>(false);
  const is_public = ref<boolean | null>(null);
  const description = ref<string | null>(null);

  const sync = async () => {
    syncing.value = true;
    const response = await fetch("/api/v1/users/me/sync", { method: "PATCH" });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    refreshNuxtData("lucia");
    syncing.value = false;
  };

  const edit = async () => {
    const response = await fetch(`/api/v1/users/me`, {
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

    if (response.ok) alert("Changes have been saved");
    else {
      const json = await response.json();
      alert(json.message);
    }
  };

  onMounted(() => {
    is_public.value = lucia.value?.user.public!;
    description.value = lucia.value?.user.description!;
  });

  function formatDateString(dynamicString: string) {
    const date = new Date(Number(dynamicString));

    return date ? date.toString() : "Unknown";
  }
</script>
