import React, { useState, useEffect } from 'react'
import { db } from './db'

const ModalAgregar: React.FC<{ cerrar: () => void }> = ({ cerrar }) => {
  const [nombre, setNombre] = useState('')
  const [peso, setPeso] = useState('')
  const [tipo, setTipo] = useState('engorde')
  const [origen, setOrigen] = useState('nacimiento')
  const [lotes, setLotes] = useState<any[]>([])
  const [loteId, setLoteId] = useState('')

  useEffect(() => { db.lotes.toArray().then(setLotes) }, [])

  const guardar = async () => {
    if (!nombre || nombre.length < 2) return
    const p = parseFloat(peso)
    if (isNaN(p) || p < 20 || p > 2000) return
    await db.animales.add({ nombre, tipo, origen, historial: [{ fecha: new Date().toLocaleDateString(), peso: p }], lote: loteId || null, foto: null })
    cerrar()
  }

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🐄 NUEVO ANIMAL</div>
        <div className="flex-col gap10">
          <input type="text" placeholder="Nombre del Animal" value={nombre} onChange={e => setNombre(e.target.value)} />
          <input type="number" placeholder="Peso Inicial (kg)" value={peso} onChange={e => setPeso(e.target.value)} />
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="engorde">🥩 Engorde</option>
            <option value="leche">🥛 Leche</option>
          </select>
          <select value={origen} onChange={e => setOrigen(e.target.value)}>
            <option value="nacimiento">🐮 Nació en la finca</option>
            <option value="comprado">💰 Comprado</option>
          </select>
          <select value={loteId} onChange={e => setLoteId(e.target.value)}>
            <option value="">Sin lote</option>
            {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <button className="btn btn-gold" onClick={guardar}>✅ GUARDAR</button>
          <button className="btn btn-gray" onClick={cerrar}>CANCELAR</button>
        </div>
      </div>
    </div>
  )
}

export default ModalAgregar
