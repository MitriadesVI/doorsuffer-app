// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Podemos definir colores personalizados para los temas
        artnouveau: {
          primary: '#a86f3e',
          secondary: '#e7d8c3',
          accent: '#738c65',
          background: '#f8f3e8',
          text: '#3d2c1c'
        },
        gothic: {
          primary: '#8f0e0e',
          secondary: '#2a2a2a',
          accent: '#b91c1c',
          background: '#121212',
          text: '#e6e6e6'
        },
        minimal: {
          primary: '#2563eb',
          secondary: '#e5e7eb',
          accent: '#60a5fa',
          background: '#f9fafb',
          text: '#1f2937'
        }
      },
      fontFamily: {
        artnouveau: ['Playfair Display', 'serif'],
        gothic: ['Cinzel', 'serif'],
        minimal: ['DM Sans', 'sans-serif']
      },
      borderRadius: {
        'artnouveau': '0.25rem',
        'gothic': '0.125rem',
        'minimal': '0.75rem'
      }
    },
  },
  plugins: [],
}