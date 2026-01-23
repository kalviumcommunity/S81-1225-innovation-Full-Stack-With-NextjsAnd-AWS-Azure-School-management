/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind dark variants are driven by the `.dark` class.
  // We still keep `html[data-theme]` for CSS-variable theming in globals.css.
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#93C5FD",
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
        },
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  plugins: [],
};
