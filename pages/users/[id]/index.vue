<template>
  <Container class="max-w-4xl text-center">
    <ResourcePending v-if="profile_pending" />
    <ResourceNotFound
      v-else-if="!profile?.result"
      :message="profile_error?.data.message"
    />
    <template v-else>
      <ResourceRow>
        <NuxtLink
          class="btn btn-ghost btn-sm"
          href="/dashboard/account"
          v-if="profile.result.id === lucia?.user?.id"
        >
          Manage <i class="fa-solid fa-gear"></i>
        </NuxtLink>
        <button class="btn btn-ghost btn-sm" v-on:click="copy_current_url">
          Copy <i class="fa-solid fa-link"></i>
        </button>
      </ResourceRow>
      <ResourceCardContainer>
        <ResourceCardHeader>
          <ResourceCardHeaderImage
            :resource="
              profile.result.avatar
                ? discord.cdn.user_avatar(
                    profile.result.provider_id,
                    profile.result.avatar
                  )
                : null
            "
            :abbreviation="
              profile.result.display_name?.slice(0, 2).toUpperCase()
            "
          />
          <div class="flex flex-col items-start">
            <p
              class="font-medium text-lg"
              :class="
                profile.result.premium_since !== null ? 'text-[#ffbf28]' : ''
              "
            >
              <i
                class="fa-solid fa-crown"
                v-if="profile.result.premium_since !== null ? true : false"
              ></i>
              {{ profile.result.display_name || profile.result.username }}
            </p>
            <div class="flex flex-wrap gap-1 items-center">
              <div
                class="bg-accent bg-opacity-50 px-1 rounded-md"
                v-if="profile.result.admin"
              >
                <span class="opacity-75">Admin</span>
              </div>
              <div class="bg-secondary bg-opacity-50 px-1 rounded-md">
                <span class="opacity-75">Peasant</span>
              </div>
            </div>
          </div>
        </ResourceCardHeader>

        <ResourceCardContent>
          <div>
            <p class="text-2xl pb-2">Description</p>

            <p class="break-words whitespace-pre-wrap opacity-75">
              {{ profile.result.description || "No description provided" }}
            </p>
          </div>
        </ResourceCardContent>
      </ResourceCardContainer>

      <ResourceReviewsContent>
        <p class="opacity-50">
          No reviews yet...
          <NuxtLink href="#" class="text-accent">Create one!</NuxtLink>
        </p>
      </ResourceReviewsContent>
    </template>
  </Container>
</template>

<script setup lang="ts">
  import type { User } from "lucia";
  import useClipboard from "~/composables/useClipboard";

  const lucia = useLucia();
  const discord = useDiscord();

  const route = useRoute();
  const user_id = route.params.id;

  const {
    data: profile,
    pending: profile_pending,
    error: profile_error,
  } = useFetch<{
    message: string | null;
    result: User | null;
  }>(`/api/v1/users/${user_id}`, { retry: false });

  useHead({
    title: computed(() =>
      profile.value?.result
        ? `${
            profile.value.result.display_name || profile.value.result.username
          }`
        : "unknown"
    ),
  });

  const copy_current_url = async () => {
    const { toClipboard } = useClipboard();
    toClipboard(window.location.href);
  };
</script>
