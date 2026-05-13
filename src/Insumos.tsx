import React, { useState, useEffect } from 'react'
import { db, getConfig, setConfig, SuplementoAlimento } from './db'
import { Animal, getDietaCompleta, ALIMENTOS, IC_ALIMENTOS, NM_ALIMENTOS, CATALOGO_SANIDAD, fm } from './calculos'
import Icono from './iconos'
import ModalInput from './ModalInput'
import ModalForm from './ModalForm'

interface Props {
  preciosAlimento: Record<string, number>
  stockAlimento: Record<string, number>
  animales: Animal[]
  recargar: () => void
}

const Insumos: React.FC<Props> = ({ preciosAlimento, stockAlimento, animales, recargar }) => {
  const [precios, setPrecios] = useState(preciosAlimento)
  const [stock, setStock] = useState(stockAlimento)
  const [suplementos, setSuplementos] = useState<SuplementoAlimento[]>([])
  const [sanidad, setSanidad] = useState<any[]>(CATALOGO_SANIDAD)
  const [stockSanidad, setStockSanidad] = useState<Record<string, number>>({})
  const [showSup, setShowSup] = useState(false)
  const [showSan, setShowSan] = useState(false)
  const [buySupId, setBuySupId] = useState<string | null>(null)
  const [buySanId, setBuySanId] = useState<string | null>(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setSuplementos(await db.suplementosAlimento.toArray())
    setSanidad([...CATALOGO_SANIDAD, ...(await db.suplementosSanidad.toArray())])
    setStockSanidad(await getConfig('stockSanidad', {}))
  }

  const mez: Record<string, number> = {}
  ALIMENTOS.forEach(a => mez[a] = 0)
  animales.forEach(a => {
    const d = getDietaCompleta(a.historial[a.historial.length - 1].peso, a.tipo, a.estadoRepro)
    ALIMENTOS.forEach(k => mez[k] = (mez[k] || 0) + (d[k as keyof typeof d] as number || 0))
  })

  const updatePrecio = async (alim: string, val: number) => {
    const np = { ...precios, [alim]: val }
    setPrecios(np)
    await setConfig('preciosAlimento', np)
  }

  const updateStock = async (alim: string, val: number) => {
    const ns = { ...stock, [alim]: val }
    setStock(ns)
    await setConfig('stockAlimento', ns)
  }

  const addSuplemento = async (datos: Record<string, string>) => {
    await db.suplementosAlimento.add({
      id: 'sup_' + Date.now(), nombre: datos.nombre,
      gramosPorKg: parseInt(datos.gramos) || 50,
      precioPorKg: parseFloat(datos.precio) || 0, stock: 0
    })
    setShowSup(false)
    cargar()
  }

  const addSanidad = async (datos: Record<string, string>) => {
    await db.suplementosSanidad.add({
      id: 'san_' + Date.now(), nombre: datos.nombre,
      dosis: parseInt(datos.dosis) || 50, diasEfecto: parseInt(datos.efecto) || 30,
      retiro: parseInt(datos.retiro) || 0, stock: 0, precioML: 0,
      icono: 'flask', color: '#9B8EC4', tipo: 'personalizado'
    })
    setShowSan(false)
    cargar()
  }

  const buySuplemento = async (valor: string) => {
    const partes = valor.split(',')
    const kg = parseFloat(partes[0]?.trim())
    const costo = parseFloat(partes[1]?.trim())
    if (isNaN(kg) || isNaN(costo) || !buySupId) return
    const sup = await db.suplementosAlimento.get(buySupId)
    if (sup) {
      await db.suplementosAlimento.update(buySupId, {
        stock: (sup.stock || 0) + kg,
        precioPorKg: sup.precioPorKg || (costo / kg)
      })
    }
    setBuySupId(null)
    cargar()
  }

  const buySanidad = async (valor: string) => {
    const partes = valor.split(',')
    const ml = parseFloat(partes[0]?.trim())
    const costo = parseFloat(partes[1]?.trim())
    if (isNaN(ml) || isNaN(costo) || !buySanId) return
    const ns = { ...stockSanidad, [buySanId]: (stockSanidad[buySanId] || 0) + ml }
    setStockSanidad(ns)
    await setConfig('stockSanidad', ns)
    setBuySanId(null)
    cargar()
  }

  const eliminarSup = async (id: string) => {
    await db.suplementosAlimento.delete(id)
    cargar()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card">
        <div className="section-title"><Icono nombre="leaf" tamaño={14} /> ALIMENTOS</div>
        {ALIMENTOS.map(alim => {
          const st = stock[alim] || 0
          const co = mez[alim] || 0
          const cr = (alim === 'pasto' || alim === 'salvado') ? co : co / 1000
          const dias = cr > 0 && st > 0 ? st / cr : 999
          return (
            <div key={alim} className="insumo-row">
              <div className="insumo-icon">{IC_ALIMENTOS[alim]}</div>
              <div className="insumo-info">
                <div className="insumo-name">{NM_ALIMENTOS[alim]}</div>
                <div className="insumo-detail">Stock: {fm(st)} kg · {dias === 999 ? '--' : Math.round(dias) + 'd'}</div>
              </div>
              <div className="insumo-inputs">
                <span className="text-muted" style={{ fontSize: 10 }}>$</span>
                <input type="number" value={precios[alim] || 0} onChange={e => updatePrecio(alim, parseFloat(e.target.value) || 0)} />
                <span className="text-muted" style={{ fontSize: 10 }}>kg</span>
                <input type="number" value={Math.round(st)} onChange={e => updateStock(alim, parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="section-title"><Icono nombre="flask" tamaño={14} /> SUPLEMENTOS</div>
        {suplementos.map(sup => (
          <div key={sup.id} className="row">
            <div style={{ flex: 1 }}>
              <div className="insumo-name">{sup.nombre}</div>
              <div className="insumo-detail">{sup.gramosPorKg} g/kg · Stock: {fm(sup.stock || 0)} kg</div>
            </div>
            <button className="btn-icon" onClick={() => setBuySupId(sup.id)}>
              <Icono nombre="plus" tamaño={14} />
            </button>
            <button className="btn-icon btn-icon-danger" onClick={() => eliminarSup(sup.id)}>
              <Icono nombre="trash" tamaño={14} />
            </button>
          </div>
        ))}
        <button className="btn btn-sm w-full mt-8" onClick={() => setShowSup(true)}>
          <Icono nombre="plus" tamaño={14} /> Agregar suplemento
        </button>
      </div>

      <div className="card">
        <div className="section-title"><Icono nombre="syringe" tamaño={14} /> SANIDAD</div>
        {sanidad.map(prod => (
          <div key={prod.id} className="row">
            <span className="row-label">{prod.nombre}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <span className="row-val">{fm(prod.tipo === 'fijo' ? (stockSanidad[prod.id] || 0) : (prod.stock || 0))} ml</span>
              <button className="btn-icon" onClick={() => setBuySanId(prod.id)}>
                <Icono nombre="plus" tamaño={14} />
              </button>
            </div>
          </div>
        ))}
        <button className="btn btn-sm w-full mt-8" onClick={() => setShowSan(true)}>
          <Icono nombre="plus" tamaño={14} /> Agregar inyectable
        </button>
      </div>

      {showSup && (
        <ModalForm
          titulo="Nuevo suplemento"
          campos={[
            { nombre: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ej: Levadura' },
            { nombre: 'gramos', label: 'Gramos por kg', tipo: 'number', placeholder: '50' },
            { nombre: 'precio', label: 'Precio por kg ($)', tipo: 'number', placeholder: '0' },
          ]}
          onConfirm={addSuplemento}
          onCancel={() => setShowSup(false)}
        />
      )}
      {showSan && (
        <ModalForm
          titulo="Nuevo inyectable"
          campos={[
            { nombre: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ej: Antibiótico' },
            { nombre: 'dosis', label: 'Dosis (ml/kg)', tipo: 'number', placeholder: '50' },
            { nombre: 'efecto', label: 'Días de efecto', tipo: 'number', placeholder: '30' },
            { nombre: 'retiro', label: 'Días de retiro', tipo: 'number', placeholder: '0' },
          ]}
          onConfirm={addSanidad}
          onCancel={() => setShowSan(false)}
        />
      )}
      {buySupId && (
        <ModalInput
          titulo="Comprar suplemento"
          placeholder="kg, costo total"
          onConfirm={buySuplemento}
          onCancel={() => setBuySupId(null)}
        />
      )}
      {buySanId && (
        <ModalInput
          titulo="Comprar inyectable"
          placeholder="ml, costo total"
          onConfirm={buySanidad}
          onCancel={() => setBuySanId(null)}
        />
      )}
    </div>
  )
}

export default Insumos
