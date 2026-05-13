import React, { useState } from 'react'
import ModalAgregar from './ModalAgregar'

const Icono = ({ nombre, size = 20 }: { nombre: string; size?: number }) => {
  const paths: Record<string, string> = {
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
    cube: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.3 7l8.7 5 8.7-5 M12 22V12',
    plus: 'M12 5v14M5 12h14',
    chart: 'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',
    list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {(paths[nombre] || '').split(' ').map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

interface MenuProps {
  pagina: string
  cambiarPagina: (p: string) => void
}

const Menu: React.FC<MenuProps> = ({ pagina, cambiarPagina }) => {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      <nav className="bottom-nav">
        <button onClick={() => cambiarPagina('ajustes')} className={`nav-btn ${pagina === 'ajustes' ? 'active' : ''}`}>
          <Icono nombre="settings" />
          <span>Ajustes</span>
        </button>
        <button onClick={() => cambiarPagina('insumos')} className={`nav-btn ${pagina === 'insumos' ? 'active' : ''}`}>
          <Icono nombre="cube" />
          <span>Insumos</span>
        </button>
        <button onClick={() => setMostrarModal(true)} className="nav-btn-add">
          <Icono nombre="plus" size={22} />
        </button>
        <button onClick={() => cambiarPagina('lote')} className={`nav-btn ${pagina === 'lote' ? 'active' : ''}`}>
          <Icono nombre="chart" />
          <span>Lotes</span>
        </button>
        <button onClick={() => cambiarPagina('animales')} className={`nav-btn ${pagina === 'animales' ? 'active' : ''}`}>
          <Icono nombre="list" />
          <span>Animales</span>
        </button>
      </nav>
      {mostrarModal && <ModalAgregar cerrar={() => setMostrarModal(false)} />}
    </>
  )
}

export default Menu
