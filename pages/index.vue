<template>
  <Container class="max-w-7xl text-center">
    <div class="flex flex-col">
      <div class="hero text-start pb-24">
        <div class="hero-content gap-16 max-h-fit flex-col lg:flex-row-reverse">
          <img src="/images/logo.png" class="max-w-sm rounded-lg shadow-2xl" />
          <div>
            <h1 class="text-5xl">
              Find <span class="font-bold underline">your</span> Discord server
            </h1>
            <p class="py-6 max-w-3xl">
              Explore a universe of niche communities, passionate gamers, and
              limitless options. Discover the perfect fit with our tailored
              listings.
            </p>
            <div class="flex flex-row gap-2 mx-auto pt-12">
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
    </div>

    <NuxtLink href="#why">
      <i class="fa-solid fa-arrow-down fa-xl opacity-50"></i>
    </NuxtLink>

    <div class="py-24" id="why">
      <div class="max-w-6xl mx-auto flex flex-col">
        <h3 class="text-3xl">Why choose us?</h3>

        <ol
          class="grid grid-cols-1 gap-y-10 lg:grid-cols-3 sm:grid-cols-2 lg:text-center py-12"
        >
          <li class="flex flex-col px-4">
            <div
              class="relative bg-base-200 border border-secondary h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40 mb-10 flex flex-col"
            >
              <div class="relative m-auto">
                <i
                  class="fa-solid fa-ban fa-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                ></i>
                <i
                  class="fa-solid fa-dollar-sign absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                ></i>
              </div>
            </div>
            <div>
              <p class="text-2xl">Free</p>
              <p class="opacity-75">Expand your server's reach at no cost.</p>
            </div>
          </li>

          <li class="flex flex-col px-4">
            <div
              class="relative bg-base-200 border border-secondary h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40 mb-10 flex flex-col"
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
              class="relative bg-base-200 border border-secondary h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40 mb-10 flex flex-col"
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

      <NuxtLink href="#faq">
        <i class="fa-solid fa-arrow-down fa-xl pt-16 opacity-50"></i>
      </NuxtLink>

      <div class="py-24" id="faq">
        <div class="max-w-6xl mx-auto flex flex-col">
          <p class="text-3xl">Frequently asked questions</p>

          <div
            class="flex flex-col gap-4 w-full max-w-4xl px-4 mx-auto py-12 text-start"
          >
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
              <input type="radio" name="accordion" :checked="true" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                Is it safe to connect my Discord account to your site?
              </div>
              <div class="collapse-content opacity-75 flex flex-col gap-4">
                <p>
                  We take your privacy seriously. When you log in with Discord,
                  we only request the minimum information necessary to display
                  things like your profile and servers (when applicable) on our
                  site. We cannot access your direct messages, server content,
                  or any other private Discord data.
                </p>

                <p>
                  Additionally, as part of our registration process, we require
                  your email address. Please note that we handle your email
                  address with the utmost care and only use it for the intended
                  purposes, such as account verification or communication
                  related to your use of our services. Rest assured, we do not
                  share your email address with third parties without your
                  explicit consent.
                </p>
              </div>
            </div>
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                Is it really free to list my server?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  You can list up to 1 server for free, or up to 5 servers with
                  a
                  <NuxtLink href="/pricing" class="text-accent hover:underline"
                    >Pro subscription</NuxtLink
                  >. However, regardless of your subscription tier, all servers
                  enjoy equal visibility. Listing your server remains free of
                  charge, ensuring fairness for all. For enhanced visibility,
                  our Pro subscription offers the ability for more frequent
                  bumps to maintain your listing at the top.
                </p>
              </div>
            </div>
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
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
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                What happens if my server violates your guidelines?
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  Servers violating our guidelines will be removed. Repeated or
                  extreme violations may result in account suspension. Please
                  <NuxtLink
                    class="text-accent hover:underline"
                    href="/legal/guidelines"
                    >review our guidelines
                  </NuxtLink>
                  if unsure.
                </p>
              </div>
            </div>
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
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
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
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
            <div
              class="collapse collapse-arrow bg-base-200 border border-secondary"
            >
              <input type="radio" name="accordion" />
              <div class="collapse-title text-xl max-md:text-lg font-medium">
                My question isn't answered here
              </div>
              <div class="collapse-content opacity-75">
                <p>
                  Please feel free to contact us! We offer
                  <NuxtLink
                    class="text-accent hover:underline"
                    href="mailto:contact@spectrex.app"
                    >Email</NuxtLink
                  >
                  and
                  <NuxtLink class="text-accent hover:underline" href="/discord"
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
              href="/explore?utm_source=site&utm_medium=direct&utm_campaign=convinced"
            >
              Find a server
            </NuxtLink>
            <NuxtLink
              class="btn btn-secondary btn-sm rounded-badge"
              href="/dashboard?utm_source=site&utm_medium=direct&utm_campaign=convinced"
            >
              Add a server
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>
