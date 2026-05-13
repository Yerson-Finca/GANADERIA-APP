import React, { useState, useRef, useEffect } from 'react'

interface Props { titulo: string; placeholder?: string; tipo?: string; onConfirm: (v: string) => void; onCancel: () => void }

const ModalInput: React.FC<Props> = ({ titulo, placeholder, tipo = 'text', onConfirm, onCancel }) => {
  const [val, setVal] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100) }, [])

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{titulo}</div>
        <input ref={ref} type={tipo} placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} style={{ marginBottom: 16 }} />
        <div className="flex-col gap10">
          <button className="btn btn-gold" onClick={() => val && onConfirm(val)}>✅ ACEPTAR</button>
          <button className="btn btn-gray" onClick={onCancel}>CANCELAR</button>
        </div>
      </div>
    </div>
  )
}

export default ModalInput
