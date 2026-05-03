/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7C1130', dark: '#5A0D23', light: '#FDF0F3' },
        secondary: { DEFAULT: '#16A34A', dark: '#14532D', light: '#F0FDF4' },
        brand: { crimson: '#7C1130', green: '#16A34A' },
        navy: '#0A0F1E',
        sidebar: '#0A0F1E',
        surface: '#F8FAFC',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
