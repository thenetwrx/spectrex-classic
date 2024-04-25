/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      transitionDuration: {
        "400": "400ms",
      },
      transitionTimingFunction: {
        smooth: "ease-out",
      },
    },
  },
  darkMode: "class",
  plugins: [require("daisyui"), require("tailwindcss-animated")],
  daisyui: {
    themes: [
      {
        // light: {
        //   ...require("daisyui/src/theming/themes")["light"],
        //   "base-content": "#000",
        //   primary: "#1076eb",
        //   "primary-content": "#fff",
        //   secondary: "#000",
        //   "secondary-content": "#fff",
        //   accent: "#ffbf28",
        //   "accent-content": "#fff",
        // },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "base-100": "#000",
          "base-200": "#0a0a0a",
          "base-300": "#101010",
          "base-content": "#fff",
          primary: "#fff",
          "primary-content": "#000",
          secondary: "#27272A",
          "secondary-content": "#fff",
          accent: "#1076eb",
          "accent-content": "#fff",
        },
      },
    ],
  },
};
