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
        border: '#1A1A1A',
        accent: '#F58025',
        'accent-glow': 'rgba(245,128,37,0.15)',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#60A5FA',
        text: {
          primary: '#FFFFFF',
          secondary: '#AAAAAA',
          muted: '#666666',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'h1': ['28px', { fontWeight: '900', lineHeight: '1.15' }],
        'h2': ['18px', { fontWeight: '700', lineHeight: '1.2' }],
        'h3': ['15px', { fontWeight: '600', lineHeight: '1.2' }],
        'val': ['20px', { fontWeight: '800', lineHeight: '1.1' }],
        'label': ['13px', { fontWeight: '400' }],
        'muted': ['11px', { fontWeight: '400' }],
      },
      boxShadow: {
        'card': '2px 2px 0px rgba(0,0,0,0.5)',
        'accent': '2px 2px 0px rgba(245,128,37,0.3)',
      },
    }
  },
  plugins: []
}
