import React, { useState } from 'react'
import ModalAgregar from './ModalAgregar'

interface Props { pagina: string; cambiarPagina: (p: string) => void }

const Menu: React.FC<Props> = ({ pagina, cambiarPagina }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <nav className="bottom-nav">
        <button onClick={() => cambiarPagina('ajustes')} className={`nav-btn ${pagina === 'ajustes' ? 'active' : ''}`}>⚙️ Ajustes</button>
        <button onClick={() => cambiarPagina('insumos')} className={`nav-btn ${pagina === 'insumos' ? 'active' : ''}`}>📦 Insumos</button>
        <button onClick={() => setShowModal(true)} className="nav-btn-add">➕</button>
        <button onClick={() => cambiarPagina('lote')} className={`nav-btn ${pagina === 'lote' ? 'active' : ''}`}>📊 Lotes</button>
        <button onClick={() => cambiarPagina('animales')} className={`nav-btn ${pagina === 'animales' ? 'active' : ''}`}>🐄 Animales</button>
      </nav>
      {showModal && <ModalAgregar cerrar={() => setShowModal(false)} />}
    </>
  )
}

export default Menu
