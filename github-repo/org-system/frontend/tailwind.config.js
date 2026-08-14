/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wheat: {
          50: '#fcfbf7',
          100: '#f7f4ea',
          200: '#efe7d2',
        },
        forest: {
          700: '#2d5a3f',
          800: '#1b3a28',
          900: '#12271b',
          950: '#0a160f',
        },
      },
    },
  },
  plugins: [],
};
