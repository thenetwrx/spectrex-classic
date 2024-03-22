<template>
  <section class="p-10">
    <h2 class="text-center text-3xl font-bold">Become a Spectrex supporter</h2>
    <p class="text-center text-lg">And unlock exclusive benefits today!</p>
    <div class="flex flex-col items-center mt-8 max-w-5xl mx-auto">
      <div class="card shadow-xl bg-base-200 ml-auto mr-auto">
        <div class="card-body p-8">
          <div class="flex flex-col">
            <p class="font-bold text-4xl">$4.99</p>
            <p class="opacity-75">USD, paid only once</p>
          </div>
          <div class="flex flex-col gap-3 py-4">
            <p class="flex flex-row gap-4 items-center">
              <i class="fa-solid fa-check"></i> 1 hour bump cooldown vs. 2 hours
            </p>
            <p class="flex flex-row gap-4 items-center">
              <i class="fa-solid fa-check"></i> Priority support
            </p>
            <p class="flex flex-row gap-4 items-center">
              <i class="fa-solid fa-check"></i> A super special role in our
              discord server
            </p>
          </div>
          <button class="btn btn-secondary" onclick="my_modal_1.showModal()">
            Donate
          </button>
        </div>
      </div>
    </div>
  </section>
  <dialog class="modal" id="my_modal_1">
    <div class="modal-box">
      <div class="flex flex-row gap-1 items-center w-full pb-4">
        <h3 class="text-lg font-bold">Support Spectrex</h3>

        <button
          class="btn btn-ghost btn-sm ml-auto"
          onclick="my_modal_1.close()"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <p>
        To become a Spectrex supporter, you must send exactly $4.99 USD to
        <a class="text-primary" href="https://venmo.com/u/hankhannefey1"
          >this venmo address</a
        >
        and adding your
        <a
          class="text-primary"
          href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID"
          >Discord User ID</a
        >
        as the note. Your payment can take up to 24 hours to be processed.
        Contact support if you have any issues or questions.
      </p>
    </div>
  </dialog>
</template>
