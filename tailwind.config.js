/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
  bg: '#080808',
  card: '#111111',
  border: '#222222',
  accent: '#A0784C',              // Marrón más fuerte
'accent-glow': 'rgba(160,120,76,0.15)',
  success: '#22C55E',                   // Verde - Nivel 2
  danger: '#EF4444',                    // Rojo - Nivel 2
  warning: '#C8841A',                   // Ámbar
  info: '#60A5FA',                      // Azul (IA)
  text: {
  primary: '#FFFFFF',       // T1 - Blanco (títulos)
  accent: '#D4A574',        // T2 - Ámbar (precios, valores)
  secondary: '#A0A0A0',     // T3 - Gris claro (etiquetas)
  muted: '#666666',         // T4 - Gris oscuro (fechas)
}
},
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'card': '2px 2px 0px rgba(0,0,0,0.5)',
        'accent': '2px 2px 0px rgba(245,200,66,0.3)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease',
        'slide-down': 'slideDown 0.3s ease',
        'fade-in': 'fadeIn 0.2s ease'
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
