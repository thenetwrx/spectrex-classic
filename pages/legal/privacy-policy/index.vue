<template>
  <Container class="max-w-4xl">
    <h1 class="text-center text-3xl font-bold">Privacy Policy</h1>
    <div class="text-center text-lg pt-4">
      <p>Effective: 4/28/2024</p>
      <p>Last updated: 4/21/2024</p>
    </div>
    <div class="text-start flex flex-col gap-2 py-10">
      <h1 class="text-4xl">Introduction</h1>
      <p class="opacity-75">
        Your privacy is important to us. It is Spectrex's policy to respect your
        privacy regarding any information we may collect from you across our
        website (spetrex.app) and other sites we own and operate.
      </p>

      <h2 class="text-3xl">1. Information we collect</h2>
      <div>
        <h3 class="text-xl"><span>- </span> How we collect information</h3>
        <p class="opacity-75">
          We collect information by fair and lawful means, with your knowledge
          and consent. We also let you know why we're collecting it and how it
          will be used. You are free to refuse our request for some information,
          with the understanding that we may be unable to provide you with some
          of your desired services without it.
        </p>
      </div>

      <h2 class="text-3xl">2. Use of information</h2>
      <p class="opacity-75">
        We use a combination of identifying and non-identifying information to
        understand who our visitors are, how they use our services, and how we
        may improve their experience of our website in future. We partner with
        Microsoft Clarity and Microsoft Advertising to capture how you use and
        interact with our website through behavioral metrics, heatmaps, and
        session replay to improve and market our products/services. Website
        usage data is captured using first and third-party cookies and other
        tracking technologies to determine the popularity of products/services
        and online activity. Additionally, we use this information for site
        optimization, fraud/security purposes, and advertising. For more
        information about how Microsoft collects and uses your data, visit the
        <NuxtLink
          href="https://privacy.microsoft.com/privacystatement"
          :external="true"
          target="_blank"
          class="text-accent hover:underline"
        >
          Microsoft Privacy Statement</NuxtLink
        >.
      </p>

      <h2 class="text-3xl">3. Data processing and storage</h2>
      <p class="opacity-75">
        We only retain personal information for as long as necessary to provide
        a service, or to improve our services in future. While we retain this
        data, we will protect it within commercially acceptable means to prevent
        loss and theft, as well as unauthorized access, disclosure, copying, use
        or modification. That said, we advise that no method of electronic
        transmission or storage is 100% secure, and cannot guarantee absolute
        data security.
      </p>

      <h2 class="text-3xl">4. Cookies</h2>
      <p class="opacity-75">
        We use “cookies” to save encrypted login information across our site. A
        cookie is a small piece of data that our website stores on your
        computer, and accesses each time you visit so we can understand how you
        use our site and serve you content based on preferences you have
        specified. If you do not wish to accept cookies from us, you should
        instruct your browser to refuse cookies from our website, understanding
        that we may be unable to provide you with some of your desired services
        without them. This policy covers only the use of cookies between your
        computer and our website; it does not cover the use of cookies by any
        third-party services we use on our site.
      </p>

      <h2 class="text-3xl">5. Children’s Privacy</h2>
      <p class="opacity-75">
        This website does not knowingly target or collect personal information
        from children. As a parent/guardian, please contact us if you believe
        your child is participating in an activity involving personal
        information on our website, and you have not received a notification or
        request for consent. We do not use your supplied contact details for
        marketing or promotional purposes.
      </p>

      <h2 class="text-3xl">Limits of our policy</h2>
      <p class="opacity-75">
        This privacy policy only covers Spectrex's own collecting and handling
        of data. We only work with partners, affiliates and third-party
        providers whose privacy policies align with ours, however we cannot
        accept responsibility or liability for their respective privacy
        practices. Our website may link to external sites that are not operated
        by us. Please be aware that we have no control over the content and
        policies of those sites, and cannot accept responsibility or liability
        for their respective privacy practices.
      </p>

      <h2 class="text-3xl">Changes to this policy</h2>
      <p class="opacity-75">
        At our discretion, we may update this policy to reflect current
        acceptable practices. We will take reasonable steps to let users know
        about changes via our website. Your continued use of this site after any
        changes to this policy will be regarded as acceptance of our practices
        around data and personal information.
      </p>

      <h2 class="text-3xl">Your rights and responsibilities</h2>
      <p class="opacity-75">
        As our user, you have the right to be informed about how your data is
        collected and used. You are entitled to know what data we collect about
        you, and how it is processed. You are entitled to correct and update any
        personal information about you, and to request this information be
        deleted. You are entitled to restrict or object to our use of your data,
        while retaining the right to use your personal information for your own
        purposes. Feel free to contact us if you have any concerns or questions
        about how we handle your data and personal information.
      </p>
    </div>
  </Container>
</template>

<script setup lang="ts">
  useHead({
    title: "Privacy Policy",
  });
</script>
