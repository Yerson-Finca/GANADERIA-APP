import React, { useState, useEffect } from 'react'
import { db } from './db'
import {
  Animal, fm, getGMD, getDietaCompleta, getCostoDiario, getRendimiento,
  predecirPeso, getEficiencia, getAlertasLote, getEtapaCompleta, getSemaforo,
  ALIMENTOS, IC_ALIMENTOS, NM_ALIMENTOS
} from './calculos'

interface Props {
  animales: Animal[]
  preciosAlimento: Record<string, number>
  stockAlimento: Record<string, number>
  precioKG: number
  litroLeche: number
  verPerfil: (id: number) => void
  cambiarPagina: (p: string) => void
  recargar: () => void
  soloAnimales?: boolean
}

const Dashboard: React.FC<Props> = ({
  animales, preciosAlimento, stockAlimento, precioKG, litroLeche,
  verPerfil, cambiarPagina, recargar, soloAnimales
}) => {
  const [precioKGInput, setPrecioKGInput] = useState(precioKG)
  const [aplicaciones, setAplicaciones] = useState<any[]>([])

  useEffect(() => { db.aplicaciones.toArray().then(setAplicaciones) }, [])

  if (animales.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">🐄</div>
        <p className="text-text-secondary text-sm">No hay animales registrados</p>
        <p className="text-text-muted text-xs mt-1">Toca ➕ para agregar</p>
      </div>
    )
  }

  // Cálculos
  let totalKg = 0, costoTotal = 0, pesoProy30 = 0, gmdTotal = 0, countGMD = 0
  const mez: Record<string, number> = {}
  ALIMENTOS.forEach(a => mez[a] = 0)
  const distRend: Record<string, number> = { verde: 0, azul: 0, naranja: 0, rojo: 0, gris: 0 }
  let mejorA: any = null, peorA: any = null

  animales.forEach(a => {
    const cp = a.historial[a.historial.length - 1].peso
    totalKg += cp
    const d = getDietaCompleta(cp, a.tipo, a.estadoRepro)
    ALIMENTOS.forEach(k => mez[k] = (mez[k] || 0) + (d[k as keyof typeof d] as number || 0))
    costoTotal += getCostoDiario(cp, a.tipo, a.estadoRepro, preciosAlimento)
    const r = getRendimiento(a.historial)
    distRend[r.nivel] = (distRend[r.nivel] || 0) + 1
    const gmd = getGMD(a.historial)
    if (a.historial.length >= 2) { gmdTotal += gmd; countGMD++ }
    if (!mejorA || gmd > mejorA.gmd) mejorA = { nombre: a.nombre, gmd, id: a.id }
    if (!peorA || gmd < peorA.gmd) peorA = { nombre: a.nombre, gmd, id: a.id }
    const p30 = predecirPeso(a.historial, 30)
    if (p30) pesoProy30 += p30
  })

  const ta = animales.length
  const gmdL = countGMD > 0 ? gmdTotal / countGMD : 0
  const ingM = gmdL * 30 * precioKG * ta
  const cosM = costoTotal * 30
  const gan = ingM - cosM
  const valorProy30 = pesoProy30 * precioKG
  const gan30 = valorProy30 - (totalKg * precioKG)
  const eficienciaGlobal = ta > 0 ? Math.round(animales.reduce((s, a) => {
    const r = getRendimiento(a.historial); return s + r.pct
  }, 0) / ta) : 0
  const efData = getEficiencia(eficienciaGlobal)
  const alertasL = getAlertasLote(animales, stockAlimento, preciosAlimento, aplicaciones)

  const actualizarPrecio = async () => {
    const { setConfig } = await import('./db')
    await setConfig('precioKG', precioKGInput)
    recargar()
    if ((window as any).haptic) (window as any).haptic()
  }

  if (soloAnimales) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {animales.map(a => {
          const cp = a.historial[a.historial.length - 1].peso
          const etapa = getEtapaCompleta(cp, a.tipo, a.estadoRepro)
          const r = getRendimiento(a.historial)
          const sem = getSemaforo(a)
          return (
            <div key={a.id} className={`animal-card ${etapa.cardClass}`} onClick={() => verPerfil(a.id!)}>
              <div className="mini-led led-green" />
              <div className="animal-avatar">{a.foto ? <img src={a.foto} alt={a.nombre} /> : etapa.icono}</div>
              <div className="name">{a.nombre}{sem && <span className={`semaforo semaforo-${sem.color} ml-1`} />}</div>
              <span className={`etapa-tag ${etapa.clase}`}>{etapa.rango}</span>
              <div className="weight">{fm(cp)} kg</div>
              <div className="cm" style={{ color: r.cm >= 0 ? '#FDCC0D' : '#FF6B6B' }}>
                {r.cm >= 0 ? '+' : ''}{r.cm.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const ranking = [...animales].sort((a, b) => getGMD(b.historial) - getGMD(a.historial))

  return (
    <div className="flex flex-col gap-3">
      {/* Precio KG */}
      <div className="card-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary uppercase tracking-wider">Precio KG</span>
          <span className="text-[10px] text-success">● Live</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-lg font-black text-white">$</span>
          <input className="bg-transparent text-lg font-black text-white w-20 outline-none" type="number" value={precioKGInput} onChange={e => setPrecioKGInput(parseFloat(e.target.value) || 0)} />
          <span className="text-xs text-text-muted">COP</span>
          <button onClick={actualizarPrecio} className="btn btn-sm btn-green ml-auto">Actualizar</button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card-sm">
          <div className="text-xs text-text-muted mb-1">Peso Total</div>
          <div className="text-xl font-black text-white">{fm(totalKg)} kg</div>
          <div className="text-xs text-text-muted mt-1">{ta} animales</div>
        </div>
        <div className="card-sm">
          <div className="text-xs text-text-muted mb-1">Valor Est.</div>
          <div className="text-xl font-black text-white">$ {fm(totalKg * precioKG)}</div>
          <div className="text-xs text-success mt-1">GMD {gmdL.toFixed(2)}</div>
        </div>
      </div>

      {/* IA */}
      <div className="ia-card">
        <div className="ia-title">🧠 IA DEL SISTEMA</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="proyeccion-item">
            <div className="proyeccion-dias">EFICIENCIA</div>
            <div className="proyeccion-peso" style={{ color: efData.color }}>{eficienciaGlobal}%</div>
            <div className="proyeccion-ganancia">{efData.texto}</div>
          </div>
          <div className="proyeccion-item">
            <div className="proyeccion-dias">30 DÍAS</div>
            <div className="proyeccion-peso">{fm(pesoProy30)} kg</div>
            <div className="proyeccion-ganancia" style={{ color: gan30 >= 0 ? '#FDCC0D' : '#FF6B6B' }}>
              {gan30 >= 0 ? '+' : ''}$ {fm(Math.abs(gan30))}
            </div>
          </div>
        </div>
        {mejorA && (
          <div className="ranking-item" onClick={() => verPerfil(mejorA.id)}>
            🏆 Mejor: <b>{mejorA.nombre}</b> +{mejorA.gmd.toFixed(2)} kg/d
          </div>
        )}
        {peorA && ta > 1 && (
          <div className="ranking-item" onClick={() => verPerfil(peorA.id)}>
            ⚠️ Atención: <b>{peorA.nombre}</b> +{peorA.gmd.toFixed(2)} kg/d
          </div>
        )}
      </div>

      {/* Alertas */}
      {alertasL.length > 0 && (
        <div className="card-sm">
          <div className="font-bold text-xs text-white mb-1.5">🔔 ALERTAS ({alertasL.length})</div>
          {alertasL.slice(0, 3).map((al, i) => (
            <div key={i} className={`alert-item ${al.t === 'r' ? 'alert-danger' : 'alert-warning'}`}>
              {al.icon} <span dangerouslySetInnerHTML={{ __html: al.m }} />
            </div>
          ))}
        </div>
      )}

      {/* CONSUMO DIARIO TOTAL */}
      <div className="card-sm">
        <div className="font-bold text-xs text-white mb-1.5">🍽️ CONSUMO DIARIO TOTAL</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {ALIMENTOS.map(alim => (
            <div key={alim} className="row !py-1.5">
              <span className="row-label">{IC_ALIMENTOS[alim]} {NM_ALIMENTOS[alim]}</span>
              <span className="row-val text-xs">
                {alim === 'pasto' || alim === 'salvado'
                  ? (mez[alim] || 0).toFixed(1) + ' kg'
                  : Math.round(mez[alim] || 0) + ' g'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="card-sm">
        <div className="font-bold text-xs text-white mb-1.5">🏆 RANKING GMD</div>
        {ranking.slice(0, 3).map((a, i) => (
          <div key={a.id} className="ranking-item" onClick={() => verPerfil(a.id!)}>
            <span>{['🥇', '🥈', '🥉'][i]}</span>
            <b>{a.nombre}</b>: +{getGMD(a.historial).toFixed(2)} kg/d
          </div>
        ))}
        <button className="btn btn-sm btn-gray w-full mt-2" onClick={() => cambiarPagina('animales')}>
          Ver todos →
        </button>
      </div>

      {/* Finanzas */}
      <div className="card-sm">
        <div className="font-bold text-xs text-white mb-1.5">💰 FINANZAS</div>
        <div className="row"><span className="row-label">Alimentación/día</span><span className="row-val">$ {fm(costoTotal)}</span></div>
        <div className="row">
          <span className="row-label">Ganancia/mes</span>
          <span className="row-val" style={{ color: gan >= 0 ? '#FDCC0D' : '#FF6B6B' }}>$ {fm(gan)}</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
