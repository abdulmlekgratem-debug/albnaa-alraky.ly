/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F5F9',
          100: '#E3EAF2',
          200: '#C7D5E4',
          300: '#A0B6CE',
          400: '#7293B5',
          500: '#4D739A',
          600: '#385B80',
          700: '#294866',
          800: '#1F3A63',
          900: '#152D4D',
          950: '#0C1E35',
          navy: '#1F3A63',
          accent: '#B78E52',
        },
        surface: {
          50: '#F6F7F8',
          100: '#EEF1F3',
          200: '#E1E5E9',
          300: '#CDD3DA',
          400: '#929CAA',
          500: '#657180',
          600: '#475464',
          700: '#303D4D',
          800: '#202B38',
          900: '#152D4D',
        },
        sand: {
          50: '#FBF9F5',
          100: '#F2ECE2',
          200: '#E5D8C5',
          300: '#CDB994',
          400: '#B59667',
          500: '#98764E',
          600: '#7A5B3D',
          700: '#604631',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -4px rgba(12, 30, 53, 0.16)',
        'card': '0 12px 28px -22px rgba(12, 30, 53, 0.32), 0 2px 6px rgba(12, 30, 53, 0.04)',
        'header': '0 12px 32px -26px rgba(12, 30, 53, 0.55)',
        'premium': '0 28px 70px -36px rgba(12, 30, 53, 0.5)',
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'image': '18px',
      },
    },
  },
  plugins: [],
}
