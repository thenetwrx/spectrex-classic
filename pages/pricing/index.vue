<template>
  <Container class="max-w-5xl">
    <h1 class="text-center text-4xl font-bold pb-20">Pricing</h1>

    <div class="flex flex-col gap-6 sm:hidden pb-20">
      <div
        class="bg-base-200 h-fit p-6 border border-secondary w-full font-normal"
      >
        <h3 class="text-xl">Pro</h3>
        <h2 class="font-bold text-2xl pt-2">$7.99 once</h2>
        <p class="opacity-50">One time purchase</p>

        <button
          onclick="modal.showModal()"
          class="btn btn-primary rounded-badge w-full mt-4 mb-6"
          :class="lucia?.user.premium_since ? 'btn-disabled' : ''"
        >
          {{ lucia?.user.premium_since ? "Purchased" : "Get Pro" }}
        </button>

        <div class="flex flex-col gap-1">
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-check"></i>
            <p>Up to 5 servers listed</p>
          </div>
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-check"></i>
            <p>1 hour Bump cooldown</p>
          </div>
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-check"></i>
            <p>Analytics</p>
          </div>
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-check"></i>
            <p>Priority Support</p>
          </div>
        </div>
      </div>
      <div
        class="bg-base-200 h-fit p-4 border border-secondary w-full font-normal"
      >
        <h3 class="text-xl">Free</h3>
        <h2 class="font-bold text-2xl pt-2">No cost</h2>
        <p class="opacity-50">Always free</p>

        <button
          class="btn btn-primary btn-disabled rounded-badge w-full mt-4 mb-6"
        >
          Get Free
        </button>

        <div class="flex flex-col gap-1">
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-check"></i>
            <p>Up to 1 server listed</p>
          </div>
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-check"></i>
            <p>2 hour Bump cooldown</p>
          </div>
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-xmark opacity-50"></i>
            <p>Analytics</p>
          </div>
          <div class="font-medium flex flex-row gap-4 items-center">
            <i class="fa-solid fa-xmark opacity-50"></i>
            <p>Priority Support</p>
          </div>
        </div>
      </div>
    </div>

    <table class="w-full text-left max-sm:hidden">
      <thead>
        <tr>
          <th class="bg-transparent"></th>
          <th
            class="bg-base-200 h-fit p-6 border-t border-x border-secondary w-1/3 font-normal"
          >
            <h3 class="text-xl">Pro</h3>
            <h2 class="font-bold text-2xl pt-2">$7.99 once</h2>
            <p class="opacity-50">One time purchase</p>

            <button
              onclick="modal.showModal()"
              class="btn btn-primary rounded-badge w-full mt-4"
              :class="lucia?.user.premium_since ? 'btn-disabled' : ''"
            >
              {{ lucia?.user.premium_since ? "Purchased" : "Get Pro" }}
            </button>
          </th>
          <th
            class="bg-base-200 h-fit p-4 border-t border-x border-secondary w-1/3 font-normal"
          >
            <h3 class="text-xl">Free</h3>
            <h2 class="font-bold text-2xl pt-2">No cost</h2>
            <p class="opacity-50">Always free</p>

            <button
              class="btn btn-primary btn-disabled rounded-badge w-full mt-4"
            >
              Get Free
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-secondary">
          <th
            scope="row"
            class="px-6 py-4 font-medium whitespace-nowrap w-[300px]"
          >
            Amount of servers listed
          </th>
          <td class="px-6 py-4 bg-base-200 border border-secondary">Up to 5</td>
          <td class="px-6 py-4 bg-base-200 border border-secondary">Up to 1</td>
        </tr>

        <tr class="border-b border-secondary">
          <th scope="row" class="px-6 py-4 font-medium whitespace-nowrap">
            Bump cooldown
          </th>
          <td class="px-6 py-4 bg-base-200 border border-secondary">1 hour</td>
          <td class="px-6 py-4 bg-base-200 border border-secondary">2 hours</td>
        </tr>

        <tr class="border-b border-secondary">
          <th scope="row" class="px-6 py-4 font-medium whitespace-nowrap">
            Analytics
          </th>
          <td class="px-6 py-4 bg-base-200 border border-secondary">
            <i class="fa-solid fa-check"></i>
          </td>
          <td class="px-6 py-4 bg-base-200 border border-secondary">
            <i class="fa-solid fa-xmark opacity-50"></i>
          </td>
        </tr>

        <tr class="border-b border-secondary">
          <th scope="row" class="px-6 py-4 font-medium whitespace-nowrap">
            Priority Support
          </th>
          <td class="px-6 py-4 bg-base-200 border border-secondary">
            <i class="fa-solid fa-check"></i>
          </td>
          <td class="px-6 py-4 bg-base-200 border border-secondary">
            <i class="fa-solid fa-xmark opacity-50"></i>
          </td>
        </tr>
      </tbody>
    </table>
  </Container>
  <dialog class="modal" id="modal">
    <div class="modal-box bg-base-200 border border-secondary flex flex-col">
      <div class="flex flex-row gap-1 items-center w-full pb-4">
        <h3 class="text-lg font-bold">Get Pro</h3>

        <button class="btn btn-ghost btn-sm ml-auto" onclick="modal.close()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <p>To purchase a Pro one-time subscription</p>
        <ul class="block list-disc mx-6">
          <li>Make sure to have created a Spectrex account</li>
          <li>
            Send at least $4.99 USD to
            <NuxtLink
              class="text-accent hover:underline"
              href="https://venmo.com/u/hankhannefey1"
              :external="true"
              target="_blank"
            >
              this venmo address
            </NuxtLink>
            (make sure to add your
            <NuxtLink
              class="text-accent hover:underline"
              href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID"
              :external="true"
              target="_blank"
            >
              Discord User ID
            </NuxtLink>
            as the note)
          </li>
          <li>Wait up to 24 hours for your payment to be processed</li>
        </ul>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  useHead({
    title: "Pricing",
  });

  const lucia = useLucia();
</script>
