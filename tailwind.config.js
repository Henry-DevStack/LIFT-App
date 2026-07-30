/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#0d0f0e",
        surface: "#161917",
        surface2: "#1e2220",
        border: "#2a2f2c",
        accent: "var(--accent)",
        accentDim: "var(--accent-dim)",
        textPrimary: "#f2f4f1",
        textSecondary: "#9aa39a",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}

