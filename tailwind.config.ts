import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cemetery: {
          bg: '#0a0a0f',
          dark: '#0d0d15',
          navy: '#1a1a2e',
          blue: '#16213e',
          stone: '#4a4a5a',
          gold: '#c9a96e',
          flame: '#ff6b35',
          ember: '#ff4500',
          fog: 'rgba(200, 200, 220, 0.05)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'fog-drift': 'fogDrift 20s ease-in-out infinite',
        'fog-drift-reverse': 'fogDriftReverse 25s ease-in-out infinite',
        'candle-flicker': 'candleFlicker 0.5s ease-in-out infinite alternate',
        'float-up': 'floatUp 3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fogDrift: {
          '0%, 100%': { transform: 'translateX(-5%)' },
          '50%': { transform: 'translateX(5%)' },
        },
        fogDriftReverse: {
          '0%, 100%': { transform: 'translateX(5%)' },
          '50%': { transform: 'translateX(-5%)' },
        },
        candleFlicker: {
          '0%': { transform: 'scale(1) rotate(-1deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1.1) rotate(1deg)', opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 169, 110, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 169, 110, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
