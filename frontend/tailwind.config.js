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
        bgPrimary:   '#161310',
        bgSurface:   '#1E1A17',
        bgElevated:  '#252018',
        borderDim:   '#2E2820',
        borderGlow:  '#4A3F30',
        neonCyan:    '#00F5FF',
        neonAmber:   '#FFB800',
        neonCrimson: '#FF2D55',
        neonGreen:   '#39FF14',
        textPrimary: '#F0EBE3',
        textSecondary:'#8A7F72',
        textAccent:  '#00F5FF',
      },
    },
  },
  plugins: [],
};
