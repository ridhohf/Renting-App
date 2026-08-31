import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        foreground: '#1F1A16',
        cozy: {
          50: '#FBF9F5',
          100: '#F5EFE6',
          200: '#EBDDCC',
          300: '#DEC7AF',
          400: '#CFA78B',
          500: '#BA805C',
          600: '#A3603D',
          700: '#8A482A',
          800: '#6E361F',
          900: '#4D2414',
          950: '#2C1309',
        },
        warm: {
          sand: '#F3EDE2',
          cream: '#FAF7F2',
          card: '#FFFFFF',
          border: '#E8DFD3',
          borderSubtle: '#F0E8DD',
          muted: '#7A6F64',
          dark: '#1C1713',
          espresso: '#38281F',
          terracotta: '#A8522E',
          terracottaHover: '#8E4020',
          accent: '#D97706',
          accentLight: '#FEF3C7',
          success: '#2D6A4F',
          successLight: '#D8F3DC',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'cozy-sm': '0 2px 8px -2px rgba(60, 40, 20, 0.05)',
        'cozy-md': '0 8px 24px -4px rgba(60, 40, 20, 0.07), 0 2px 6px -1px rgba(60, 40, 20, 0.04)',
        'cozy-lg': '0 20px 40px -8px rgba(60, 40, 20, 0.09), 0 4px 12px -2px rgba(60, 40, 20, 0.04)',
        'cozy-inner': 'inset 0 1px 2px rgba(255, 255, 255, 0.6), inset 0 -1px 2px rgba(60, 40, 20, 0.03)',
      },
      transitionTimingFunction: {
        'spring-smooth': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
