module.exports = {
  apps: [
    {
      name: "Spectrex",
      port: "3000",
      exec_mode: "cluster",
      instances: "max",
      script: "./.output/server/index.mjs",
      env: {
        DISCORD_CLIENT_ID: "1216792581577506826",
        DISCORD_CLIENT_SECRET: "wk7pkKo_3TPfXS4pB4Tzuxr4j8faqodL",
        ENCRYPTION_KEY: "0yxXDqvvgXxYCL3PCjQ3WcseFpkCm2Uq",
        BASE_URL: "https://spectrex.app",
        CRON_SECRET: "nigga",
      },
    },
  ],
};
