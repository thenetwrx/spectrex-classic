<template>
  <div>
    <section class="hero">
      <div class="hero-content flex-col lg:flex-row-reverse p-10 mt-8">
        <div>
          <img
            src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/6582c18a9cff186bd3731704_Create%20an%20invite-only%20place%20where%20you%20belong.svg"
            class="w-full"
          />
        </div>
        <div class="text-center lg:text-left">
          <h1 class="text-5xl font-bold">Explore discord servers</h1>
          <p class="py-6">
            Unleash a world of niche communities, passionate gamers, and endless
            possibilities. Curated listings, tailored just for you.
          </p>

          <div
            class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit max-lg:ml-auto max-lg:mr-auto overflow-x-auto"
          >
            <NuxtLink
              href="/tag?q=community"
              class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
            >
              <span class="text-black dark:text-primary">#</span>
              Community
            </NuxtLink>
            <NuxtLink
              href="/tag?q=memes"
              class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
            >
              <span class="text-black dark:text-primary">#</span>
              Memes
            </NuxtLink>
            <NuxtLink
              href="/tag?q=gaming"
              class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
            >
              <span class="text-black dark:text-primary">#</span>
              Gaming
            </NuxtLink>
            <NuxtLink
              href="/tag?q=anime"
              class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
            >
              <span class="text-black dark:text-primary">#</span>
              Anime
            </NuxtLink>
            <NuxtLink
              href="/tag?q=giveaways"
              class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-black dark:text-white"
            >
              <span class="text-black dark:text-primary">#</span>
              Giveaways
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="p-10 bg-base-200">
      <h2 class="text-center text-3xl font-bold">Why choose Guildex?</h2>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 max-w-5xl ml-auto mr-auto"
      >
        <div class="text-center">
          <i class="fa-solid fa-hand-paper fa-2x"></i>
          <h3 class="opacity-75 mt-2">Curated quality, not quantity</h3>
        </div>
        <div class="text-center">
          <i class="fa-solid fa-magnifying-glass fa-2x"></i>
          <h3 class="opacity-75 mt-2">Find your perfect fit</h3>
        </div>
        <div class="text-center">
          <i class="fa-solid fa-heart fa-2x"></i>
          <h3 class="opacity-75 mt-2">Discover thriving communities</h3>
        </div>
        <div class="text-center">
          <i class="fa-solid fa-star fa-2x"></i>
          <h3 class="opacity-75 mt-2">Fresh servers daily</h3>
        </div>
      </div>
    </section>
    <section class="p-10">
      <h2 class="text-center text-3xl font-bold">
        Jumpstart your Discord Journey
      </h2>
      <p class="text-center text-lg">
        New to discord? We can help you get started.
      </p>
      <div
        class="grid max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid- gap-6 mt-8 max-w-5xl mx-auto"
      >
        <div
          class="card w-full shadow-xl bg-base-200 ml-auto mr-auto pt-2 pb-4"
        >
          <figure class="p-2">
            <img
              src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/644fab4db9ca0a124b73d4b7_c40c84ca18d84633a9d86b4046a91437.svg"
              class="rounded-xl"
            />
          </figure>
          <div class="card-body px-6 py-0">
            <h2 class="card-title">Creating an account</h2>
            <p class="opacity-75">
              You'll need a discord account to join a server,
              <a href="https://discord.com/register" class="text-primary">
                follow the instructions here
              </a>
            </p>
          </div>
        </div>

        <div
          class="card w-full shadow-xl bg-base-200 ml-auto mr-auto pt-2 pb-4"
        >
          <figure class="p-2">
            <img
              src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/6582c1d8348e5c81ca608138_From%20few%20to%20a%20fandom.svg"
              class="rounded-xl"
            />
          </figure>
          <div class="card-body px-6 py-0">
            <h2 class="card-title">Joining a server</h2>
            <div class="flex flex-col gap-0 opacity-75">
              <p class="pb-2">Make your mark on the community:</p>
              <p>- Choose a fun username</p>
              <p>- Upload a profile picture</p>
              <p>- Add a short bio (optional)</p>
            </div>
          </div>
        </div>

        <div
          class="card w-full shadow-xl bg-base-200 ml-auto mr-auto pt-2 pb-4"
        >
          <figure class="p-2">
            <img
              src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/6582c1b717efff2306ef179e_Where%20hanging%20out%20is%20easy.svg"
              class="rounded-xl"
            />
          </figure>
          <div class="card-body px-6 py-0">
            <h2 class="card-title m-0 p-0">Chatting in a server</h2>
            <div class="flex flex-col gap-0 opacity-75">
              <p class="pb-2">Discord offers two ways to connect:</p>
              <p>- Text Channels: Great for ongoing conversations</p>
              <p>- Voice Channels: Perfect for real-time chats</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const session = await client.auth.getSession();
console.log(session);
</script>
