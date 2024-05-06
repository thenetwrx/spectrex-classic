module.exports = {
  apps: [
    {
      name: "spectrex",
      port: "3000",
      exec_mode: "cluster",
      instances: "max",
      script: "./.output/server/index.mjs",
      env: {
        DISCORD_CLIENT_ID: "1216792581577506826",
        DISCORD_CLIENT_SECRET: "KsNcsSzG2KLco3WFZYQAMIyE59yg-ZZg",
        ENCRYPTION_KEY: "oYtFueqh5oCRT009BGsXCYk5eE9XVGRJTFIbieJss1961mH41W",
        BASE_URL: "https://spectrex.app",
        DATABASE_HOST: "localhost",
        DATABASE_PASSWORD: "yVLr9O66uQvtzihA9fc8M0AQbXhpkbsXmpc1r36A1XWbKO6X8F",
        CRON_SECRET: "nigga",
      },
    },
  ],
};
