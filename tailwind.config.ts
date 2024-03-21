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
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "base-content": "#000",
          primary: "#00DC82",
          "primary-content": "#fff",
          secondary: "#000",
          "secondary-content": "#fff",
          accent: "#ffbf28",
          "accent-content": "#fff",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "base-content": "#fff",
          primary: "#00DC82",
          "primary-content": "#fff",
          secondary: "#fff",
          "secondary-content": "#000",
          accent: "#ffbf28",
          "accent-content": "#fff",
        },
      },
    ],
  },
};
