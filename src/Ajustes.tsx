import React, { useState, useEffect } from 'react'
import { db, Lote } from './db'
import Icono from './iconos'
import ModalInput from './ModalInput'
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
    setShowLote(false)
    db.lotes.toArray().then(setLotes)
  }

  const eliminarLote = async () => {
    if (!deleteId) return
    await db.lotes.delete(deleteId)
    db.lotes.toArray().then(setLotes)
    setDeleteId(null)
  }

  const exportar = async () => {
    const data = { animales: await db.animales.toArray(), lotes: await db.lotes.toArray() }
    const b = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b)
    a.download = 'ganadero-respaldo.json'; a.click()
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
    <div className="gap-16" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Lotes */}
      <div className="card">
        <div className="section-title"><Icono nombre="cube" tamaño={14} /> LOTES</div>
        {lotes.length === 0 && <p className="text-muted">No hay lotes creados</p>}
        {lotes.map(l => (
          <div key={l.id} className="row">
            <span className="row-label">{l.tipo === 'engorde' ? '🐮' : '🐄'} {l.nombre}</span>
            <button className="btn-icon btn-icon-danger" onClick={() => setDeleteId(l.id)}>
              <Icono nombre="trash" tamaño={14} />
            </button>
          </div>
        ))}
        <button className="btn btn-sm w-full mt-8" onClick={() => setShowLote(true)}>
          <Icono nombre="plus" tamaño={14} /> Crear lote
        </button>
      </div>

      {/* Respaldos */}
      <div className="card">
        <div className="section-title"><Icono nombre="export" tamaño={14} /> RESPALDO</div>
        <div className="gap-8" style={{ display: 'flex', flexDirection: 'column' }}>
          <button className="btn btn-sm w-full" onClick={exportar}>
            <Icono nombre="export" tamaño={14} /> Exportar
          </button>
          <button className="btn btn-sm w-full" onClick={importar}>
            <Icono nombre="import" tamaño={14} /> Importar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <div className="section-title"><Icono nombre="sparkles" tamaño={14} /> INFORMACIÓN</div>
        <p className="text-secondary" style={{ fontSize: 12 }}>GANADERO ÉLITE v6.0</p>
        <p className="text-muted" style={{ fontSize: 11 }}>Animales: {animales.length} · Lotes: {lotes.length}</p>
      </div>

      {/* Modales */}
      {showLote && (
        <ModalForm
          titulo="Nuevo lote"
          campos={[
            { nombre: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ej: Ceba Norte' },
            { nombre: 'tipo', label: 'Tipo', tipo: 'select', opciones: [{ valor: 'engorde', label: 'Engorde' }, { valor: 'leche', label: 'Leche' }] },
          ]}
          onConfirm={crearLote}
          onCancel={() => setShowLote(false)}
        />
      )}
      {deleteId && (
        <ModalConfirm
          titulo="Eliminar lote"
          mensaje="¿Eliminar este lote? Los animales quedarán sin lote."
          onConfirm={eliminarLote}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}

export default Ajustes
