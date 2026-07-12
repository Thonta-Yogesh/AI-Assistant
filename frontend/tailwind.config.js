/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-slide': 'fadeSlideIn 0.35s ease-out forwards',
        'float-avatar': 'floatAvatar 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

