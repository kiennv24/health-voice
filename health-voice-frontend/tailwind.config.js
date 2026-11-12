/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical Deep Teal & Slate Navy
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488', // Primary Deep Teal
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
          navy: '#0b1329',
          dark: '#070d1e',
        },
        medical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488', // Professional Teal
          600: '#0f766e', // Medical Dark Teal
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
          950: '#021e1d',
        },
        clinical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7', // Clinical Blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        healthGreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
        surface: {
          light: '#f8fafc',
          card: '#ffffff',
          dark: '#0b1329',
          darker: '#060b17',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'medical-soft': '0 4px 20px -2px rgba(15, 118, 110, 0.08)',
        'medical-glow': '0 0 25px rgba(13, 148, 136, 0.20)',
        'player-bar': '0 -8px 30px rgba(11, 19, 41, 0.08)',
        'card-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      },
      animation: {
        'sound-wave': 'wave 1.2s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
