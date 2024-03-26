// app.config.ts

export default defineAppConfig({
  vercelAnalytics: {
    mode: "auto",
    debug: true,
    beforeSend: (event) => {
      return event;
    },
  },
});
