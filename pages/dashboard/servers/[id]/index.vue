<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Manage Server">
          <DashboardMainContentHeaderButtons>
            <ClientOnly>
              <button
                class="btn btn-ghost btn-sm"
                :class="
                  !server?.result || bump.pending || bump.on_cooldown
                    ? 'btn-disabled'
                    : ''
                "
                v-on:click="_bump"
              >
                <span v-if="bump.pending">Bumping</span>
                <span v-else>
                  <template v-if="!bump.on_cooldown">Bump</template>
                  <template v-else>
                    {{
                      formatDistance(
                        new Date(),
                        new Date(
                          server?.result?.bumped_at! +
                            (lucia?.user.premium_since ? 3600000 : 7200000)
                        )
                      )
                    }}
                  </template>
                </span>
                <i class="fa-solid fa-up-from-line"></i>
              </button>
            </ClientOnly>

            <NuxtLink
              class="btn btn-ghost btn-sm"
              :class="!server?.result ? 'btn-disabled' : ''"
              :href="'/servers/' + server?.result?.id"
            >
              View
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </NuxtLink>
            <button
              class="btn btn-ghost btn-sm"
              :class="syncing || !server?.result ? 'btn-disabled' : ''"
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
          </DashboardMainContentHeaderButtons>
        </DashboardMainContentHeader>

        <ResourcePending v-if="server_pending" />
        <ResourceNotFound
          v-else-if="!server?.result"
          :message="server_error?.data.message"
        />
        <ResourceNotFound
          v-else-if="server.result.owner_id !== lucia?.user?.id"
          message="Unauthorized"
        />
        <template v-else>
          <p class="opacity-75 pb-6">
            {{ server.result.name }} with
            {{ server.result.approximate_member_count }} members
          </p>

          <DashboardMainStack>
            <div
              class="alert bg-accent flex items-start flex-row max-md:flex-col bg-opacity-50 text-opacity-75 rounded-md"
            >
              <p class="max-w-lg">
                <i class="fa-solid fa-circle-info px-2"></i>
                <span v-if="server.result.invite_uses !== null">
                  {{ server.result.invite_uses.length }} people have used your
                  invite!</span
                >
                <span v-else>
                  <i class="fa-solid fa-circle-info px-2"></i>
                  Want analytics on your invite's usage? Check out our
                  <NuxtLink
                    href="/pricing?utm_source=dashboard&utm_medium=direct&utm_campaign=analytics"
                    class="underline"
                    >Pricing</NuxtLink
                  >!
                </span>
              </p>
            </div>

            <DashboardCardContainer>
              <DashboardCardHeader
                title="Public"
                :required="true"
                message="(whether or not this server will be publicly listed)"
              />
              <DashboardCardContent>
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
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('public', { public: is_public })"
                :matches="() => server?.result?.public === is_public"
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <DashboardCardHeader title="Language" :required="true" />
              <DashboardCardContent>
                <select
                  v-model="language"
                  class="select select-bordered rounded-none w-full"
                >
                  <option disabled selected value="">Select language</option>
                  <option value="unspecified">Unspecified</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="it">Italiano</option>
                  <option value="ja">日本語</option>
                  <option value="ru">русский</option>
                </select>
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('language', { language })"
                :matches="() => server?.result?.language === language"
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <DashboardCardHeader title="Category" :required="true" />
              <DashboardCardContent>
                <select
                  v-model="category"
                  class="select select-bordered rounded-none w-full"
                >
                  <option disabled selected value="">Select category</option>
                  <option value="Community">Community</option>
                  <option value="Music">Music</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Anime">Anime</option>
                  <option value="Technology">Technology</option>
                  <option value="Movies">Movies</option>
                  <option value="Other">Other</option>
                </select>
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('category', { category })"
                :matches="() => server?.result?.category === category"
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <DashboardCardHeader title="Tags" />
              <DashboardCardContent>
                <div
                  class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto mb-2"
                  v-if="tags.length"
                >
                  <span
                    v-for="(tag, index) in tags"
                    :key="index"
                    class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
                    v-on:click="removeTag(index)"
                  >
                    <i class="fa-solid fa-square-xmark fa-lg mr-2"></i>
                    <span class="text-accent">#</span>
                    {{ tag }}
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Press enter or comma to create tag"
                  class="input input-bordered rounded-none w-full"
                  v-on:keydown="checkForComma($event)"
                  v-model="new_tag"
                />
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('tags', { tags })"
                :matches="
                  () => {
                    // Check if lengths are not equal
                    if (server?.result?.tags.length !== tags.length)
                      return false;

                    // Compare elements at each position
                    for (let i = 0; i < server.result.tags.length; i++) {
                      if (server.result.tags[i] !== tags[i]) return false;
                    }

                    return true;
                  }
                "
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <DashboardCardHeader title="Description" :required="true" />
              <DashboardCardContent>
                <textarea
                  type="text"
                  placeholder="A very interesting server..."
                  v-model="description"
                  class="textarea textarea-bordered rounded-none h-40 max-h-[42rem] w-full"
                ></textarea>
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('description', { description })"
                :matches="() => server?.result?.description === description"
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <DashboardCardHeader
                title="Invite Link"
                :required="true"
                message="(make sure it's a permanent invite!)"
              />
              <DashboardCardContent>
                <input
                  type="text"
                  placeholder="https://discord.gg/fortnite"
                  v-model="invite_link"
                  class="input input-bordered rounded-none w-full"
                />
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('invite_link', { invite_link })"
                :matches="() => server?.result?.invite_link === invite_link"
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <DashboardCardHeader title="Primarily NSFW" :required="true" />
              <DashboardCardContent>
                <div class="form-control items-start">
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="radio-nsfw"
                      class="radio"
                      v-model="nsfw"
                      :value="true"
                    />
                    <span class="label-text">Yes</span>
                  </label>
                </div>
                <div class="form-control items-start">
                  <label class="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="radio-nsfw"
                      class="radio"
                      v-model="nsfw"
                      :value="false"
                    />
                    <span class="label-text">No</span>
                  </label>
                </div>
              </DashboardCardContent>
              <DashboardCardSave
                :callback="() => edit('nsfw', { nsfw })"
                :matches="() => server?.result?.nsfw === nsfw"
              />
            </DashboardCardContainer>

            <DashboardCardContainer>
              <div
                class="bg-error bg-opacity-65 w-full p-4 flex flex-row items-center rounded-md"
              >
                <p class="text-xl">Remove Listing</p>
                <button
                  v-on:click="_delete"
                  class="btn btn-error btn-sm ml-auto"
                >
                  Confirm
                </button>
              </div>
            </DashboardCardContainer>
          </DashboardMainStack>
        </template>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
</template>

<script setup lang="ts">
  import { formatDistance } from "date-fns";

  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const route = useRoute();
  const server_id = route.params.id;
  const syncing = ref<boolean>(false);

  const is_public = ref<boolean | null>(null);
  const language = ref<string | null>(null);
  const category = ref<string | null>(null);
  const description = ref<string | null>(null);
  const invite_link = ref<string | null>(null);
  const nsfw = ref<boolean | null>(null);
  const tags = ref<string[]>([]);
  const new_tag = ref<string>("");
  const bump = ref<{ pending: boolean; on_cooldown: boolean }>({
    pending: false,
    on_cooldown: false,
  });

  const {
    data: server,
    pending: server_pending,
    refresh: refresh_server,
    error: server_error,
  } = useFetch<{
    message: string | null;
    result: typeof servers_table.$inferSelect | null;
  }>(`/api/v1/servers/${server_id}`, { retry: false });

  useHead({
    title: computed(() =>
      server.value?.result
        ? `Dashboard - ${server.value.result.name}`
        : "Dashboard - unknown server"
    ),
  });

  watch(
    server,
    () => {
      if (server.value?.result) {
        bump.value.on_cooldown =
          server.value?.result?.bumped_at! +
            (lucia.value?.user.premium_since !== null ? 3600000 : 7200000) <=
          Date.now()
            ? false
            : true;

        is_public.value = server.value.result.public;
        language.value = server.value.result.language!;
        category.value = server.value.result.category!;
        invite_link.value = server.value.result.invite_link!;
        description.value = server.value.result.description!;
        tags.value = server.value.result.tags;
        nsfw.value = server.value.result.nsfw;
      }
    },
    { immediate: true }
  );

  const sync = async () => {
    syncing.value = true;
    const response = await fetch(`/api/v1/servers/${server_id}/sync`, {
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
      await refresh_server();
      useNuxtApp().$toast.info("Your server has been synced with Discord");
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
    syncing.value = false;
  };

  const edit = async (name: string, data: Record<string, any>) => {
    const response = await fetch(`/api/v1/servers/${server_id}/${name}`, {
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
      await refresh_server();
      useNuxtApp().$toast.info("Your changes have been saved");
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
  };

  const _delete = async () => {
    const response = await fetch(`/api/v1/servers/${server_id}`, {
      method: "DELETE",
    });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    if (response.ok) navigateTo("/dashboard");
    else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
  };

  const _bump = async () => {
    if (server.value !== null) {
      bump.value.pending = true;
      await sync();
      const response = await fetch(`/api/v1/servers/${server_id}/bump`, {
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
      bump.value.pending = false;

      if (response.ok) {
        await refresh_server();
        useNuxtApp().$toast.info("Your server has been bumped");
      } else {
        const json = await response.json();
        useNuxtApp().$toast.error(json.message);
      }
    }
  };

  const addTag = () => {
    if (new_tag.value.trim() !== "") {
      if (tags.value.length >= 5)
        return useNuxtApp().$toast.error(
          "You already have too many tags (max of 5)"
        );

      if (new_tag.value.trim().length > 16)
        return useNuxtApp().$toast.error(
          "Tag has too many characters (max of 16)"
        );

      tags.value = [...tags.value, new_tag.value.trim().toLowerCase()];
      new_tag.value = "";
    }
  };

  const removeTag = (index: number) => {
    tags.value = tags.value.filter((_, i) => i !== index);
  };

  const checkForComma = (event: KeyboardEvent) => {
    if (event.key === "," || event.code === "Comma" || event.code === "Enter") {
      event.preventDefault();
      addTag();
    }
  };
</script>
