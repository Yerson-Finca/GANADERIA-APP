import React, { useState } from 'react'
import Icono from './iconos'
import ModalAgregar from './ModalAgregar'

interface MenuProps {
  pagina: string
  cambiarPagina: (p: string) => void
}

const Menu: React.FC<MenuProps> = ({ pagina, cambiarPagina }) => {
  const [mostrarModal, setMostrarModal] = useState(false)

  const botones = [
    { id: 'ajustes', icono: 'cog-6-tooth', label: 'Ajustes' },
    { id: 'insumos', icono: 'cube', label: 'Insumos' },
    { id: 'animales', icono: 'list-bullet', label: 'Animales' },
    { id: 'lote', icono: 'chart-bar', label: 'Dashboard' }
  ]

  return (
    <>
      <nav className="bottom-nav">
        {botones.map((btn, i) => (
          <React.Fragment key={btn.id}>
            {/* Insertar botón + antes de Dashboard (índice 3) */}
            {i === 3 && (
              <button
                onClick={() => setMostrarModal(true)}
                className="bn-btn-add"
                aria-label="Agregar animal"
              >
                <Icono nombre="plus" tamaño={22} variante="solid" />
              </button>
            )}
            <button
              onClick={() => cambiarPagina(btn.id)}
              className={`bn-btn ${pagina === btn.id ? 'active' : ''}`}
            >
              <Icono nombre={btn.icono} tamaño={20} />
              <span>{btn.label}</span>
            </button>
          </React.Fragment>
        ))}
      </nav>

      {mostrarModal && <ModalAgregar cerrar={() => setMostrarModal(false)} />}
    </>
  )
}

export default Menu
