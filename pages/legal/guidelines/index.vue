<template>
  <Container class="max-w-4xl">
    <h1 class="text-center text-3xl font-bold">Guidelines</h1>
    <div class="text-center text-lg pt-4">
      <p>Effective: 5/02/2024</p>
      <p>Last updated: 5/02/2024</p>
    </div>
    <div class="text-start flex flex-col gap-2 py-10">
      <h1 class="text-4xl">Introduction</h1>
      <p class="opacity-75">
        This document outlines the expected etiquette when submitting content to
        Spectrex.
      </p>

      <h2 class="text-3xl">1. Inappropriate content</h2>
      <p class="opacity-75">
        The use of profanity, vulgar language, NSFW or sexually explicit content
        is strictly prohibited. This prohibition extends to all visible areas of
        your submissions, encompassing titles, descriptions, images, and
        reviews. Content that violates this rule will be promptly removed.
        However, you are welcome to resubmit your content with respectful
        language. Additionally, it is important to note that no form of links
        may be included unless expressly requested by Spectrex for an invite
        link to your server.
      </p>

      <h2 class="text-3xl">2. Governing laws</h2>
      <p class="opacity-75">
        Abide by all laws and regulations in your country of residence. Do not
        promote illegal activities.
      </p>

      <h2 class="text-3xl">3. Discord Community Guidelines</h2>
      <p class="opacity-75">
        Servers that violate the
        <NuxtLink
          href="https://discord.com/guidelines"
          class="text-accent hover:underline"
        >
          Discord Community Guidelines
        </NuxtLink>
        are prohibited.
      </p>

      <h2 class="text-3xl">4. External links</h2>
      <p class="opacity-75">
        External links, including URLs leading to websites, Discord servers, or
        any other online platform, are strictly forbidden in server listings on
        Spectrex unless explicitly requested by Spectrex to provide the invite
        link to the server being listed. If Spectrex requires the invite link to
        the server you are listing, you are only permitted to submit the invite
        link to that specific server and not to any other server.
      </p>

      <h2 class="text-3xl">5. Automation</h2>
      <p class="opacity-75">
        Bots or scripts that automate actions on Spectrex (such as auto-bumping)
        are not allowed. All interactions must be done manually.
      </p>

      <h2 class="text-3xl">6. Spam</h2>
      <p class="opacity-75">
        You may not list servers which serve for the sole purpose of redirecting
        or advertising other servers or have no content.
      </p>

      <h2 class="text-3xl">7. Rewarding users</h2>
      <p class="opacity-75">
        Do not incentivize or force users to perform actions on Spectrex (e.g.,
        offering rewards for positive reviews or requiring server bumps).
      </p>

      <h2 class="text-3xl">8. Reviews</h2>
      <p class="opacity-75">
        You may only submit one review per server. Using multiple accounts to
        post additional reviews is prohibited.
      </p>

      <h2 class="text-3xl">9. Sexual content</h2>
      <p class="opacity-75">
        Servers primarily focused on NSFW or sexually explicit content must be
        clearly marked as "NSFW" on Spectrex. This does not override the rule
        against inappropriate content.
      </p>
    </div>
  </Container>
</template>

<script setup lang="ts">
  useHead({
    title: "Guidelines",
  });
</script>
