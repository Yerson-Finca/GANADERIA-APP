import React from 'react'

interface Props {
  titulo: string
  mensaje: string
  onConfirm: () => void
  onCancel: () => void
}

const ModalConfirm: React.FC<Props> = ({ titulo, mensaje, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{titulo}</div>
        <div className="modal-body">{mensaje}</div>
        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-sm btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirm
