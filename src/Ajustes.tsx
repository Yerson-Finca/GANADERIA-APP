import React, { useState, useEffect } from 'react'
import { db, Lote } from './db'
import ModalForm from './ModalForm'
import ModalConfirm from './ModalConfirm'

interface Props { recargar: () => void; animales: any[] }

const Ajustes: React.FC<Props> = ({ recargar, animales }) => {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [showLote, setShowLote] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { db.lotes.toArray().then(setLotes) }, [])

  const crearLote = async (datos: Record<string, string>) => {
    await db.lotes.add({ id: 'lote_' + Date.now(), nombre: datos.nombre, tipo: datos.tipo as any })
    setShowLote(false); db.lotes.toArray().then(setLotes)
  }

  const eliminarLote = async () => {
    if (!deleteId) return
    await db.lotes.delete(deleteId); db.lotes.toArray().then(setLotes); setDeleteId(null)
  }

  const exportar = async () => {
    const data = { animales: await db.animales.toArray(), lotes: await db.lotes.toArray() }
    const b = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ganadero-respaldo.json'; a.click()
  }

  const importar = () => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'
    i.onchange = async (e: any) => {
      const r = new FileReader()
      r.onload = async (ev: any) => {
        const data = JSON.parse(ev.target.result)
        if (data.animales) { await db.animales.clear(); await db.animales.bulkAdd(data.animales) }
        if (data.lotes) { await db.lotes.clear(); await db.lotes.bulkAdd(data.lotes) }
        recargar()
      }
      r.readAsText(e.target.files[0])
    }
    i.click()
  }

  return (
    <div className="page">
      <div className="card">
        <div className="section-title">📊 LOTES</div>
        {lotes.length === 0 && <p className="text-muted" style={{ fontSize: 12 }}>No hay lotes</p>}
        {lotes.map(l => (
          <div key={l.id} className="row">
            <span className="row-label">{l.tipo === 'engorde' ? '🥩' : '🥛'} {l.nombre}</span>
            <button className="btn btn-sm" style={{ background: 'rgba(255,0,0,0.06)', color: '#ef4444', width: 'auto' }} onClick={() => setDeleteId(l.id)}>🗑️</button>
          </div>
        ))}
        <button className="btn btn-purple btn-sm mt8" onClick={() => setShowLote(true)}>➕ CREAR LOTE</button>
      </div>

      <div className="card">
        <div className="section-title">💾 RESPALDO</div>
        <button className="btn btn-purple mb8" onClick={exportar}>📥 EXPORTAR</button>
        <button className="btn btn-gray" onClick={importar}>📤 IMPORTAR</button>
      </div>

      <div className="card">
        <div className="section-title">ℹ️ INFO</div>
        <p className="text-muted" style={{ fontSize: 12 }}>GANADERO ÉLITE v6.0</p>
      </div>

      {showLote && (
        <ModalForm titulo="Nuevo lote" campos={[
          { nombre: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ej: Ceba Norte' },
          { nombre: 'tipo', label: 'Tipo', tipo: 'select', opciones: [{ valor: 'engorde', label: 'Engorde' }, { valor: 'leche', label: 'Leche' }] }
        ]} onConfirm={crearLote} onCancel={() => setShowLote(false)} />
      )}
      {deleteId && (
        <ModalConfirm titulo="Eliminar lote" mensaje="¿Eliminar este lote?" onConfirm={eliminarLote} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}

export default Ajustes
