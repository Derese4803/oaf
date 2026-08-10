/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#0F2318",
          900: "#16321F",
          800: "#1F3D2B",
          700: "#2B5038",
          600: "#3A6B49",
          500: "#4C8760",
        },
        wheat: {
          50: "#FBF8F1",
          100: "#F4EEDC",
          200: "#E8DCC4",
        },
        amber: {
          600: "#C08829",
          500: "#D6A03F",
        },
        slate: {
          600: "#4A5A6A",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
