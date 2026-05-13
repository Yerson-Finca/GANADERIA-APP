import React from 'react'

interface Props {
  pagina: string
  setPagina: (p: string) => void
}

const Nav: React.FC<Props> = ({ pagina, setPagina }) => (
  <nav className="nav">
    {[
      { id: 'lote', icon: 'fa-chart-pie', label: 'LOTE' },
      { id: 'precios', icon: 'fa-tags', label: 'PRECIOS' },
      { id: 'stock', icon: 'fa-boxes', label: 'STOCK' },
      { id: 'sanidad', icon: 'fa-syringe', label: 'SAN' },
    ].map(item => (
      <button
        key={item.id}
        className={`nav-btn ${pagina === item.id ? 'active' : ''}`}
        onClick={() => setPagina(item.id)}
      >
        <i className={`fa-solid ${item.icon}`} />
        {item.label}
      </button>
    ))}
  </nav>
)
