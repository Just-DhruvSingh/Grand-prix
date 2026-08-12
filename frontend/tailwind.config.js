/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        panel: '#161310',
        borderDark: '#2A2B27',
        accentYellow: '#FFC400',
        alertRed: '#E0143C',
        textMain: '#E0DCD6',
      },
    },
  },
  plugins: [],
}
