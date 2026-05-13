import React, { useState, useEffect } from 'react'
import { db } from './db'
import { getDiet, AL, IC, NM } from './calculos'

const Stock: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const [stock, setStock] = useState<Record<string, number>>({})
  const [animales, setAnimales] = useState<any[]>([])

  useEffect(() => { cargar() }, [])
  const cargar = async () => {
    const a = await db.animales.toArray(); setAnimales(a)
    const cfg = await db.appData.toArray()
    const st = cfg.find(c => c.key === 'stock')
    if (st) setStock(st.value)
  }

  const guardar = async () => { await db.appData.put({ key: 'stock', value: stock }); showToast('✅ Stock actualizado') }

  const mez: Record<string, number> = {}
  AL.forEach(a => mez[a] = 0)
  animales.forEach(a => { const d = getDiet(a.historial[a.historial.length - 1].peso); AL.forEach(k => mez[k] += d[k as keyof typeof d] || 0) })

  return (
    <div className="page">
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 14, color: '#fbbf24' }}>📦 STOCK ALIMENTOS (kg)</div>
        {AL.map(a => {
          const st = stock[a] || 0, co = mez[a] || 0, cr = (a === 'pasto' || a === 'salvado') ? co : co / 1000
          const dias = cr > 0 && st > 0 ? st / cr : 999
          return (
            <div key={a} className="stock-row">
              <i className={`fa-solid ${IC[a]}`} />
              <div className="stock-info"><span className="stock-name">{NM[a]}</span><span className="stock-consumo">Consumo: {cr.toFixed(1)} kg/d</span></div>
              <input type="number" value={Math.round(st)} onChange={e => setStock({ ...stock, [a]: parseFloat(e.target.value) || 0 })} style={{ width: 80, textAlign: 'right', padding: '8px 10px', fontSize: '0.85rem', minHeight: 40 }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: dias < 3 ? '#ef4444' : dias < 7 ? '#f59e0b' : '#22c55e', minWidth: 35, textAlign: 'center' }}>{dias === 999 ? '--' : Math.round(dias) + 'd'}</span>
            </div>
          )
        })}
        <button className="btn btn-gold mt12" onClick={guardar}>✅ GUARDAR</button>
      </div>
    </div>
  )
}

export default Stock
