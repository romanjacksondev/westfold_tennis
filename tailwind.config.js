/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // add this line
    "./pages/**/*.{js,ts,jsx,tsx}",
    // if you have other folders, add their paths too, like this:
    //  "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}