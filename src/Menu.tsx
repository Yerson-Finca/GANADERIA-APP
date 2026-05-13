import React, { useState } from 'react'
import ModalAgregar from './ModalAgregar'

// SVG del icono +
const IconoPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

// SVGs de los íconos del menú
const IconoAjustes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const IconoInsumos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.3 7l8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
)

const IconoDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
)

const IconoAnimales = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
)

interface MenuProps {
  pagina: string
  cambiarPagina: (p: string) => void
}

const Menu: React.FC<MenuProps> = ({ pagina, cambiarPagina }) => {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      <nav className="bottom-nav">
        <button onClick={() => cambiarPagina('ajustes')} className={`bn-btn ${pagina === 'ajustes' ? 'active' : ''}`}>
          <IconoAjustes />
          <span>Ajustes</span>
        </button>

        <button onClick={() => cambiarPagina('insumos')} className={`bn-btn ${pagina === 'insumos' ? 'active' : ''}`}>
          <IconoInsumos />
          <span>Insumos</span>
        </button>

        <button onClick={() => setMostrarModal(true)} className="bn-btn-add" aria-label="Agregar animal">
          <IconoPlus />
        </button>

        <button onClick={() => cambiarPagina('lote')} className={`bn-btn ${pagina === 'lote' ? 'active' : ''}`}>
          <IconoDashboard />
          <span>Lotes</span>
        </button>

        <button onClick={() => cambiarPagina('animales')} className={`bn-btn ${pagina === 'animales' ? 'active' : ''}`}>
          <IconoAnimales />
          <span>Animales</span>
        </button>
      </nav>

      {mostrarModal && <ModalAgregar cerrar={() => setMostrarModal(false)} />}
    </>
  )
}

export default Menu
