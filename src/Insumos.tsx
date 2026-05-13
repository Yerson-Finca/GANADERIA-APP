import React, { useState, useEffect } from 'react'
import { db, getConfig, setConfig } from './db'
import { getDietaCompleta, ALIMENTOS, IC_ALIMENTOS, NM_ALIMENTOS, CATALOGO_SANIDAD, fm } from './calculos'
import ModalInput from './ModalInput'
import ModalForm from './ModalForm'

interface Props { preciosAlimento: Record<string, number>; stockAlimento: Record<string, number>; animales: any[]; recargar: () => void }

const Insumos: React.FC<Props> = ({ preciosAlimento, stockAlimento, animales, recargar }) => {
  const [precios, setPrecios] = useState(preciosAlimento)
  const [stock, setStock] = useState(stockAlimento)
  const [sups, setSups] = useState<any[]>([])
  const [san, setSan] = useState<any[]>(CATALOGO_SANIDAD)
  const [stockS, setStockS] = useState<Record<string, number>>({})
  const [showSup, setShowSup] = useState(false)
  const [showSan, setShowSan] = useState(false)

  useEffect(() => { cargar() }, [])
  const cargar = async () => {
    setSups(await db.suplementosAlimento.toArray())
    setSan([...CATALOGO_SANIDAD, ...await db.suplementosSanidad.toArray()])
    setStockS(await getConfig('stockSanidad', {}))
  }

  const mez: Record<string, number> = {}
  ALIMENTOS.forEach(a => mez[a] = 0)
  animales.forEach(a => {
    const d = getDietaCompleta(a.historial[a.historial.length - 1].peso, a.tipo, a.estadoRepro)
    ALIMENTOS.forEach(k => mez[k] = (mez[k] || 0) + (d[k as keyof typeof d] as number || 0))
  })

  const updatePrecio = async (k: string, v: number) => { const np = { ...precios, [k]: v }; setPrecios(np); await setConfig('preciosAlimento', np) }
  const updateStock = async (k: string, v: number) => { const ns = { ...stock, [k]: v }; setStock(ns); await setConfig('stockAlimento', ns) }

  const addSup = async (d: Record<string, string>) => {
    await db.suplementosAlimento.add({ id: 'sup_' + Date.now(), nombre: d.nombre, gramosPorKg: parseInt(d.gramos) || 50, precioPorKg: parseFloat(d.precio) || 0, stock: 0 })
    setShowSup(false); cargar()
  }

  const addSan = async (d: Record<string, string>) => {
    await db.suplementosSanidad.add({ id: 'san_' + Date.now(), nombre: d.nombre, dosis: parseInt(d.dosis) || 50, diasEfecto: parseInt(d.efecto) || 30, retiro: parseInt(d.retiro) || 0, stock: 0, precioML: 0, icono: 'fa-syringe', color: '#a78bfa', tipo: 'personalizado' })
    setShowSan(false); cargar()
  }

  return (
    <div className="page">
      <div className="card"><div className="section-title">🍽️ ALIMENTOS</div>
        {ALIMENTOS.map(a => {
          const st = stock[a] || 0, co = mez[a] || 0, cr = (a === 'pasto' || a === 'salvado') ? co : co / 1000, dias = cr > 0 && st > 0 ? st / cr : 999
          return <div key={a} className="stock-row"><i className={`fa-solid ${IC_ALIMENTOS[a]}`} /><div className="stock-info"><span className="stock-name">{NM_ALIMENTOS[a]}</span><span className="stock-consumo">$ {fm(precios[a]||0)}/kg · Stock: {fm(st)} kg · {dias===999?'--':Math.round(dias)+'d'}</span></div>
            <div className="insumo-inputs"><input type="number" value={precios[a]||0} onChange={e => updatePrecio(a, parseFloat(e.target.value)||0)} style={{ width: 60, fontSize: '0.7rem' }} /><input type="number" value={Math.round(st)} onChange={e => updateStock(a, parseFloat(e.target.value)||0)} style={{ width: 60, fontSize: '0.7rem' }} /></div></div>
        })}
      </div>
      <div className="card"><div className="section-title">🧪 SUPLEMENTOS</div>
        {sups.map(s => <div key={s.id} className="row"><span>{s.nombre}</span><span>{s.gramosPorKg} g/kg · Stock: {fm(s.stock||0)} kg</span></div>)}
        <button className="btn btn-purple btn-sm mt8" onClick={() => setShowSup(true)}>➕ AGREGAR</button>
      </div>
      <div className="card"><div className="section-title">💉 SANIDAD</div>
        {san.map(p => <div key={p.id} className="row"><span>{p.icono} {p.nombre}</span><span>{fm(p.tipo==='fijo'?(stockS[p.id]||0):(p.stock||0))} ml</span></div>)}
        <button className="btn btn-purple btn-sm mt8" onClick={() => setShowSan(true)}>➕ AGREGAR</button>
      </div>
      {showSup && <ModalForm titulo="Nuevo suplemento" campos={[{ nombre: 'nombre', label: 'Nombre', tipo: 'text' }, { nombre: 'gramos', label: 'g/kg', tipo: 'number' }, { nombre: 'precio', label: 'Precio/kg ($)', tipo: 'number' }]} onConfirm={addSup} onCancel={() => setShowSup(false)} />}
      {showSan && <ModalForm titulo="Nuevo inyectable" campos={[{ nombre: 'nombre', label: 'Nombre', tipo: 'text' }, { nombre: 'dosis', label: 'Dosis (ml/kg)', tipo: 'number' }, { nombre: 'efecto', label: 'Días efecto', tipo: 'number' }, { nombre: 'retiro', label: 'Días retiro', tipo: 'number' }]} onConfirm={addSan} onCancel={() => setShowSan(false)} />}
    </div>
  )
}

export default Insumos
