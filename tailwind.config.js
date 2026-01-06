/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define custom colors if needed, but standard Tailwind colors should suffice for the design.
        // The purple in the design looks like violet-700/800.
      },
      fontFamily: {
        // We will stick to default sans for now, but adding 'Kanit' via Google Fonts later would be good.
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
