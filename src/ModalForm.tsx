import React, { useState } from 'react'

interface Campo { nombre: string; label: string; tipo: string; placeholder?: string; opciones?: { valor: string; label: string }[] }
interface Props { titulo: string; campos: Campo[]; onConfirm: (d: Record<string, string>) => void; onCancel: () => void }

const ModalForm: React.FC<Props> = ({ titulo, campos, onConfirm, onCancel }) => {
  const [datos, setDatos] = useState<Record<string, string>>({})

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{titulo}</div>
        <div className="flex-col gap10" style={{ marginBottom: 16 }}>
          {campos.map(c => (
            <div key={c.nombre}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: 4 }}>{c.label}</label>
              {c.tipo === 'select' ? (
                <select value={datos[c.nombre] || ''} onChange={e => setDatos({ ...datos, [c.nombre]: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {c.opciones?.map(o => <option key={o.valor} value={o.valor}>{o.label}</option>)}
                </select>
              ) : (
                <input type={c.tipo} placeholder={c.placeholder} value={datos[c.nombre] || ''} onChange={e => setDatos({ ...datos, [c.nombre]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <div className="flex-col gap10">
          <button className="btn btn-gold" onClick={() => onConfirm(datos)}>✅ GUARDAR</button>
          <button className="btn btn-gray" onClick={onCancel}>CANCELAR</button>
        </div>
      </div>
    </div>
  )
}

export default ModalForm
