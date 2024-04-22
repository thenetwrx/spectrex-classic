<template>
  <Container class="max-w-7xl text-center">
    <div class="flex flex-col">
      <h1 class="text-5xl">
        Find <span class="font-bold underline">your</span> Discord server
      </h1>
      <p class="py-2 text-xl max-w-2xl mx-auto opacity-80">
        Explore a universe of niche communities, passionate gamers, and
        limitless options. Discover the perfect fit with our tailored listings.
      </p>

      <!-- <div
        class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit mx-auto overflow-x-auto py-2"
      >
        <NuxtLink
          v-for="category in categories"
          :href="'/explore?category=' + category"
          class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
        >
          <span class="text-accent">/</span>
          {{ category }}
        </NuxtLink>
      </div>
      <p class="ml-auto opacity-75">
        <i class="fa-solid fa-up-left"></i> select a category
      </p> -->

      <div class="flex flex-row gap-2 mx-auto py-12">
        <NuxtLink class="btn btn-primary btn-sm rounded-badge" href="/explore">
          Find a server
        </NuxtLink>
        <NuxtLink
          class="btn btn-secondary btn-sm rounded-badge"
          href="/dashboard"
        >
          Add a server
        </NuxtLink>
      </div>
    </div>

    <div class="py-24 my-8">
      <div class="max-w-6xl mx-auto flex flex-col">
        <p class="text-3xl">Why choose Spectrex?</p>

        <ol
          class="grid grid-cols-1 gap-y-10 lg:grid-cols-3 sm:grid-cols-2 lg:text-center py-12"
        >
          <li class="flex flex-col px-4">
            <div
              class="relative bg-base-200 h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40 mb-10 flex flex-col"
            >
              <i class="fa-solid fa-money-bill fa-2xl m-auto"></i>
            </div>
            <div>
              <p class="text-2xl">Free</p>
              <p class="opacity-75">Expand your server's reach at no cost.</p>
            </div>
          </li>

          <li class="flex flex-col px-4">
            <div
              class="relative bg-base-200 h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40 mb-10 flex flex-col"
            >
              <i class="fa fa-solid fa-smile fa-2xl m-auto"></i>
            </div>
            <div>
              <p class="text-2xl">Simple</p>
              <p class="opacity-75">
                Join or get a server listed with a hassle-free process.
              </p>
            </div>
          </li>

          <li class="flex flex-col px-4">
            <div
              class="relative bg-base-200 h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40 mb-10 flex flex-col"
            >
              <i class="fa-solid fa-shield fa-2xl m-auto"></i>
            </div>
            <div>
              <p class="text-2xl">Moderated</p>
              <p class="opacity-75">
                Strict guidelines protect each server's integrity.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div class="py-24 my-8">
        <div class="max-w-6xl mx-auto flex flex-col">
          <p class="text-3xl">Frequently asked questions</p>

          <div
            class="flex flex-col gap-4 w-full max-w-4xl px-4 mx-auto py-12 text-start"
          >
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                Is it safe to connect my Discord account to your site?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  We take your privacy seriously. When you log in with Discord,
                  we only request the minimum information necessary to display
                  things like your profile and servers (when applicable) on our
                  site. We cannot access your direct messages, server content,
                  or any other private Discord data.
                </p>
              </div>
            </div>
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                Is it really free to list my server?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  Listing your server is completely free, ensuring all servers
                  have equal visibility. For a boost, our
                  <NuxtLink class="text-accent underline" href="/premium"
                    >Premium</NuxtLink
                  >
                  one-time purchase allows more frequent bumps to keep your
                  listing at the top.
                </p>
              </div>
            </div>
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                Are all listed servers safe to join?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  We review all servers before listing and actively moderate our
                  platform. However, it’s always wise to exercise caution when
                  joining any new online community.
                </p>
              </div>
            </div>
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                What happens if my server violates your guidelines?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  Servers violating our guidelines will be removed. Repeated or
                  extreme violations may result in account suspension. Please
                  <NuxtLink
                    class="text-accent underline"
                    href="/legal/guidelines"
                    >review our guidelines
                  </NuxtLink>
                  if unsure.
                </p>
              </div>
            </div>
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                How do I report a server that violates your guidelines?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  You can report inappropriate listings by pressing the
                  <i class="fa-solid fa-flag px-2"></i> button at the top right
                  of the listing.
                </p>
              </div>
            </div>
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                Do you offer analytics or insights about my server listing?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  We provide basic invite usage data, which includes the number
                  of times your Discord invite link has been viewed. Keep in
                  mind, this doesn't necessarily indicate new members.
                </p>
              </div>
            </div>
            <div class="collapse collapse-arrow bg-base-200">
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                My question isn't answered here
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  Please feel free to contact us! We offer
                  <NuxtLink
                    class="text-accent underline"
                    href="mailto:contact@spectrex.app"
                    >Email</NuxtLink
                  >
                  and
                  <NuxtLink class="text-accent underline" href="/discord"
                    >Discord</NuxtLink
                  >
                  support options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="py-24 my-8">
        <div class="max-w-6xl mx-auto flex flex-col">
          <p class="text-3xl">Are you convinced yet?</p>

          <div
            class="flex flex-row max-md:flex-col gap-2 max-md:gap-4 py-12 mx-auto"
          >
            <NuxtLink
              class="btn btn-primary btn-sm rounded-badge"
              href="/explore"
            >
              Find a server
            </NuxtLink>
            <NuxtLink
              class="btn btn-secondary btn-sm rounded-badge"
              href="/dashboard"
            >
              Add a server
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
  useHead({
    title: "Home",
  });

  const categories = ref<Array<string>>([
    "Community",
    "Music",
    "Gaming",
    "Anime",
    "Technology",
    "Movies",
    "Other",
  ]);
</script>
