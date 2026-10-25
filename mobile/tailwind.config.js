/** @type {import('tailwindcss').Config} */
module.exports = {
  // Paths to all component files
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.ts",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        vedic: {
          saffron: "#FF7722",
          gold: "#D4AF37",
          maroon: "#800020",
          cream: "#FFFDD0",
          dark: "#1A1615",
          sand: "#FAF7F2",
        },
      },
    },
  },
  plugins: [],
};
