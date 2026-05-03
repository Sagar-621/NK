/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C1130',
          dark: '#5A0D23',
          light: '#FDF0F3',
        },
        secondary: {
          DEFAULT: '#16A34A',
          dark: '#14532D',
          light: '#F0FDF4',
        },
        brand: {
          crimson: '#7C1130',
          green: '#16A34A',
        },
        navy: '#0A0F1E',
        lime: '#EAF3EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '1.75rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1.5s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'dash-flow': 'dashFlow 1.5s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
        'confetti': 'confetti 1s ease-out forwards',
        'checkmark': 'checkmark 0.6s ease-out forwards',
        'slide-in-underline': 'slideInUnderline 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        dashFlow: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(-200px) rotate(720deg)', opacity: '0' },
        },
        checkmark: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        slideInUnderline: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      boxShadow: {
        'card-3d': '0 20px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-3d-hover': '0 40px 80px -16px rgba(124,17,48,0.15), 0 0 40px rgba(22,163,74,0.1)',
        'btn-3d': '0 8px 24px -4px rgba(124,17,48,0.3)',
        'btn-3d-hover': '0 16px 40px -8px rgba(22,163,74,0.4)',
        'contact': '0 24px 80px -12px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
