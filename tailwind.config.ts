/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: "#FFF6E9",     // Warm off-white (main background)
          purple: "#4335A7",  // Deep purple (primary)
          blue: "#80C4E9",    // Light blue (secondary)
          orange: "#FF7F3E",  // Orange (accents)
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
