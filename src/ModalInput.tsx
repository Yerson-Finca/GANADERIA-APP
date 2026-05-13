import React, { useState, useRef, useEffect } from 'react'

interface Props {
  titulo: string
  placeholder?: string
  tipo?: 'text' | 'number'
  valorInicial?: string
  onConfirm: (valor: string) => void
  onCancel: () => void
}

const ModalInput: React.FC<Props> = ({ titulo, placeholder, tipo = 'text', valorInicial = '', onConfirm, onCancel }) => {
  const [valor, setValor] = useState(valorInicial)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleConfirm = () => {
    if (valor.trim()) onConfirm(valor.trim())
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{titulo}</div>
        <input
          ref={inputRef}
          type={tipo}
          placeholder={placeholder}
          value={valor}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          style={{ marginBottom: 16 }}
        />
        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-sm btn-primary" onClick={handleConfirm}>Aceptar</button>
        </div>
      </div>
    </div>
  )
}

export default ModalInput
