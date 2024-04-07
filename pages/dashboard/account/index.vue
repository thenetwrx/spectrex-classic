<template>
  <div class="container max-w-6xl mx-auto pt-32 min-h-screen px-4">
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-row items-center gap-2">
        <div class="w-16 h-16 overflow-hidden rounded-full">
          <div class="avatar" v-if="lucia?.user?.avatar">
            <div class="rounded-full w-full">
              <NuxtImg
                alt="User Image"
                :src="
                  discordCdn.user_avatar(
                    lucia.user.discord_id,
                    lucia.user.avatar
                  )
                "
              />
            </div>
          </div>
          <div class="h-full" v-else>
            <div class="rounded-full w-full h-full bg-secondary flex flex-col">
              <span class="text-xl opacity-50 m-auto">{{
                lucia?.user?.global_name?.slice(0, 2).toUpperCase() || "?"
              }}</span>
            </div>
          </div>
        </div>
        <div>
          <h2 class="text-lg">
            Welcome back,
            <span
              :class="
                lucia?.user?.premium_since !== null ? 'text-[#ffbf28]' : ''
              "
            >
              <i
                class="fa-solid fa-crown"
                v-if="lucia?.user?.premium_since !== null ? true : false"
              ></i>
              {{
                lucia?.user?.global_name || lucia?.user?.username || "Unknown"
              }}
            </span>
          </h2>
          <p class="opacity-30">
            Logged in at: {{ formatDateString(lucia?.session?.created_at!) }}
          </p>
        </div>
      </div>
    </div>
    <h2 class="text-lg font-semibold">Dashboard</h2>
    <div class="divider"></div>
    <div class="flex flex-row max-md:flex-col gap-2 w-full py-4">
      <div class="flex flex-col gap-1 w-full md:max-w-xs">
        <NuxtLink
          class="hover:bg-base-200 rounded-md p-2 opacity-75"
          href="/dashboard"
        >
          Servers
        </NuxtLink>
        <NuxtLink class="bg-base-200 rounded-md p-2" href="/dashboard/account">
          Account
        </NuxtLink>
      </div>
      <div class="w-full px-2">
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
          <div class="bg-base-200 w-full p-4 flex flex-col rounded-md">
            <p class="text-xl">Premium</p>

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
              :class="lucia?.user?.premium_since !== null ? 'btn-disabled' : ''"
            >
              Buy Now
            </NuxtLink>
          </div>

          <div class="bg-base-200 w-full p-4 flex flex-col rounded-md">
            <p class="text-xl">Publicly Listed</p>

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

            <button
              v-on:click="edit(is_public!, lucia?.user?.description!)"
              class="btn btn-primary btn-sm mt-auto ml-auto"
            >
              Save
            </button>
          </div>

          <div class="bg-base-200 w-full p-4 flex flex-col rounded-md">
            <p class="text-2xl pb-2">Description</p>

            <textarea
              type="text"
              placeholder="A very interesting person..."
              v-model="description"
              class="textarea textarea-bordered rounded-none w-full mb-2"
            ></textarea>

            <button
              v-on:click="edit(lucia?.user?.public!, description!)"
              class="btn btn-primary btn-sm mt-auto ml-auto"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
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

  const edit = async (_public: boolean, _description: string) => {
    const response = await fetch(`/api/v1/users/me/edit`, {
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        public: _public,
        description: _description,
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

    if (response.ok) return alert("Changes have been saved");
    else {
      const json = await response.json();
      return alert(json.message);
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
