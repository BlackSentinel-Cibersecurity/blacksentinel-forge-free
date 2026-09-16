import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          black: '#0B0B0B',
          'black-secondary': '#141414',
          'gray-dark': '#232323',
          'gray-medium': '#3C3C3C',
          'gray-light': '#D9D9D9',
          white: '#FFFFFF',
          orange: '#FF6B00',
          'orange-bright': '#FF8C1A',
          red: '#EF4444',
          green: '#22C55E',
          blue: '#3B82F6',
          yellow: '#FACC15',
          purple: '#A855F7',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'forge-glow': '0 0 20px rgba(255, 107, 0, 0.3)',
        'forge-glow-strong': '0 0 40px rgba(255, 107, 0, 0.5)',
        'forge-card': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'forge-elevated': '0 10px 15px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-orange': 'pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-orange': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(255, 107, 0, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.4)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
