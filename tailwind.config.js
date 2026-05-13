/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',
        card: '#1A1A2E',
        border: '#2A2A3E',
        accent: '#00D4AA',
        'accent-glow': 'rgba(0, 212, 170, 0.15)',
        success: '#00D4AA',
        danger: '#FF4757',
        warning: '#F59E0B',
        info: '#60A5FA',
        ia: '#8B5CF6',
        'ia-glow': 'rgba(139, 92, 246, 0.15)',
        text: {
          primary: '#FFFFFF',
          secondary: '#8B8B9E',
          muted: '#5C5C7A',
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
        'card': '0 2px 8px rgba(0,0,0,0.3)',
        'accent': '0 0 20px rgba(0, 212, 170, 0.2)',
        'ia': '0 0 15px rgba(139, 92, 246, 0.1), 0 0 30px rgba(139, 92, 246, 0.05)',
        'btn-add': '0 0 25px rgba(0, 212, 170, 0.3), 0 0 50px rgba(0, 212, 170, 0.1)',
      },
    }
  },
  plugins: []
}
