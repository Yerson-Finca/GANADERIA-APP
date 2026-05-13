export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        card: '#1A1A1A',
        border: 'rgba(255,255,255,0.04)',
        accent: '#B8A080',
        success: '#5A9E6F',
        danger: '#C77D7D',
        warning: '#C4A86C',
        ia: '#8B7EC8',
        text: { primary: '#E8E8E8', secondary: '#8E8E8E', muted: '#5C5C5C' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
}
