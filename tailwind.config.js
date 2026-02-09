/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ED7117",
        inactive: "#999999",
        background: "#F9FAFB",
      },
      boxShadow: {
        premium: "0 10px 40px -10px rgba(0, 0, 0, 0.05)",
        "premium-hover": "0 20px 50px -12px rgba(0, 0, 0, 0.1)",
        float: "0 25px 60px -12px rgba(0, 0, 0, 0.15)",
        "inner-light": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)",
        "premium-lg": "0 15px 45px -15px rgba(0, 0, 0, 0.08)",
        elevation:
          "0 12px 40px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.03)",
        "elevation-hover":
          "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 20px -10px rgba(0, 0, 0, 0.05)",
        "inner-glow":
          "inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.02)",
      },
      fontFamily: {
        sans: ["Inter", "Prompt", "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
