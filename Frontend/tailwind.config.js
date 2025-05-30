/** @type {import('tailwindcss').Config} */
const rtl = require("tailwindcss-rtl");
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // ...
    require("@tailwindcss/forms"),
    rtl
  ],
};
