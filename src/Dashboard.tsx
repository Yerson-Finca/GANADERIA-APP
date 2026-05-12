import React, { useState, useEffect } from 'react'
import { db } from './db'
import {
  Animal, fm, getGMD, getDietaCompleta, getCostoDiario, getRendimiento,
  predecirPeso, getEficiencia, getAlertasLote, getEtapaCompleta, getSemaforo,
  ALIMENTOS, IC_ALIMENTOS, NM_ALIMENTOS
} from './calculos'
import Icono from './iconos'

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

  useEffect(() => {
    db.aplicaciones.toArray().then(setAplicaciones)
  }, [])

  if (animales.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="text-5xl mb-4">🐄</div>
        <p className="text-text-secondary">No hay animales registrados</p>
        <p className="text-text-muted text-xs mt-2">Toca el botón ➕ para agregar el primero</p>
      </div>
    )
  }

  // Cálculos generales
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
  const tendenciaGlobal = gmdL > 0.35 ? '🚀 Acelerando' : gmdL > 0.25 ? '📊 Estable' : '📉 Cayendo'

  // Agrupar por lotes
  const lotesMap: Record<string, { nombre: string; tipo: string; animales: Animal[] }> = {}
  animales.forEach(a => {
    const lid = a.lote || '__sin_lote__'
    if (!lotesMap[lid]) lotesMap[lid] = { nombre: lid === '__sin_lote__' ? 'Sin Lote' : '', tipo: '', animales: [] }
    lotesMap[lid].animales.push(a)
  })

  // Ranking
  const ranking = [...animales].sort((a, b) => getGMD(b.historial) - getGMD(a.historial))

  // Buscador
  const [busqueda, setBusqueda] = useState('')
  const animalesFiltrados = busqueda
    ? animales.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : animales

  const actualizarPrecioKG = async () => {
    const { setConfig } = await import('./db')
    await setConfig('precioKG', precioKGInput)
    recargar()
    if ((window as any).haptic) (window as any).haptic()
  }

  if (soloAnimales) {
    return (
      <div>
        {/* Buscador */}
        <div className="mb-3">
          <input
            className="input"
            placeholder="🔍 Buscar animal..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="card-sm mb-3">
          <div className="capital-value">$ {fm(totalKg * precioKG)}</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-bg rounded-xl p-2.5 border border-border">
              <div className="row-label">🐄 Cabezas</div>
              <div className="row-val">{ta}</div>
            </div>
            <div className="bg-bg rounded-xl p-2.5 border border-border">
              <div className="row-label">⚖️ Peso</div>
              <div className="row-val">{fm(totalKg)} kg</div>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="ia-card">
          <div className="ia-title"><Icono nombre="star" tamaño={14} variante="solid" /> RANKING</div>
          {ranking.slice(0, 3).map((a, i) => (
            <div key={a.id} className="ranking-item" onClick={() => verPerfil(a.id!)}>
              <span>{['🥇', '🥈', '🥉'][i]}</span>
              <b>{a.nombre}</b>: +{getGMD(a.historial).toFixed(2)} kg/d
            </div>
          ))}
        </div>

        {/* Grid de animales */}
        <div className="section-title">🐄 TODOS</div>
        <div className="grid grid-cols-2 gap-2.5">
          {animalesFiltrados.map(a => {
            const cp = a.historial[a.historial.length - 1].peso
            const etapa = getEtapaCompleta(cp, a.tipo, a.estadoRepro)
            const r = getRendimiento(a.historial)
            const ledMap: Record<string, string> = { verde: 'led-green', azul: 'led-blue', naranja: 'led-orange', rojo: 'led-red', gris: 'led-gray' }
            const sem = getSemaforo(a)
            return (
              <div key={a.id} className={`animal-card ${etapa.cardClass}`} onClick={() => verPerfil(a.id!)}>
                <div className={`mini-led ${ledMap[r.nivel] || 'led-gray'}`} />
                <div className="animal-avatar">{a.foto ? <img src={a.foto} alt={a.nombre} /> : etapa.icono}</div>
                <div className="name">{a.nombre}{sem && <span className={`semaforo semaforo-${sem.color}`} />}</div>
                <span className={`etapa-tag ${etapa.clase}`}>{etapa.rango}</span>
                <div className="weight">{fm(cp)} kg</div>
                <div className="cm" style={{ color: r.cm >= 0 ? '#22C55E' : '#EF4444' }}>
                  {r.cm >= 0 ? '+' : ''}{r.cm.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Dashboard principal
  return (
    <div>
      {/* Precio KG */}
      <div className="card-sm mb-3 border-accent/30">
        <div className="font-semibold text-accent text-sm mb-2">
          <Icono nombre="currency-dollar" tamaño={16} /> PRECIO KG EN PIE
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-accent">$</span>
          <input
            className="input flex-1 text-center font-bold text-lg"
            type="number"
            value={precioKGInput}
            onChange={e => setPrecioKGInput(parseFloat(e.target.value) || 0)}
            inputMode="decimal"
          />
          <span className="text-xs text-text-muted">COP</span>
          <button className="btn btn-green btn-sm" onClick={actualizarPrecioKG}>
            <Icono nombre="check-circle" tamaño={14} variante="solid" />
          </button>
        </div>
      </div>

      {/* Capital */}
      <div className="card-sm mb-3">
        <div className="capital-value">$ {fm(totalKg * precioKG)}</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-bg rounded-xl p-2.5 border border-border">
            <div className="row-label"><Icono nombre="list-bullet" tamaño={12} /> Cabezas</div>
            <div className="row-val">{ta}</div>
          </div>
          <div className="bg-bg rounded-xl p-2.5 border border-border">
            <div className="row-label"><Icono nombre="scale" tamaño={12} /> Peso Total</div>
            <div className="row-val">{fm(totalKg)} kg</div>
          </div>
        </div>
      </div>

      {/* IA */}
      <div className="ia-card">
        <div className="ia-title"><Icono nombre="sparkles" tamaño={14} variante="solid" /> IA DEL SISTEMA</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="proyeccion-item">
            <div className="proyeccion-dias">EFICIENCIA</div>
            <div className="proyeccion-peso" style={{ color: efData.color }}>{eficienciaGlobal}%</div>
            <div className="proyeccion-ganancia">{efData.texto}</div>
          </div>
          <div className="proyeccion-item">
            <div className="proyeccion-dias">TENDENCIA</div>
            <div className="proyeccion-peso">{tendenciaGlobal}</div>
            <div className="proyeccion-ganancia">GMD: {gmdL.toFixed(2)}</div>
          </div>
          <div className="proyeccion-item">
            <div className="proyeccion-dias">PESO HOY</div>
            <div className="proyeccion-peso">{fm(totalKg)} kg</div>
            <div className="proyeccion-ganancia">$ {fm(totalKg * precioKG)}</div>
          </div>
          <div className="proyeccion-item">
            <div className="proyeccion-dias">30 DÍAS</div>
            <div className="proyeccion-peso">{fm(pesoProy30)} kg</div>
            <div className="proyeccion-ganancia" style={{ color: gan30 >= 0 ? '#22C55E' : '#EF4444' }}>
              {gan30 >= 0 ? '+' : ''}$ {fm(Math.abs(gan30))}
            </div>
          </div>
        </div>
        <div className="text-[0.6rem] text-text-muted">
          📊 🟢{distRend.verde || 0} 🟡{distRend.naranja || 0} 🔵{distRend.azul || 0} 🔴{distRend.rojo || 0}
        </div>
        {mejorA && (
          <div className="ranking-item mt-1" onClick={() => verPerfil(mejorA.id)}>
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
        <div className="card-sm mb-3">
          <div className="font-bold text-xs text-text-muted mb-2">🔔 ALERTAS ({alertasL.length})</div>
          {alertasL.slice(0, 3).map((al, i) => (
            <div key={i} className={`alert-item ${al.t === 'r' ? 'alert-danger' : al.t === 'purple' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' : 'alert-warning'}`}>
              {al.icon} <span dangerouslySetInnerHTML={{ __html: al.m }} />
            </div>
          ))}
        </div>
      )}

      {/* Lotes */}
      <div className="section-title"><Icono nombre="cube" tamaño={12} /> LOTES</div>
      {Object.entries(lotesMap).map(([lid, data]) => {
        const kgL = data.animales.reduce((s, a) => s + a.historial[a.historial.length - 1].peso, 0)
        const gmdArr = data.animales.map(a => getGMD(a.historial)).filter(g => g !== 0)
        const gmdLote = gmdArr.length > 0 ? gmdArr.reduce((a, b) => a + b, 0) / gmdArr.length : 0
        const tipoIcono = data.animales[0]?.tipo === 'engorde' ? '🥩' : '🥛'
        return (
          <div key={lid} className="lote-card" onClick={() => {/* filtrar por lote */}}>
            <div className="lote-nombre">
              <span>{tipoIcono} {data.nombre || 'Sin Lote'}</span>
              <span className="text-[0.6rem] text-text-muted">{data.animales.length} anim.</span>
            </div>
            <div className="lote-stats">
              <div className="lote-stat"><div className="val">{fm(kgL)} kg</div><div className="lbl">Peso</div></div>
              <div className="lote-stat"><div className="val">{gmdLote.toFixed(2)}</div><div className="lbl">GMD</div></div>
            </div>
          </div>
        )
      })}

      {/* Destacados */}
      <div className="card-sm mt-3">
        <div className="font-bold text-xs text-text-muted mb-2">🐄 DESTACADOS</div>
        {ranking.slice(0, 3).map((a, i) => (
          <div key={a.id} className="ranking-item" onClick={() => verPerfil(a.id!)}>
            <span>{['🥇', '🥈', '🥉'][i]}</span>
            <b>{a.nombre}</b>: +{getGMD(a.historial).toFixed(2)} kg/d
          </div>
        ))}
        <button className="btn btn-gray btn-sm w-full mt-2" onClick={() => cambiarPagina('animales')}>
          VER TODOS →
        </button>
      </div>

      {/* Finanzas */}
      <div className="card-sm mt-3">
        <div className="font-bold text-xs text-text-muted mb-2">
          <Icono nombre="currency-dollar" tamaño={12} /> FINANZAS
        </div>
        <div className="row">
          <span className="row-label">Alimentación/día</span>
          <span className="row-val">$ {fm(costoTotal)}</span>
        </div>
        <div className="row">
          <span className="row-label">Ganancia/mes</span>
          <span className="row-val" style={{ color: gan >= 0 ? '#22C55E' : '#EF4444' }}>
            $ {fm(gan)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
