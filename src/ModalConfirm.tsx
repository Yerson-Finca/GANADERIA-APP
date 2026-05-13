import React from 'react'

interface Props { titulo: string; mensaje: string; onConfirm: () => void; onCancel: () => void }

const ModalConfirm: React.FC<Props> = ({ titulo, mensaje, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-title">{titulo}</div>
      <p style={{ marginBottom: 16, fontSize: '0.85rem', color: '#a1a1aa' }}>{mensaje}</p>
      <div className="flex-col gap10">
        <button className="btn btn-gold" onClick={onConfirm}>SÍ</button>
        <button className="btn btn-gray" onClick={onCancel}>CANCELAR</button>
      </div>
    </div>
  </div>
)

export default ModalConfirm
