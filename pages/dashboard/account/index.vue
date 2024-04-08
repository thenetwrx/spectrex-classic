<template>
  <div class="container max-w-6xl mx-auto pt-32 min-h-screen px-4">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="account" />
      <DashboardMainContent>
        <div class="flex flex-row items-center pb-6">
          <h2 class="text-lg font-semibold">Manage Account</h2>
          <button
            class="btn btn-ghost btn-sm ml-auto"
            :class="syncing ? 'btn-disabled' : ''"
            v-on:click="syncMe"
          >
            <span v-if="syncing">Syncing</span>
            <span v-else>Sync</span>
            <i
              class="fa-solid fa-arrows-rotate"
              :class="syncing ? 'fa-spin' : ''"
            ></i>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <DashboardCardContainer>
            <DashboardCardTitle>
              <p class="text-xl">Premium</p>
            </DashboardCardTitle>
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
            <DashboardCardTitle>
              <p class="text-xl">Profile Public</p>
            </DashboardCardTitle>
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
            <DashboardCardTitle>
              <p class="text-xl">Profile Description</p>
            </DashboardCardTitle>
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
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const discordCdn = useDiscordCdn();
  const syncing = ref<boolean>(false);
  const is_public = ref<boolean | null>(null);
  const description = ref<string | null>(null);

  const syncMe = async () => {
    syncing.value = true;
    const response = await fetch("/api/v1/users/me/sync");
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
    const response = await fetch(`/api/v1/users/me/edit`, {
      method: "POST",
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
