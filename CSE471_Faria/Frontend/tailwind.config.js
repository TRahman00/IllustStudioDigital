/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],

  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#050908",
          panel: "#091311",
          panel2: "#0D1B19",
          border: "#17302C",

          teal: "#12C8B8",
          tealLight: "#27D8C8",

          text: "#D8E8E5",
          muted: "#708783"
        }
      },

      boxShadow: {
        studio:
          "0 15px 60px rgba(0, 0, 0, 0.45)",

        tealGlow:
          "0 0 25px rgba(18, 200, 184, 0.15)"
      }
    }
  },

  plugins: []
};