/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        card: '#0A0A0A',
        border: '#1A1A1A',
        accent: '#FDCC0D',
        'accent-glow': 'rgba(253, 204, 13, 0.08)',
        success: '#FDCC0D',
        danger: '#FF6B6B',
        warning: '#F59E0B',
        info: '#60A5FA',
        ia: '#7C3AED',
        'ia-glow': 'rgba(124, 58, 237, 0.08)',
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
