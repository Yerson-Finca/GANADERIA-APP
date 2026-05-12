// 📂 Tipos
export interface Pesaje {
  fecha: string
  peso: number
}

export interface Animal {
  id?: number
  nombre: string
  tipo: 'engorde' | 'leche'
  historial: Pesaje[]
  estadoRepro?: string
  lote?: string | null
  foto?: string | null
  madre?: string | null
  fechaNacimiento?: string
  precioCompra?: number
  fechaCompra?: string
  produccionLeche?: { fecha: string; litros: number }[]
  fechaPrenez?: string | null
  fechaPartoEstimada?: string | null
  fechaSecado?: string | null
  fechaSecadoInicio?: string | null
  fechaParto?: string | null
  origen?: string
}

export interface EtapaCompleta {
  nombre: string
  clase: string
  icono: string
  rango: string
  color: string
  cardClass: string
  min?: number
  max?: number
  ureaBloqueada?: boolean
  siguienteEtapa?: string
}

export interface DietaDiaria {
  pasto: number
  salvado: number
  melaza: number
  urea: number
  bicarb: number
  sal: number
  levadura: number
  consumoTotal: number
}

export interface Rendimiento {
  nivel: string
  texto: string
  icono: string
  cm: number
  color: string
  pct: number
}

export interface Semaforo {
  color: string
  texto: string
  dias: number
}

interface MatrizDieta {
  melaza: number
  urea: number
  bicarb: number
  sal: number
}

// ==================== CATÁLOGOS ====================
export const ALIMENTOS = ['pasto', 'salvado', 'melaza', 'levadura', 'bicarb', 'sal', 'urea'] as const
export type Alimento = typeof ALIMENTOS[number]

export const IC_ALIMENTOS: Record<Alimento, string> = {
  pasto: '🌱', salvado: '🌾', melaza: '💧', levadura: '🧪', bicarb: '🧊', sal: '🧂', urea: '⚗️'
}

export const NM_ALIMENTOS: Record<Alimento, string> = {
  pasto: 'Pasto Picado', salvado: 'Salvado Trigo', melaza: 'Melaza',
  levadura: 'Levadura', bicarb: 'Bicarbonato', sal: 'Sal Mineral', urea: 'UREA'
}

export const CATALOGO_SANIDAD = [
  { id: 'modificador', nombre: 'Modificador Orgánico', dosis: 50, diasEfecto: 90, retiro: 0, icono: '🧪', color: '#22C55E', tipo: 'fijo' },
  { id: 'vitaminaA', nombre: 'Vitamina ADE', dosis: 50, diasEfecto: 60, retiro: 30, icono: '☀️', color: '#F5C842', tipo: 'fijo' },
  { id: 'complejoB', nombre: 'Complejo B (B12)', dosis: 50, diasEfecto: 20, retiro: 0, icono: '💊', color: '#60A5FA', tipo: 'fijo' },
  { id: 'ivermectina1', nombre: 'Ivermectina 1%', dosis: 50, diasEfecto: 30, retiro: 28, icono: '🛡️', color: '#EF4444', tipo: 'fijo' },
  { id: 'ivermectina315', nombre: 'Ivermectina 3.15%', dosis: 50, diasEfecto: 90, retiro: 122, icono: '🛡️', color: '#EF4444', tipo: 'fijo' },
  { id: 'fosforo', nombre: 'Fósforo B12', dosis: 20, diasEfecto: 30, retiro: 0, icono: '🦴', color: '#A78BFA', tipo: 'fijo' },
  { id: 'hierro', nombre: 'Hierro Dextrano', dosis: 100, diasEfecto: 30, retiro: 0, icono: '💧', color: '#F87171', tipo: 'fijo' }
]

// ==================== MATRICES ====================
export const MATRIZ_ENGORDE: Record<string, MatrizDieta> = {
  'Cría': { melaza: 2, urea: 0, bicarb: 0.10, sal: 0.15 },
  'Levante': { melaza: 3, urea: 0.11, bicarb: 0.125, sal: 0.20 },
  'Ceba': { melaza: 5, urea: 0.11, bicarb: 0.15, sal: 0.20 },
  'Venta': { melaza: 5, urea: 0.11, bicarb: 0.15, sal: 0.20 }
}

export const MATRIZ_LECHE: Record<string, MatrizDieta> = {
  'Novilla': { melaza: 1, urea: 0.05, bicarb: 0.10, sal: 0.25 },
  'Parida': { melaza: 3, urea: 0.08, bicarb: 0.20, sal: 0.50 },
  'Seca': { melaza: 1, urea: 0.05, bicarb: 0.10, sal: 0.20 },
  'Venta': { melaza: 5, urea: 0.11, bicarb: 0.15, sal: 0.20 }
}

// ==================== UTILIDADES ====================
export function fm(n: number): string {
  if (isNaN(n) || n === null) return '0'
  n = Math.round(n)
  let s = String(n), r = '', c = 0
  for (let i = s.length - 1; i >= 0; i--) {
    if (c > 0 && c % 3 === 0) r = '.' + r
    r = s.charAt(i) + r
    c++
  }
  return r
}

export function getDiasDesde(f: string): number {
  if (!f) return 999
  const p = f.split('/')
  if (p.length < 3) return 999
  return Math.floor((new Date().getTime() - new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime()) / 86400000)
}

// ==================== ETAPAS ====================
export function getEtapa(pv: number, tipo: string): string {
  if (tipo === 'leche') return pv < 350 ? 'Novilla' : 'Parida'
  if (pv < 150) return 'Cría'
  if (pv < 350) return 'Levante'
  if (pv < 500) return 'Ceba'
  return 'Venta'
}

export function getEtapaCompleta(pv: number, tipo: string, estadoRepro?: string): EtapaCompleta {
  if (tipo === 'leche') {
    if (estadoRepro === 'venta') return { nombre: 'Venta', clase: 'etapa-madurez', icono: '🦬', rango: 'Venta (Descarte)', color: '#EF4444', cardClass: 'animal-card-madurez' }
    if (estadoRepro === 'seca') return { nombre: 'Seca', clase: 'etapa-desarrollo', icono: '🐄', rango: 'Seca (Descanso)', color: '#60A5FA', cardClass: 'animal-card-desarrollo' }
    if (estadoRepro === 'parida') return { nombre: 'Parida', clase: 'etapa-ceba', icono: '🐄', rango: 'Parida (Producción)', color: '#F59E0B', cardClass: 'animal-card-ceba' }
    if (pv < 350) return { nombre: 'Novilla', clase: 'etapa-inicio', icono: '🐄', rango: 'Novilla', color: '#F5C842', cardClass: 'animal-card-inicio' }
    return { nombre: 'Parida', clase: 'etapa-ceba', icono: '🐄', rango: 'Parida', color: '#F59E0B', cardClass: 'animal-card-ceba' }
  }
  if (pv < 150) return { nombre: 'Cría', clase: 'etapa-inicio', icono: '🐮', rango: 'Cría', min: 0, max: 150, ureaBloqueada: true, color: '#F5C842', cardClass: 'animal-card-inicio', siguienteEtapa: 'Levante' }
  if (pv < 350) return { nombre: 'Levante', clase: 'etapa-desarrollo', icono: '🐂', rango: 'Levante', min: 150, max: 350, ureaBloqueada: false, color: '#60A5FA', cardClass: 'animal-card-desarrollo', siguienteEtapa: 'Ceba' }
  if (pv < 500) return { nombre: 'Ceba', clase: 'etapa-ceba', icono: '🐃', rango: 'Ceba', min: 350, max: 500, ureaBloqueada: false, color: '#F59E0B', cardClass: 'animal-card-ceba', siguienteEtapa: 'Venta' }
  return { nombre: 'Venta', clase: 'etapa-madurez', icono: '🦬', rango: 'Venta', min: 500, max: 9999, ureaBloqueada: false, color: '#EF4444', cardClass: 'animal-card-madurez' }
}

export function getProgresoEtapa(pv: number, e: EtapaCompleta): number {
  return Math.min(100, Math.max(0, ((pv - (e.min || 0)) / ((e.max || 9999) - (e.min || 0))) * 100))
}

// ==================== DIETA ====================
export function getDietaCompleta(pv: number, tipo: string, estadoRepro?: string): DietaDiaria {
  let etapa = getEtapa(pv, tipo)
  const matriz = tipo === 'leche' ? MATRIZ_LECHE : MATRIZ_ENGORDE
  if (tipo === 'leche' && estadoRepro === 'seca') etapa = 'Seca'
  if (tipo === 'leche' && estadoRepro === 'venta') etapa = 'Venta'
  if (tipo === 'leche' && estadoRepro === 'parida') etapa = 'Parida'
  const m = matriz[etapa] || MATRIZ_ENGORDE['Levante']
  const consumoTotal = pv * 0.03
  const melazaKg = consumoTotal * (m.melaza / 100)

  return {
    pasto: consumoTotal * 0.90,
    salvado: consumoTotal * 0.10,
    melaza: melazaKg * 1000,
    urea: (pv < 150 && tipo === 'engorde') ? 0 : (pv * m.urea),
    bicarb: pv * m.bicarb,
    sal: pv * m.sal,
    levadura: pv * 0.05,
    consumoTotal
  }
}

// ==================== GMD Y RENDIMIENTO ====================
export function getGMD(historial: Pesaje[]): number {
  if (historial.length < 2) return 0
  return (historial[historial.length - 1].peso - historial[historial.length - 2].peso) / 30
}

export function getRendimiento(historial: Pesaje[]): Rendimiento {
  if (historial.length < 2) return { nivel: 'azul', texto: 'Registre más', icono: 'ℹ️', cm: 0, color: 'azul', pct: 0 }
  const act = historial[historial.length - 1].peso
  const ant = historial[historial.length - 2].peso
  const cm = ((act - ant) / ant) * 100
  const pct = Math.min(100, Math.max(0, 50 + cm * 10))
  if (act < ant) return { nivel: 'gris', texto: 'Pérdida', icono: '⚠️', cm, color: 'gris', pct: Math.max(5, 30 + cm * 10) }
  if (cm >= 5) return { nivel: 'verde', texto: 'Excelente', icono: '👑', cm, color: 'verde', pct: Math.min(100, 80 + cm) }
  if (cm >= 3.5) return { nivel: 'azul', texto: 'Bueno', icono: '✅', cm, color: 'azul', pct: Math.min(79, 65 + cm * 2) }
  if (cm >= 2.5) return { nivel: 'naranja', texto: 'Regular', icono: '⚠️', cm, color: 'naranja', pct: Math.min(64, 45 + cm * 4) }
  return { nivel: 'rojo', texto: 'Bajo', icono: '❌', cm, color: 'rojo', pct: Math.min(44, 20 + cm * 6) }
}

// ==================== COSTOS ====================
export function getCostoDiario(pv: number, tipo: string, estadoRepro: string | undefined, precios: Record<string, number>): number {
  const d = getDietaCompleta(pv, tipo, estadoRepro)
  return (d.pasto || 0) * (precios.pasto || 0) +
    (d.salvado || 0) * (precios.salvado || 0) +
    ((d.melaza || 0) / 1000) * (precios.melaza || 0) +
    ((d.urea || 0) / 1000) * (precios.urea || 0) +
    ((d.bicarb || 0) / 1000) * (precios.bicarb || 0) +
    ((d.sal || 0) / 1000) * (precios.sal || 0) +
    ((d.levadura || 0) / 1000) * (precios.levadura || 0)
}

// ==================== IA ====================
export function predecirPeso(historial: Pesaje[], diasFuturo: number): number | null {
  if (historial.length < 3) return null
  const n = historial.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  const p0 = historial[0].fecha.split('/')
  const fb = new Date(parseInt(p0[2]), parseInt(p0[1]) - 1, parseInt(p0[0]))
  if (isNaN(fb.getTime())) return null

  for (let i = 0; i < n; i++) {
    const pi = historial[i].fecha.split('/')
    const fa = new Date(parseInt(pi[2]), parseInt(pi[1]) - 1, parseInt(pi[0]))
    if (isNaN(fa.getTime())) continue
    const dr = Math.floor((fa.getTime() - fb.getTime()) / 86400000)
    sumX += dr; sumY += historial[i].peso
    sumXY += dr * historial[i].peso; sumX2 += dr * dr
  }

  const den = (n * sumX2 - sumX * sumX)
  if (den === 0) return null
  const m = (n * sumXY - sumX * sumY) / den
  const b = (sumY - m * sumX) / n
  const pu = historial[n - 1].fecha.split('/')
  const fu = new Date(parseInt(pu[2]), parseInt(pu[1]) - 1, parseInt(pu[0]))
  return m * (Math.floor((fu.getTime() - fb.getTime()) / 86400000) + diasFuturo) + b
}

export function getConfianzaPrediccion(historial: Pesaje[]): string {
  if (historial.length < 3) return 'Baja'
  const cm: number[] = []
  for (let i = 1; i < historial.length; i++) cm.push(historial[i].peso - historial[i - 1].peso)
  const med = cm.reduce((a, b) => a + b, 0) / cm.length
  if (med === 0) return 'Baja'
  const vr = cm.reduce((a, b) => a + Math.pow(b - med, 2), 0) / cm.length
  const cv = Math.sqrt(vr) / Math.abs(med)
  if (cv < 0.3) return 'Alta'
  if (cv < 0.6) return 'Media'
  return 'Baja'
}

export function getTendenciaTexto(historial: Pesaje[]): string {
  if (historial.length < 2) return '📊 Estable'
  let c = 0
  for (let i = 1; i < historial.length; i++) {
    if (historial[i].peso > historial[i - 1].peso) c++
    else if (historial[i].peso < historial[i - 1].peso) c--
  }
  if (c > 0) return '📈 Mejorando'
  if (c < 0) return '📉 Empeorando'
  return '📊 Estable'
}

export function getEficiencia(pct: number): { texto: string; color: string } {
  if (pct >= 85) return { texto: 'Excelente', color: '#22C55E' }
  if (pct >= 70) return { texto: 'Buena', color: '#60A5FA' }
  if (pct >= 50) return { texto: 'Regular', color: '#F59E0B' }
  return { texto: 'Crítica', color: '#EF4444' }
}

export function getSemaforo(animal: Animal): Semaforo | null {
  if (animal.tipo !== 'leche' || animal.estadoRepro !== 'parida' || !animal.fechaParto) return null
  let diasPostParto = getDiasDesde(animal.fechaParto)
  if (diasPostParto > 365) diasPostParto = 365
  if (diasPostParto <= 150) return { color: 'verde', texto: 'Ventana óptima', dias: diasPostParto }
  if (diasPostParto <= 180) return { color: 'amarillo', texto: 'Revisar nutrición', dias: diasPostParto }
  return { color: 'rojo', texto: 'Evaluar rentabilidad', dias: diasPostParto }
}

export function getDiasParaMeta(pesoActual: number, meta: number, gmd: number): number {
  if (gmd <= 0) return 9999
  return Math.round((meta - pesoActual) / gmd)
}

export function detectarAnomalia(historial: Pesaje[], pesoNuevo: number): boolean {
  if (historial.length < 4) return false
  let suma = 0
  for (let i = 1; i < historial.length; i++) suma += historial[i].peso - historial[i - 1].peso
  const media = suma / (historial.length - 1)
  const diff = pesoNuevo - historial[historial.length - 1].peso
  return Math.abs(diff - media) > (Math.abs(media) * 2)
}

export function getAlertasLote(
  animales: Animal[],
  stockAlimento: Record<string, number>,
  preciosAlimento: Record<string, number>,
  aplicaciones: any[]
): any[] {
  const alertas: any[] = []
  const mez: Record<string, number> = { pasto: 0, salvado: 0, sal: 0, melaza: 0, urea: 0, levadura: 0, bicarb: 0 }

  animales.forEach(a => {
    const d = getDietaCompleta(a.historial[a.historial.length - 1].peso, a.tipo, a.estadoRepro)
    for (const k of ALIMENTOS) mez[k] = (mez[k] || 0) + (d[k as keyof DietaDiaria] || 0)
  })

  for (const alim of ALIMENTOS) {
    const st = stockAlimento[alim] || 0
    const co = mez[alim] || 0
    const cr = (alim === 'pasto' || alim === 'salvado') ? co : co / 1000
    if (st > 0 && cr > 0 && st / cr < 3) {
      alertas.push({ t: 'r', m: `<b>${NM_ALIMENTOS[alim]}</b>: Stock ${Math.round(st / cr)}d`, icon: IC_ALIMENTOS[alim] })
    }
  }

  animales.forEach(a => {
    const du = getDiasDesde(a.historial[a.historial.length - 1].fecha)
    if (du > 30) alertas.push({ t: 'w', m: `<b>${a.nombre}</b>: Pesaje vencido (${du}d)`, icon: '📅' })
    const peso = a.historial[a.historial.length - 1].peso
    if (peso >= 500 && a.tipo === 'engorde') alertas.push({ t: 'r', m: `<b>${a.nombre}</b>: ¡VENDER! ${fm(peso)}kg`, icon: '💰' })
    let ti = false
    for (let i = aplicaciones.length - 1; i >= 0; i--) {
      if (aplicaciones[i].animalId === a.id && (aplicaciones[i].productoId === 'ivermectina1' || aplicaciones[i].productoId === 'ivermectina315') && getDiasDesde(aplicaciones[i].fecha) < 90) {
        ti = true; break
      }
    }
    if (!ti && peso >= 150) alertas.push({ t: 'purple', m: `<b>${a.nombre}</b>: Desparasitación vencida`, icon: '🛡️' })
  })

  return alertas
}
