<template>
  <Container class="max-w-4xl text-center">
    <ResourcePending v-if="profile_pending" />
    <ResourceNotFound v-else-if="!profile?.result" />
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
                ? discordCdn.user_avatar(
                    profile.result.discord_id,
                    profile.result.avatar
                  )
                : null
            "
            :abbreviation="
              profile.result.global_name?.slice(0, 2).toUpperCase()
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
              {{ profile.result.global_name || profile.result.username }}
            </p>

            <p class="opacity-50">@{{ profile.result.username }}</p>
          </div>
        </ResourceCardHeader>

        <ResourceCardContent>
          <div>
            <p class="text-2xl pb-2">Description</p>

            <p class="opacity-50">
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
  const discordCdn = useDiscordCdn();

  const route = useRoute();
  const user_id = route.params.id;

  const { data: profile, pending: profile_pending } = useFetch<{
    message: string | null;
    result: User | null;
  }>(`/api/v1/users/${user_id}`, { retry: false });

  useHead({
    title: computed(() =>
      profile.value?.result ? `@${profile.value.result.username}` : "@unknown"
    ),
  });

  const copy_current_url = async () => {
    const { toClipboard } = useClipboard();
    toClipboard(window.location.href);
  };
</script>
