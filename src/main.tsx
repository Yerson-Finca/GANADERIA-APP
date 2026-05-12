import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      () => console.log('✅ SW registrado'),
      () => console.log('⚠️ SW offline')
    )
  })
}

// Haptic feedback global
if ('vibrate' in navigator) {
  (window as any).haptic = () => navigator.vibrate(15)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
