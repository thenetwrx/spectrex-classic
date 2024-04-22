<template>
  <Container class="max-w-5xl">
    <h2 class="text-center text-3xl font-bold">Become a Spectrex supporter</h2>
    <p class="text-center text-lg">And unlock exclusive benefits today!</p>
    <div class="flex flex-col items-center py-6">
      <div class="card shadow-xl bg-base-200 ml-auto mr-auto">
        <div class="card-body p-8">
          <div class="flex flex-col">
            <p class="font-bold text-4xl">$4.99</p>
            <p class="opacity-75">USD, paid only once</p>
          </div>
          <div class="flex flex-col gap-3 py-4">
            <p class="flex flex-row gap-2 items-center">
              <i
                class="fa-solid fa-check bg-accent p-2 rounded-full bg-opacity-50"
              ></i>
              1 hour bump cooldown vs. 2 hours
            </p>
            <p class="flex flex-row gap-2 items-center">
              <i
                class="fa-solid fa-check bg-accent p-2 rounded-full bg-opacity-50"
              ></i>
              Priority support
            </p>
            <p class="flex flex-row gap-2 items-center">
              <i
                class="fa-solid fa-check bg-accent p-2 rounded-full bg-opacity-50"
              ></i>
              A super special role in our Discord server
            </p>
          </div>
          <button class="btn btn-primary" onclick="modal.showModal()">
            Purchase
          </button>
        </div>
      </div>
    </div>
  </Container>
  <dialog class="modal" id="modal">
    <div class="modal-box bg-base-200 flex flex-col">
      <div class="flex flex-row gap-1 items-center w-full pb-4">
        <h3 class="text-lg font-bold">Support Spectrex</h3>

        <button class="btn btn-ghost btn-sm ml-auto" onclick="modal.close()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <p>To become a Spectrex supporter, you must</p>
        <ul class="block list-disc mx-6">
          <li>Have created a Spectrex account</li>
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
        <p>
          Benefits do not stack. Contact support if you have any issues or
          questions.
        </p>
        <p>
          Payments under $4.99 USD or proceeding an inital $4.99 USD payment
          will be considered as donations
          <i class="fa-solid fa-heart text-error"></i>
        </p>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  useHead({
    title: "Premium",
  });
</script>
