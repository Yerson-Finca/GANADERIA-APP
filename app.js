// 📂 ganadero-elite/app.js - GANADERO ÉLITE v4.0.1 - COMPLETO Y FUNCIONAL
console.log('🧠 GANADERO ÉLITE v4.0.1 - IA PREDICTIVA TOTAL');

// ==================== UTILIDADES ====================
function fm(n) { if (isNaN(n) || n === null || n === undefined) return '0'; n = Math.round(n); var s = String(n), r = '', c = 0; for (var i = s.length - 1; i >= 0; i--) { if (c > 0 && c % 3 === 0) r = '.' + r; r = s.charAt(i) + r; c++; } return r; }
function showToast(m, d) { d = d || 3000; var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.getElementById('toastContainer').appendChild(t); setTimeout(function() { if (t.parentNode) t.remove(); }, d); }
function showModal(h) { var o = document.createElement('div'); o.className = 'modal-overlay'; o.innerHTML = '<div class="modal">' + h + '</div>'; o.querySelector('.modal').onclick = function(e) { e.stopPropagation(); }; o.onclick = function(e) { if (e.target === o) o.remove(); }; document.getElementById('modalContainer').appendChild(o); }
function showConfirm(msg, callback) { showModal('<div class="modal-title">⚠️ Confirmar</div><p style="margin-bottom:12px;font-size:.8rem;">' + msg + '</p><div class="flex-col gap10"><button class="btn btn-gold" id="confirmYes">SÍ</button><button class="btn btn-gray" id="confirmNo">CANCELAR</button></div>'); setTimeout(function() { document.getElementById('confirmYes').onclick = function() { document.querySelector('.modal-overlay').remove(); callback(true); }; document.getElementById('confirmNo').onclick = function() { document.querySelector('.modal-overlay').remove(); callback(false); }; }, 50); }
function showInput(label, placeholder, callback) { showModal('<div class="modal-title">📝 Input</div><div class="flex-col gap10"><div style="font-size:.75rem;color:var(--muted);">' + label + '</div><input id="inputVal" type="text" placeholder="' + placeholder + '"><button class="btn btn-gold" id="inputOk">OK</button><button class="btn btn-gray" id="inputCancel">CANCELAR</button></div>'); setTimeout(function() { document.getElementById('inputVal').focus(); document.getElementById('inputOk').onclick = function() { var v = document.getElementById('inputVal').value.trim(); document.querySelector('.modal-overlay').remove(); callback(v); }; document.getElementById('inputCancel').onclick = function() { document.querySelector('.modal-overlay').remove(); callback(null); }; }, 50); }
function escapeHTML(str) { var div = document.createElement('div'); div.appendChild(document.createTextNode(str)); return div.innerHTML; }
function getIconoAnimal(a) { if (a.foto && a.foto.length > 100) return '<img src="' + a.foto + '" alt="">'; var etapa = getEtapaCompleta(a.historial[a.historial.length-1].peso, a.tipo, a.estadoRepro); return etapa.icono; }

// ==================== BASE DE DATOS ====================
var DB = { version: '4.0.1', animales: [], aplicaciones: [], lotes: [], precios: { pasto:1200, salvado:2500, melaza:3800, levadura:8000, bicarb:4500, sal:6200, urea:9500 }, stock: { pasto:500, salvado:200, melaza:50, levadura:10, bicarb:5, sal:2, urea:20 }, stockSanidad: {}, preciosSanidad: {}, suplementosAlimento: [], suplementosSanidad: [], precioKG: 9800, litroLeche: 1500 };
var fotosDB = {};

function migrateDB() { if (!DB.version) DB.version = '4.0.0'; if (!DB.aplicaciones) DB.aplicaciones = []; if (!DB.lotes) DB.lotes = []; if (!DB.preciosSanidad) DB.preciosSanidad = {}; if (!DB.suplementosAlimento) DB.suplementosAlimento = []; if (!DB.suplementosSanidad) DB.suplementosSanidad = []; if (!DB.stockSanidad) DB.stockSanidad = {}; if (!DB.litroLeche) DB.litroLeche = 1500; DB.version = '4.0.1'; }
function cargarDatos() { try { var s = localStorage.getItem('ganadero_elite_v10'); if (s) { DB = JSON.parse(s); migrateDB(); } } catch(e) { console.error('Error DB:', e); } try { var f = localStorage.getItem('ganadero_fotos'); if (f) { fotosDB = JSON.parse(f); for (var i = 0; i < DB.animales.length; i++) { if (fotosDB[DB.animales[i].id]) DB.animales[i].foto = fotosDB[DB.animales[i].id]; } } } catch(e) {} }
function save() { try { var copia = JSON.parse(JSON.stringify(DB)); for (var i = 0; i < copia.animales.length; i++) { if (copia.animales[i].foto && copia.animales[i].foto.length > 100) { fotosDB[copia.animales[i].id] = copia.animales[i].foto; copia.animales[i].foto = '[FOTO]'; } } localStorage.setItem('ganadero_elite_v10', JSON.stringify(copia)); localStorage.setItem('ganadero_fotos', JSON.stringify(fotosDB)); } catch(e) { showToast('⚠️ Error guardando'); } }

// ==================== CATÁLOGOS ====================
var ALIMENTOS = ['pasto','salvado','melaza','levadura','bicarb','sal','urea'];
var IC_ALIMENTOS = { pasto:'🌱', salvado:'🌾', melaza:'💧', levadura:'🧪', bicarb:'🧊', sal:'🧂', urea:'⚗️' };
var NM_ALIMENTOS = { pasto:'Pasto Picado', salvado:'Salvado Trigo', melaza:'Melaza', levadura:'Levadura', bicarb:'Bicarbonato', sal:'Sal Mineral', urea:'UREA' };
var CATALOGO_SANIDAD = [
    { id:'modificador', nombre:'Modificador Orgánico', dosis:50, diasEfecto:90, retiro:0, icono:'🧪', color:'#22c55e', tipo:'fijo', impactoGMD:0.05 },
    { id:'vitaminaA', nombre:'Vitamina ADE', dosis:50, diasEfecto:60, retiro:30, icono:'☀️', color:'#fbbf24', tipo:'fijo', impactoGMD:0.02 },
    { id:'complejoB', nombre:'Complejo B (B12)', dosis:50, diasEfecto:20, retiro:0, icono:'💊', color:'#3b82f6', tipo:'fijo', impactoGMD:0.03 },
    { id:'ivermectina1', nombre:'Ivermectina 1%', dosis:50, diasEfecto:30, retiro:28, icono:'🛡️', color:'#ef4444', tipo:'fijo', impactoGMD:0.04 },
    { id:'ivermectina315', nombre:'Ivermectina 3.15%', dosis:50, diasEfecto:90, retiro:122, icono:'🛡️', color:'#dc2626', tipo:'fijo', impactoGMD:0.04 },
    { id:'fosforo', nombre:'Fósforo B12', dosis:20, diasEfecto:30, retiro:0, icono:'🦴', color:'#a78bfa', tipo:'fijo', impactoGMD:0.01 },
    { id:'hierro', nombre:'Hierro Dextrano', dosis:100, diasEfecto:30, retiro:0, icono:'💧', color:'#f87171', tipo:'fijo', impactoGMD:0.01 }
];
function getCatalogoSanidadCompleto() { return CATALOGO_SANIDAD.concat(DB.suplementosSanidad || []); }

// ==================== MATRICES & LÓGICA ====================
var MATRIZ_ENGORDE = { 'Cría': { melaza:2, urea:0, bicarb:0.10, sal:0.15 }, 'Levante': { melaza:3, urea:0.11, bicarb:0.125, sal:0.20 }, 'Ceba': { melaza:5, urea:0.11, bicarb:0.15, sal:0.20 }, 'Venta': { melaza:5, urea:0.11, bicarb:0.15, sal:0.20 } };
var MATRIZ_LECHE = { 'Novilla': { melaza:1, urea:0.05, bicarb:0.10, sal:0.25 }, 'Parida': { melaza:3, urea:0.08, bicarb:0.20, sal:0.50 }, 'Seca': { melaza:1, urea:0.05, bicarb:0.10, sal:0.20 }, 'Venta': { melaza:5, urea:0.11, bicarb:0.15, sal:0.20 } };
function getEtapa(pv, tipo) { if (tipo === 'leche') { if (pv < 350) return 'Novilla'; return 'Parida'; } if (pv < 150) return 'Cría'; if (pv < 350) return 'Levante'; if (pv < 500) return 'Ceba'; return 'Venta'; }
function getEtapaCompleta(pv, tipo, estadoRepro) {
    if (tipo === 'leche') {
        if (estadoRepro === 'venta') return { nombre:'Venta', clase:'etapa-madurez', icono:'🦬', rango:'Venta (Descarte)', color:'#f87171', cardClass:'etapa-madurez-card', min:0, max:9999 };
        if (estadoRepro === 'seca') return { nombre:'Seca', clase:'etapa-desarrollo', icono:'🐄', rango:'Seca', color:'#60a5fa', cardClass:'etapa-desarrollo-card', min:0, max:9999 };
        if (estadoRepro === 'parida') return { nombre:'Parida', clase:'etapa-ceba', icono:'🐄', rango:'Parida', color:'#fb923c', cardClass:'etapa-ceba-card', min:0, max:9999 };
        if (pv < 350) return { nombre:'Novilla', clase:'etapa-inicio', icono:'🐄', rango:'Novilla', min:0, max:350, color:'#fbbf24', cardClass:'etapa-inicio-card', siguienteEtapa:'Parida' };
        return { nombre:'Parida', clase:'etapa-ceba', icono:'🐄', rango:'Parida', color:'#fb923c', cardClass:'etapa-ceba-card' };
    }
    if (pv < 150) return { nombre:'Cría', clase:'etapa-inicio', icono:'🐮', rango:'Cría', min:0, max:150, ureaBloqueada:true, color:'#fbbf24', cardClass:'etapa-inicio-card', siguienteEtapa:'Levante' };
    if (pv < 350) return { nombre:'Levante', clase:'etapa-desarrollo', icono:'🐂', rango:'Levante', min:150, max:350, ureaBloqueada:false, color:'#60a5fa', cardClass:'etapa-desarrollo-card', siguienteEtapa:'Ceba' };
    if (pv < 500) return { nombre:'Ceba', clase:'etapa-ceba', icono:'🐃', rango:'Ceba', min:350, max:500, ureaBloqueada:false, color:'#fb923c', cardClass:'etapa-ceba-card', siguienteEtapa:'Venta' };
    return { nombre:'Venta', clase:'etapa-madurez', icono:'🦬', rango:'Venta', min:500, max:9999, ureaBloqueada:false, color:'#f87171', cardClass:'etapa-madurez-card', siguienteEtapa:'Venta' };
}
function getProgresoEtapa(pv, e) { return Math.min(100, Math.max(0, ((pv - (e.min||0)) / ((e.max||9999) - (e.min||0))) * 100)); }
function getDietaCompleta(pv, tipo, estadoRepro, melazaPct) {
    var etapa = getEtapa(pv, tipo);
    var matriz = tipo === 'leche' ? MATRIZ_LECHE : MATRIZ_ENGORDE;
    if (tipo === 'leche' && estadoRepro === 'seca') etapa = 'Seca';
    if (tipo === 'leche' && estadoRepro === 'venta') etapa = 'Venta';
    if (tipo === 'leche' && estadoRepro === 'parida') etapa = 'Parida';
    var m = matriz[etapa] || matriz['Levante'];
    if (!m) m = { melaza:0, urea:0, bicarb:0, sal:0 };
    var consumoTotal = pv * 0.03;
    var melazaP = melazaPct !== undefined ? melazaPct : m.melaza;
    var melazaKg = consumoTotal * (melazaP / 100);
    var ureaDosis = (pv < 150) ? 0 : (pv * m.urea);
    var melazaDosis = (pv < 130) ? 0 : melazaKg * 1000;
    if (pv >= 130 && pv < 150) melazaDosis = 50;
    return { pasto: consumoTotal * 0.90, salvado: consumoTotal * 0.10, melaza: melazaDosis, urea: ureaDosis, bicarb: pv * m.bicarb, sal: pv * m.sal, levadura: pv * 0.05, consumoTotal: consumoTotal };
}
function getDiasDesde(f) { if (!f) return 999; var p = f.split('/'); if (p.length < 3) return 999; return Math.floor((new Date() - new Date(p[2], p[1]-1, p[0])) / 86400000); }
function getGMD(h) { return h.length < 2 ? 0 : (h[h.length-1].peso - h[h.length-2].peso) / 30; }
function getCostoDiario(pv, tipo, estadoRepro, melazaPct) { var d = getDietaCompleta(pv, tipo, estadoRepro, melazaPct); return (d.pasto||0)*(DB.precios.pasto||0) + (d.salvado||0)*(DB.precios.salvado||0) + ((d.melaza||0)/1000)*(DB.precios.melaza||0) + ((d.urea||0)/1000)*(DB.precios.urea||0) + ((d.bicarb||0)/1000)*(DB.precios.bicarb||0) + ((d.sal||0)/1000)*(DB.precios.sal||0) + ((d.levadura||0)/1000)*(DB.precios.levadura||0); }
function getRendimiento(h) { if (h.length < 2) return { nivel:'azul', texto:'Registre más', icono:'ℹ️', cm:0, color:'azul', pct:0 }; var act = h[h.length-1].peso, ant = h[h.length-2].peso, cm = ((act-ant)/ant)*100; var pct = Math.min(100, Math.max(0, 50 + cm * 10)); if (act < ant) return { nivel:'gris', texto:'Pérdida', icono:'⚠️', cm:cm, color:'gris', pct:Math.max(5, 30 + cm * 10) }; if (cm >= 5) return { nivel:'verde', texto:'Excelente', icono:'👑', cm:cm, color:'verde', pct:Math.min(100, 80 + cm) }; if (cm >= 3.5) return { nivel:'azul', texto:'Bueno', icono:'✅', cm:cm, color:'azul', pct:Math.min(79, 65 + cm * 2) }; if (cm >= 2.5) return { nivel:'naranja', texto:'Regular', icono:'⚠️', cm:cm, color:'naranja', pct:Math.min(64, 45 + cm * 4) }; return { nivel:'rojo', texto:'Bajo', icono:'❌', cm:cm, color:'rojo', pct:Math.min(44, 20 + cm * 6) }; }
function getTendenciaHistorica(historial) { if (historial.length < 3) return 'estable'; var gmds = []; for (var i = 1; i < historial.length; i++) { var dias = getDiasDesde(historial[i-1].fecha) - getDiasDesde(historial[i].fecha); if (dias > 0) gmds.push((historial[i].peso - historial[i-1].peso) / (dias / 30)); } if (gmds.length < 2) return 'estable'; var reciente = gmds.slice(-2).reduce(function(a,b){return a+b;},0)/2; var anterior = gmds.slice(0, -2).reduce(function(a,b){return a+b;},0)/(gmds.length-2) || reciente; var cambio = ((reciente - anterior) / (anterior || 1)) * 100; if (cambio > 10) return 'acelerando'; if (cambio < -10) return 'cayendo'; return 'estable'; }
function getEficiencia(pct) { if (pct >= 85) return { nivel:'Excelente', color:'#22c55e', icono:'🏆' }; if (pct >= 70) return { nivel:'Buena', color:'#60a5fa', icono:'✅' }; if (pct >= 50) return { nivel:'Regular', color:'#fbbf24', icono:'⚠️' }; return { nivel:'Crítica', color:'#ef4444', icono:'🔴' }; }
function detectarAnomalias(animal) { var anomalias = []; var h = animal.historial; if (h.length < 3) return anomalias; for (var i = 1; i < h.length; i++) { var cambio = h[i].peso - h[i-1].peso; if (cambio < -15) anomalias.push({ tipo:'caida', fecha:h[i].fecha, detalle:'Caída de ' + Math.abs(cambio) + ' kg. Verificar báscula o enfermedad.' }); } return anomalias; }

// ==================== IA ====================
function predecirPeso(historial, diasFuturo) { if (historial.length < 3) return null; var n = historial.length, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0; var p0 = historial[0].fecha.split('/'); var fb = new Date(parseInt(p0[2]), parseInt(p0[1])-1, parseInt(p0[0])); if (isNaN(fb.getTime())) return null; for (var i = 0; i < n; i++) { var pi = historial[i].fecha.split('/'); var fa = new Date(parseInt(pi[2]), parseInt(pi[1])-1, parseInt(pi[0])); if (isNaN(fa.getTime())) continue; var dr = Math.floor((fa - fb) / 86400000); sumX += dr; sumY += historial[i].peso; sumXY += dr * historial[i].peso; sumX2 += dr * dr; } var den = (n * sumX2 - sumX * sumX); if (den === 0) return null; var m = (n * sumXY - sumX * sumY) / den; var b = (sumY - m * sumX) / n; var pu = historial[n-1].fecha.split('/'); var fu = new Date(parseInt(pu[2]), parseInt(pu[1])-1, parseInt(pu[0])); return (m * (Math.floor((fu - fb) / 86400000) + diasFuturo) + b); }
function getConfianzaPrediccion(historial) { if (historial.length < 3) return { nivel:'Baja', pct:40 }; var cm = []; for (var i = 1; i < historial.length; i++) cm.push(historial[i].peso - historial[i-1].peso); var med = cm.reduce(function(a,b){return a+b;},0)/cm.length; if (med === 0) return { nivel:'Baja', pct:30 }; var vr = cm.reduce(function(a,b){return a+Math.pow(b-med,2);},0)/cm.length; var cv = Math.sqrt(vr)/Math.abs(med); if (cv < 0.3) return { nivel:'Alta', pct:Math.round(100 - cv*100) }; if (cv < 0.6) return { nivel:'Media', pct:Math.round(100 - cv*100) }; return { nivel:'Baja', pct:Math.round(100 - cv*100) }; }
function getTendenciaTexto(historial) { if (historial.length < 2) return '📊 Estable'; var c = 0; for (var i = 1; i < historial.length; i++) { if (historial[i].peso > historial[i-1].peso) c++; else if (historial[i].peso < historial[i-1].peso) c--; } if (c > 1) return '📈 Acelerando'; if (c > 0) return '📈 Mejorando'; if (c < -1) return '📉 Cayendo'; return '📊 Estable'; }
function getDiasParaMeta(pesoActual, meta, gmd) { if (gmd <= 0) return 9999; return Math.round((meta - pesoActual) / gmd); }
function getComparativa(gmd, gmdPromLote, gmdMejor) { var vsProm = gmdPromLote > 0 ? ((gmd - gmdPromLote) / gmdPromLote * 100) : 0; var vsMejor = gmdMejor > 0 ? ((gmd - gmdMejor) / gmdMejor * 100) : 0; return { textoProm:(vsProm >= 0 ? '📈 +' : '📉 ') + Math.abs(vsProm).toFixed(1) + '% vs promedio', textoMejor:(vsMejor >= 0 ? '📈 +' : '📉 ') + Math.abs(vsMejor).toFixed(1) + '% vs mejor' }; }
function simularCambio(animalId, accion) { var a = DB.animales.find(function(x){ return x.id === animalId; }); if (!a) return null; var pv = a.historial[a.historial.length-1].peso; var gmdActual = getGMD(a.historial); var cdActual = getCostoDiario(pv, a.tipo, a.estadoRepro); var simulacion = { gmdBase:gmdActual, costoBase:cdActual, gmdSimulado:gmdActual, costoSimulado:cdActual, acciones:[], roi:0, impactoGanancia:0 }; if (accion === 'melaza5') { var cd5 = getCostoDiario(pv, a.tipo, a.estadoRepro, 5); simulacion.gmdSimulado = gmdActual * 1.12; simulacion.costoSimulado = cd5; simulacion.acciones.push('Aumentar melaza al 5%'); } else if (accion === 'modificador') { simulacion.gmdSimulado = gmdActual + 0.05; simulacion.costoSimulado = cdActual + 500; simulacion.acciones.push('Aplicar Modificador Orgánico'); } else if (accion === 'ambos') { var cd5 = getCostoDiario(pv, a.tipo, a.estadoRepro, 5); simulacion.gmdSimulado = gmdActual * 1.12 + 0.05; simulacion.costoSimulado = cd5 + 500; simulacion.acciones.push('Melaza 5% + Modificador'); } var diasBase = getDiasParaMeta(pv, 500, gmdActual); var diasSim = getDiasParaMeta(pv, 500, simulacion.gmdSimulado); simulacion.fechaVentaSim = new Date(Date.now() + diasSim * 86400000).toLocaleDateString('es-CO', {day:'numeric', month:'short', year:'numeric'}); simulacion.diasAdelanto = diasBase - diasSim; simulacion.roi = Math.round(((simulacion.gmdSimulado - gmdActual) * 30 * DB.precioKG - (simulacion.costoSimulado - cdActual) * 30) / Math.abs((simulacion.costoSimulado - cdActual) * 30 || 1) * 100); simulacion.impactoGanancia = Math.round((simulacion.gmdSimulado - gmdActual) * 30 * DB.precioKG - (simulacion.costoSimulado - cdActual) * 30); return simulacion; }
function getSemaforo(animal) { if (animal.tipo !== 'leche' || animal.estadoRepro !== 'parida' || !animal.fechaParto) return null; var diasPostParto = getDiasDesde(animal.fechaParto); if (diasPostParto > 365) diasPostParto = 365; if (diasPostParto <= 150) return { color:'verde', texto:'Ventana óptima', dias:diasPostParto }; if (diasPostParto <= 180) return { color:'amarillo', texto:'Revisar nutrición', dias:diasPostParto }; return { color:'rojo', texto:'Evaluar rentabilidad', dias:diasPostParto }; }

// ==================== ALERTAS ====================
function getAlertasSistema() { var alertas = [], mez = { pasto:0, salvado:0, sal:0, melaza:0, urea:0, levadura:0, bicarb:0 }; DB.animales.forEach(function(a) { var d = getDietaCompleta(a.historial[a.historial.length-1].peso, a.tipo, a.estadoRepro); for (var k in mez) mez[k] += (d[k] || 0); }); for (var j = 0; j < ALIMENTOS.length; j++) { var st = DB.stock[ALIMENTOS[j]] || 0, co = mez[ALIMENTOS[j]] || 0, cr = (ALIMENTOS[j] === 'pasto' || ALIMENTOS[j] === 'salvado') ? co : co/1000; if (st > 0 && cr > 0 && st/cr < 3) alertas.push({ t:'r', m:NM_ALIMENTOS[ALIMENTOS[j]] + ': Stock ' + Math.round(st/cr) + 'd', icon:IC_ALIMENTOS[ALIMENTOS[j]] }); } DB.animales.forEach(function(a) { var du = getDiasDesde(a.historial[a.historial.length-1].fecha); if (du > 30) alertas.push({ t:'w', m:a.nombre + ': Pesaje vencido (' + du + 'd)', icon:'📅' }); }); return alertas; }

// ==================== NAVEGACIÓN ====================
var navHandled = false;
function setupNav() { if (navHandled) return; navHandled = true; var nav = document.getElementById('bottomNav'); if (!nav) { console.error('❌ bottomNav no encontrado'); return; } nav.addEventListener('click', function(e) { var btn = e.target.closest('button'); if (!btn || !btn.hasAttribute('data-p')) return; goPage(btn.getAttribute('data-p')); }); console.log('✅ Navegación configurada'); }
function goPage(p) { ['v-lotes','v-animales','v-insumos','v-ajustes','v-perfil'].forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); }); var target = document.getElementById('v-' + p); if (target) target.classList.remove('hidden'); var btns = document.querySelectorAll('#bottomNav .bn-btn'); for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active'); var ab = document.querySelector('#bottomNav button[data-p="' + p + '"]'); if (ab) ab.classList.add('active'); if (p === 'lotes') renderLotes(); else if (p === 'animales') renderAnimales(); else if (p === 'insumos') renderInsumos(); else if (p === 'ajustes') renderAjustes(); window.scrollTo(0, 0); }

// ==================== MODAL AGREGAR ====================
function toggleAdd() { var m = document.getElementById('addAnimalModal'); if (!m) return; m.classList.toggle('hidden'); if (!m.classList.contains('hidden')) { actualizarSelectLotes(); var nEl = document.getElementById('newN'); if (nEl) nEl.focus(); } }
function closeAddModal() { var m = document.getElementById('addAnimalModal'); if (m) m.classList.add('hidden'); }
function toggleOrigen() { var o = document.getElementById('newOrigen'); if (!o) return; var v = o.value; var nEl = document.getElementById('origenNacimiento'); var cEl = document.getElementById('origenComprado'); if (nEl) nEl.classList.toggle('hidden', v !== 'nacimiento'); if (cEl) cEl.classList.toggle('hidden', v !== 'comprado'); }
function actualizarSelectLotes() { var sel = document.getElementById('newLote'); if (!sel) return; sel.innerHTML = '<option value="">Sin lote</option>'; if (DB.lotes) { for (var i = 0; i < DB.lotes.length; i++) { sel.innerHTML += '<option value="' + DB.lotes[i].id + '">' + escapeHTML(DB.lotes[i].nombre) + '</option>'; } } }
function addAnimal() { var nEl = document.getElementById('newN'), wEl = document.getElementById('newW'); if (!nEl || !wEl) return; var n = nEl.value.trim(), p = parseFloat(wEl.value); if (!n || n.length < 2) { showToast('⚠️ Nombre válido'); return; } if (isNaN(p) || p < 20 || p > 2000) { showToast('⚠️ Peso 20-2000 kg'); return; } var tipo = document.getElementById('newTipo') ? document.getElementById('newTipo').value : 'engorde'; var origen = document.getElementById('newOrigen') ? document.getElementById('newOrigen').value : 'nacimiento'; var loteId = document.getElementById('newLote') ? document.getElementById('newLote').value : ''; var animal = { id:Date.now(), nombre:escapeHTML(n), tipo:tipo, origen:origen, historial:[{ fecha:new Date().toLocaleDateString(), peso:p }], lote:loteId || null, foto:null }; if (origen === 'nacimiento') { var madreEl = document.getElementById('newMadre'); animal.madre = madreEl ? madreEl.value.trim() || null : null; animal.fechaNacimiento = new Date().toLocaleDateString(); } if (origen === 'comprado') { var precioEl = document.getElementById('newPrecio'); animal.precioCompra = precioEl ? parseFloat(precioEl.value) || 0 : 0; animal.fechaCompra = new Date().toLocaleDateString(); } if (tipo === 'leche') { animal.estadoRepro = (p < 350) ? 'novilla' : 'parida'; animal.produccionLeche = []; } DB.animales.push(animal); save(); closeAddModal(); renderLotes(); showToast('✅ ' + n + ' registrado'); }

// ==================== RENDER LOTES ====================
function renderLotes() {
    var price = DB.precioKG || 9800, totalKg = 0, totalAnimales = DB.animales.length;
    for (var i = 0; i < DB.animales.length; i++) { totalKg += DB.animales[i].historial[DB.animales[i].historial.length-1].peso; }
    var valorTotal = totalKg * price;
    var alertasL = getAlertasSistema();
    
    // Lotes
    var lotesHTML = '';
    if (DB.lotes && DB.lotes.length > 0) {
        for (var i = 0; i < DB.lotes.length; i++) {
            var lote = DB.lotes[i];
            var animalesLote = DB.animales.filter(function(a) { return a.lote === lote.id; });
            if (animalesLote.length === 0) continue;
            var kgL = 0, gmdL = 0, cg = 0;
            for (var j = 0; j < animalesLote.length; j++) { kgL += animalesLote[j].historial[animalesLote[j].historial.length-1].peso; var g = getGMD(animalesLote[j].historial); if (animalesLote[j].historial.length >= 2) { gmdL += g; cg++; } }
            var pGMD = cg > 0 ? gmdL / cg : 0;
            var tipoIcono = lote.tipo === 'engorde' ? '🥩' : '🥛';
            lotesHTML += '<div class="lote-card" onclick="verLote(\'' + lote.id + '\')"><div class="lote-nombre">' + tipoIcono + ' ' + escapeHTML(lote.nombre) + ' <span style="font-size:.6rem;color:var(--muted);">(' + animalesLote.length + ')</span></div><div class="lote-stats"><div class="lote-stat"><div class="val">' + fm(kgL) + ' kg</div><div class="lbl">Peso total</div></div><div class="lote-stat"><div class="val">' + pGMD.toFixed(2) + '</div><div class="lbl">GMD</div></div></div></div>';
        }
    }
    
    var animalesSinLote = DB.animales.filter(function(a) { return !a.lote; });
    if (animalesSinLote.length > 0) {
        var kgSL = 0; for (var i = 0; i < animalesSinLote.length; i++) kgSL += animalesSinLote[i].historial[animalesSinLote[i].historial.length-1].peso;
        lotesHTML += '<div class="lote-card" onclick="verAnimalesSinLote()"><div class="lote-nombre">📋 SIN LOTE <span style="font-size:.6rem;color:var(--muted);">(' + animalesSinLote.length + ')</span></div><div class="lote-stats"><div class="lote-stat"><div class="val">' + fm(kgSL) + ' kg</div></div></div></div>';
    }
    
    var alHTML = '';
    if (alertasL.length > 0) {
        alHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.68rem;margin-bottom:6px;color:var(--muted);">🔔 ALERTAS (' + alertasL.length + ')</div>';
        for (var x = 0; x < Math.min(alertasL.length, 4); x++) { var cls = alertasL[x].t === 'r' ? 'alert-danger' : 'alert-warning'; alHTML += '<div class="alert-item ' + cls + '">' + alertasL[x].icon + ' ' + alertasL[x].m + '</div>'; }
        alHTML += '</div>';
    }
    
    var html = '<div class="card card-sm"><div style="font-weight:600;">💰 PRECIO KG EN PIE</div><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:1.1rem;font-weight:800;color:var(--accent);">$</span><input id="inpPKG" type="number" value="' + price + '" style="font-size:1.1rem;font-weight:700;text-align:center;"><span style="font-size:.7rem;color:var(--muted);">COP</span></div><button class="btn btn-green mt8" onclick="savePKG()">✅ ACTUALIZAR</button></div>' +
        '<div class="card card-sm"><div class="capital-value">$ ' + fm(valorTotal) + '</div><div class="stats-grid"><div class="stat-item"><div class="row-label">🐄 Cabezas</div><div class="row-val">' + totalAnimales + '</div></div><div class="stat-item"><div class="row-label">⚖️ Peso Total</div><div class="row-val">' + fm(totalKg) + ' kg</div></div></div></div>' +
        '<div class="section-title">📊 LOTES</div>' + lotesHTML + alHTML;
    document.getElementById('v-lotes').innerHTML = html;
}
function savePKG() { var el = document.getElementById('inpPKG'); if (el) { DB.precioKG = parseFloat(el.value) || 0; save(); renderLotes(); showToast('✅ Precio actualizado'); } }

// ==================== RENDER ANIMALES ====================
function renderAnimales() {
    var price = DB.precioKG || 9800, totalKg = 0, gmdTotal = 0, countGMD = 0;
    for (var i = 0; i < DB.animales.length; i++) { var a = DB.animales[i]; totalKg += a.historial[a.historial.length-1].peso; var g = getGMD(a.historial); if (a.historial.length >= 2) { gmdTotal += g; countGMD++; } }
    var gmdProm = countGMD > 0 ? gmdTotal / countGMD : 0;
    var todos = DB.animales.slice().sort(function(a,b) { return getGMD(b.historial) - getGMD(a.historial); });
    var rankingHTML = '';
    for (var i = 0; i < Math.min(todos.length, 3); i++) { var medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'; rankingHTML += '<div class="ranking-item" onclick="showProfile(' + todos[i].id + ')">' + medalla + ' <b>' + escapeHTML(todos[i].nombre) + '</b>: +' + getGMD(todos[i].historial).toFixed(2) + ' kg/d</div>'; }
    var cards = '';
    for (var i = 0; i < DB.animales.length; i++) { var a = DB.animales[i], cp = a.historial[a.historial.length-1].peso, etapa = getEtapaCompleta(cp, a.tipo, a.estadoRepro), r = getRendimiento(a.historial), lm = { verde:'ml-g', azul:'ml-b', naranja:'ml-o', rojo:'ml-r', gris:'ml-x' }; cards += '<div class="animal-card ' + etapa.cardClass + '" onclick="showProfile(' + a.id + ')"><div class="mini-led ' + lm[r.nivel] + '"></div><div class="animal-avatar">' + getIconoAnimal(a) + '</div><div class="name">' + escapeHTML(a.nombre) + '</div><span class="etapa-tag ' + etapa.clase + '">' + etapa.rango + '</span><div class="weight">' + fm(cp) + ' kg</div><div class="cm" style="color:' + (r.cm >= 0 ? '#22c55e' : '#ef4444') + '">' + (r.cm >= 0 ? '+' : '') + r.cm.toFixed(1) + '%</div></div>'; }
    var html = '<div class="card card-sm"><div class="capital-value">$ ' + fm(totalKg * price) + '</div><div class="stats-grid"><div class="stat-item"><div class="row-label">🐄 Cabezas</div><div class="row-val">' + DB.animales.length + '</div></div><div class="stat-item"><div class="row-label">⚖️ Peso</div><div class="row-val">' + fm(totalKg) + ' kg</div></div><div class="stat-item"><div class="row-label">📈 GMD Prom</div><div class="row-val">' + gmdProm.toFixed(2) + '</div></div><div class="stat-item"><div class="row-label">💰 Valor</div><div class="row-val">$ ' + fm(totalKg * price) + '</div></div></div>' +
        '<div class="ia-card"><div class="ia-title">🧠 IA - RANKING</div>' + rankingHTML + '</div>' +
        '<div class="section-title">🐄 TODOS LOS ANIMALES</div><div class="grid">' + cards + '</div>';
    document.getElementById('v-animales').innerHTML = html;
}
function renderAnimalesGrid(animales, titulo) {
    var cards = '';
    for (var i = 0; i < animales.length; i++) { var a = animales[i], cp = a.historial[a.historial.length-1].peso, etapa = getEtapaCompleta(cp, a.tipo, a.estadoRepro), r = getRendimiento(a.historial), lm = { verde:'ml-g', azul:'ml-b', naranja:'ml-o', rojo:'ml-r', gris:'ml-x' }; cards += '<div class="animal-card ' + etapa.cardClass + '" onclick="showProfile(' + a.id + ')"><div class="mini-led ' + lm[r.nivel] + '"></div><div class="animal-avatar">' + getIconoAnimal(a) + '</div><div class="name">' + escapeHTML(a.nombre) + '</div><span class="etapa-tag ' + etapa.clase + '">' + etapa.rango + '</span><div class="weight">' + fm(cp) + ' kg</div></div>'; }
    var html = '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-weight:700;font-size:.8rem;color:var(--accent);">' + titulo + ' (' + animales.length + ')</div><button class="btn btn-gray btn-sm" onclick="renderLotes()">← Volver</button></div></div><div class="grid">' + cards + '</div>';
    document.getElementById('v-lotes').innerHTML = html;
}
function verLote(loteId) { var lote = DB.lotes.find(function(l) { return l.id === loteId; }); if (!lote) return; var animales = DB.animales.filter(function(a) { return a.lote === loteId; }); renderAnimalesGrid(animales, (lote.tipo === 'engorde' ? '🥩 ' : '🥛 ') + escapeHTML(lote.nombre)); }
function verAnimalesSinLote() { var animales = DB.animales.filter(function(a) { return !a.lote; }); renderAnimalesGrid(animales, '📋 Sin Lote'); }

// ==================== PERFIL ANIMAL ====================
function showProfile(id) {
    var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return;
    var p = a.historial[a.historial.length-1].peso;
    var etapa = getEtapaCompleta(p, a.tipo, a.estadoRepro);
    var r = getRendimiento(a.historial), gmd = getGMD(a.historial);
    var d = getDietaCompleta(p, a.tipo, a.estadoRepro);
    var cd = getCostoDiario(p, a.tipo, a.estadoRepro);
    var csd = 0; try { for (var i = 0; i < DB.aplicaciones.length; i++) { if (DB.aplicaciones[i].animalId === id) { var prod = getCatalogoSanidadCompleto().find(function(x) { return x.id === DB.aplicaciones[i].productoId; }); if (prod && prod.diasEfecto > 0) csd += (DB.aplicaciones[i].costo || 0) / prod.diasEfecto; } } } catch(e) { csd = 0; }
    var cst = 0; try { for (var i = 0; i < DB.aplicaciones.length; i++) { if (DB.aplicaciones[i].animalId === id) cst += (DB.aplicaciones[i].costo || 0); } } catch(e) { cst = 0; }
    var ckp = gmd > 0 ? (cd + csd) / gmd : 999999;
    var ingM = gmd * 30 * DB.precioKG, gan = ingM - (cd * 30) - (cst / 12);
    var valorActual = p * DB.precioKG;
    var diasUltimo = getDiasDesde(a.historial[a.historial.length-1].fecha);
    var pred30 = predecirPeso(a.historial, 30), pred60 = predecirPeso(a.historial, 60), pred90 = predecirPeso(a.historial, 90), pred120 = predecirPeso(a.historial, 120);
    var confianza = getConfianzaPrediccion(a.historial), tendTxt = getTendenciaTexto(a.historial), hayIA = pred30 !== null && pred30 > 0;
    var semaforo = getSemaforo(a);
    var loteActual = (DB.lotes && DB.lotes.length > 0) ? DB.lotes.find(function(l) { return l.id === a.lote; }) : null;
    var diasPara500 = getDiasParaMeta(p, 500, gmd);
    var fechaVentaStr = diasPara500 < 9999 ? new Date(Date.now() + diasPara500 * 86400000).toLocaleDateString('es-CO', {day:'numeric', month:'short', year:'numeric'}) : 'N/A';
    
    // Edad / origen
    var edadHTML = '';
    if (a.origen === 'nacimiento' && a.fechaNacimiento) { var diasEdad = getDiasDesde(a.fechaNacimiento); var meses = Math.floor(diasEdad / 30); edadHTML = '<div class="row"><span class="row-label">🎂 Edad</span><span class="row-val">' + meses + ' meses (' + diasEdad + ' días)</span></div>'; }
    if (a.origen === 'comprado' && a.fechaCompra) { var diasFinca = getDiasDesde(a.fechaCompra); edadHTML += '<div class="row"><span class="row-label">🚚 Días en finca</span><span class="row-val">' + diasFinca + ' días</span></div>'; if (a.precioCompra) { var roi = ((valorActual - a.precioCompra - cst) / a.precioCompra * 100).toFixed(1); edadHTML += '<div class="row"><span class="row-label">💰 Precio compra</span><span class="row-val">$ ' + fm(a.precioCompra) + '</span></div><div class="row"><span class="row-label">📈 ROI</span><span class="row-val" style="color:' + (roi >= 0 ? '#22c55e' : '#ef4444') + '">' + roi + '%</span></div>'; } }
    if (a.madre) { var madre = DB.animales.find(function(x) { return x.nombre === a.madre || x.id === a.madre; }); if (madre) edadHTML += '<div class="row"><span class="row-label">🐄 Madre</span><span class="row-val" style="cursor:pointer;color:var(--accent);" onclick="showProfile(' + madre.id + ')">' + escapeHTML(madre.nombre) + '</span></div>'; }
    
    // Lote
    var loteHTML = '<div class="row"><span class="row-label">📊 Lote</span><span class="row-val">' + (loteActual ? escapeHTML(loteActual.nombre) : 'Sin lote') + ' <button class="btn btn-purple btn-sm" onclick="cambiarLote(' + id + ')" style="padding:2px 8px;font-size:.6rem;margin-left:4px;">✏️</button></span></div>';
    
    // Leche
    var lecheHTML = '';
    if (a.tipo === 'leche' && a.estadoRepro === 'parida') { var litrosHoy = a.produccionLeche && a.produccionLeche.length > 0 ? a.produccionLeche[a.produccionLeche.length-1].litros : 0; var ingresoLeche = litrosHoy * (DB.litroLeche || 1500); lecheHTML = '<div class="card card-sm" style="background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.2);"><div style="font-weight:700;font-size:.65rem;color:var(--accent);">🥛 PRODUCCIÓN LECHE</div><div class="row"><span class="row-label">Litros hoy</span><span class="row-val">' + litrosHoy + ' L</span></div><div class="row"><span class="row-label">Ingreso diario</span><span class="row-val" style="color:var(--accent);">$ ' + fm(ingresoLeche) + '</span></div><button class="btn btn-green btn-sm mt8" onclick="registrarLeche(' + id + ')" style="width:100%;">➕ REGISTRAR LITROS</button></div>'; }
    
    // Botones
    var botonesHTML = '';
    if (a.tipo === 'leche' && a.estadoRepro === 'parida' && semaforo && semaforo.dias >= 60 && !a.fechaPrenez) botonesHTML += '<button class="btn btn-purple btn-sm" onclick="quedoPrenada(' + id + ')" style="flex:1;">👶 Preñada</button>';
    if (a.tipo === 'leche' && a.estadoRepro === 'seca') botonesHTML += '<button class="btn btn-green btn-sm" onclick="yaPario(' + id + ')" style="flex:1;">✅ Parida</button>';
    if (a.tipo === 'leche') botonesHTML += '<button class="btn btn-gray btn-sm" onclick="cambiarAEngorde(' + id + ')" style="flex:1;">🔄 Engorde</button>';
    
    // Aplicaciones
    var apps = DB.aplicaciones ? DB.aplicaciones.filter(function(app) { return app.animalId === id; }).slice(-5).reverse() : [];
    var appsHTML = '';
    if (apps.length > 0) { appsHTML = '<div class="section-title">💉 APLICACIONES</div>'; var cat = getCatalogoSanidadCompleto(); for (var ap = 0; ap < apps.length; ap++) { var iconoProd = '💉'; var p2 = cat.find(function(x) { return x.id === apps[ap].productoId; }); if (p2 && p2.icono) iconoProd = p2.icono; appsHTML += '<div class="aplicacion-item"><span>' + iconoProd + ' ' + escapeHTML(apps[ap].producto) + '</span><span style="font-size:.63rem;">' + apps[ap].fecha + ' · $' + fm(apps[ap].costo || 0) + '</span></div>'; } }
    
    // Historial
    var hist = '', rev = a.historial.slice().reverse();
    for (var i = 0; i < rev.length; i++) { var h = rev[i], ch = '', di = ''; if (i === 0) di = '<span style="font-size:.58rem;color:var(--muted);margin-left:4px;">hace ' + getDiasDesde(h.fecha) + ' d</span>'; if (i < a.historial.length-1) { var ant = a.historial[a.historial.length-2-i].peso, dif = h.peso - ant, cls = dif >= 0 ? 'badge-up' : 'badge-down', sig = dif >= 0 ? '+' : ''; ch = '<span class="badge ' + cls + '">' + sig + ((dif/ant)*100).toFixed(1) + '%</span>'; } hist += '<div class="hist-item"><span>📅 ' + h.fecha + di + '</span><div><span class="row-val">' + fm(h.peso) + ' kg</span>' + ch + '</div></div>'; }
    
    // Dieta
    var dietaHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;margin-bottom:6px;color:var(--accent);">🧪 DIETA DIARIA</div>';
    var items = [
        { icono:'🌱', nombre:'Pasto Picado', valor:(d.pasto||0).toFixed(1)+' kg', costo:(d.pasto||0)*(DB.precios.pasto||0) },
        { icono:'🌾', nombre:'Salvado Trigo', valor:(d.salvado||0).toFixed(2)+' kg', costo:(d.salvado||0)*(DB.precios.salvado||0) },
        { icono:'💧', nombre:'Melaza', valor:Math.round(d.melaza||0)+' g', costo:((d.melaza||0)/1000)*(DB.precios.melaza||0) },
        { icono:'⚗️', nombre:'UREA', valor:Math.round(d.urea||0)+' g', costo:((d.urea||0)/1000)*(DB.precios.urea||0) },
        { icono:'🧊', nombre:'Bicarbonato', valor:Math.round(d.bicarb||0)+' g', costo:((d.bicarb||0)/1000)*(DB.precios.bicarb||0) },
        { icono:'🧂', nombre:'Sal Mineral', valor:Math.round(d.sal||0)+' g', costo:((d.sal||0)/1000)*(DB.precios.sal||0) }
    ];
    for (var x = 0; x < items.length; x++) { var it = items[x]; var bloqueado = (it.nombre === 'UREA' && etapa.ureaBloqueada); dietaHTML += '<div class="row"><span class="row-label">' + it.icono + ' ' + it.nombre + '</span><span class="row-val" style="' + (bloqueado ? 'color:#6b7280;text-decoration:line-through' : '') + '">' + (bloqueado ? '0 g (🔒)' : it.valor + ' · $' + fm(it.costo)) + '</span></div>'; }
    dietaHTML += '</div>';
    
    // IA Predictiva
    var iaHTML = '';
    if (hayIA) {
        iaHTML = '<div class="ia-card"><div class="ia-title">🧠 IA PREDICTIVA · Confianza: ' + confianza.nivel + ' (' + confianza.pct + '%)</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-bottom:8px;">' +
            '<div class="proyeccion-item"><div class="dias">30 DÍAS</div><div class="peso">' + fm(pred30) + ' kg</div></div>' +
            '<div class="proyeccion-item"><div class="dias">60 DÍAS</div><div class="peso">' + fm(pred60) + ' kg</div></div>' +
            '<div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(pred90) + ' kg</div></div>' +
            (pred120 > 0 ? '<div class="proyeccion-item"><div class="dias">120 DÍAS</div><div class="peso">' + fm(pred120) + ' kg</div></div>' : '<div class="proyeccion-item"><div class="dias">120 DÍAS</div><div class="peso">--</div></div>') +
            '</div>' +
            '<div style="font-size:.62rem;color:var(--muted);">🎯 VENTA ÓPTIMA: <b>' + fechaVentaStr + '</b> (' + diasPara500 + ' días) · Ganancia: <b style="color:#22c55e">$' + fm((500-p)*DB.precioKG - cd*diasPara500) + '</b></div>' +
            '<div style="font-size:.62rem;color:var(--muted);">📈 Tendencia: ' + tendTxt + ' · Basado en ' + a.historial.length + ' pesajes</div></div>';
    } else {
        iaHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;margin-bottom:4px;color:var(--muted);">📈 PROYECCIÓN SIMPLE</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;"><div class="proyeccion-item"><div class="dias">30 DÍAS</div><div class="peso">' + fm(p + (gmd*30)) + ' kg</div></div><div class="proyeccion-item"><div class="dias">60 DÍAS</div><div class="peso">' + fm(p + (gmd*60)) + ' kg</div></div><div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(p + (gmd*90)) + ' kg</div></div></div><div style="font-size:.55rem;color:var(--muted);margin-top:4px;">⚠️ 3+ pesajes para IA</div></div>';
    }
    
    // Simulador
    var simulacion = simularCambio(id, 'ambos');
    var simHTML = '';
    if (simulacion && gmd > 0) {
        simHTML = '<div class="ia-card" style="margin-top:8px;background:rgba(34,197,94,.03);border:1px solid rgba(34,197,94,.2);"><div class="ia-title">🔮 SIMULADOR IA</div>' +
            '<div style="font-size:.6rem;color:var(--muted);margin-bottom:4px;">¿Qué pasa si aplicas Melaza 5% + Modificador?</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.62rem;">' +
            '<div>GMD actual: <b>' + gmd.toFixed(2) + ' kg/d</b></div><div>GMD simulado: <b style="color:#22c55e">' + simulacion.gmdSimulado.toFixed(2) + ' kg/d</b></div>' +
            '<div>Venta actual: <b>' + fechaVentaStr + '</b></div><div>Venta simulada: <b style="color:#fbbf24">' + simulacion.fechaVentaSim + '</b></div>' +
            '<div>Adelanto: <b style="color:#22c55e">' + simulacion.diasAdelanto + ' días</b></div><div>Ganancia extra: <b style="color:#22c55e">+$' + fm(simulacion.impactoGanancia) + '</b></div>' +
            '<div>ROI de la acción: <b style="color:#22c55e">' + simulacion.roi + '%</b></div></div>' +
            '<div style="font-size:.55rem;color:#22c55e;margin-top:4px;">🟢 RECOMENDADO: El ROI es muy positivo</div></div>';
    }
    
    // Alerta rendimiento
    var alertaHTML = '<div class="alerta-card ' + r.color + '"><div class="alerta-led ' + r.color + '">' + r.icono + '</div><div><div class="alerta-titulo">' + r.texto + '</div><div class="alerta-met">' + (r.cm >= 0 ? '+' : '') + r.cm.toFixed(1) + '% · $' + fm(ckp) + '/kg</div></div></div>';
    
    var semaforoHTML = semaforo ? ' · <span class="semaforo semaforo-' + semaforo.color + '"></span> ' + semaforo.texto + ' (' + semaforo.dias + 'd)' : '';
    
    // Rentabilidad
    var rentHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;margin-bottom:4px;color:var(--muted);">💰 RENTABILIDAD</div><div class="row"><span class="row-label">Costo alim./día</span><span class="row-val">$ ' + fm(cd) + '</span></div><div class="row"><span class="row-label">Costo/kg ganado</span><span class="row-val">$ ' + fm(ckp) + '</span></div><div class="row"><span class="row-label">Ganancia/mes</span><span class="row-val" style="color:' + (gan >= 0 ? '#22c55e' : '#ef4444') + '">$ ' + fm(gan) + '</span></div></div>';
    
    // Ocultar otras páginas y mostrar perfil
    ['v-lotes','v-animales','v-insumos','v-ajustes'].forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    var perfilEl = document.getElementById('v-perfil');
    if (perfilEl) perfilEl.classList.remove('hidden');
    
    var html = '<div class="card"><div class="profile-cover"><div class="profile-avatar" onclick="abrirFoto(' + id + ')">' + getIconoAnimal(a) + '<div class="foto-overlay">📸</div></div><div class="profile-name">' + escapeHTML(a.nombre) + '</div><div class="profile-sub">' + etapa.rango + ' · ' + (a.tipo === 'engorde' ? '🥩 Engorde' : '🥛 Leche') + semaforoHTML + '</div><div class="profile-stats"><div class="profile-stat"><div class="val">' + fm(p) + ' kg</div><div class="lbl">Peso</div></div><div class="profile-stat"><div class="val">' + gmd.toFixed(2) + '</div><div class="lbl">GMD</div></div><div class="profile-stat"><div class="val">$ ' + fm(valorActual) + '</div><div class="lbl">Valor</div></div></div>' + (etapa.min !== undefined ? '<div class="progress"><div class="progress-fill" style="width:' + getProgresoEtapa(p, etapa) + '%;background:' + etapa.color + ';"></div></div><div style="font-size:.6rem;color:var(--muted);text-align:center;margin-top:4px;">Faltan ' + fm((etapa.max||9999) - p) + ' kg para ' + etapa.siguienteEtapa + '</div>' : '') + '</div>' +
        edadHTML + loteHTML + lecheHTML + alertaHTML + iaHTML + simHTML + rentHTML +
        appsHTML + '<div class="section-title">🕐 HISTORIAL (' + a.historial.length + ')</div>' + hist + dietaHTML +
        '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">' + botonesHTML + '<button class="btn btn-purple btn-sm" onclick="openAplicarSanidad(' + id + ')" style="flex:1;">💉 Sanidad</button><button class="btn btn-gold btn-sm" onclick="updateWeight(' + id + ')" style="flex:2;">⚖️ PESAJE</button></div>';
    
    if (perfilEl) perfilEl.innerHTML = html;
    window.scrollTo(0, 0);
    save();
}

// ==================== ACCIONES ====================
function updateWeight(id) { showInput('⚖️ Nuevo pesaje (kg):', 'Ej: 185', function(v) { if (!v) return; var p = parseFloat(v); if (isNaN(p) || p < 20 || p > 2000) { showToast('⚠️ Peso inválido'); return; } var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.historial.push({ fecha: new Date().toLocaleDateString(), peso: p }); save(); showProfile(id); showToast('✅ Pesaje guardado'); }); }
function abrirFoto(id) { var input = document.getElementById('fotoInput'); if (!input) return; input.setAttribute('data-animal', id); input.click(); }
function guardarFoto() { var input = document.getElementById('fotoInput'); if (!input) return; var id = parseInt(input.getAttribute('data-animal')); var file = input.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(e) { var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.foto = e.target.result; fotosDB[id] = e.target.result; save(); showProfile(id); showToast('📸 Foto guardada'); }; reader.readAsDataURL(file); }
function cambiarLote(id) { var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; var loteActual = DB.lotes.find(function(l) { return l.id === a.lote; }); var html = '<div class="modal-title">🔄 LOTE - ' + escapeHTML(a.nombre) + '</div><div style="font-size:.7rem;color:var(--muted);margin-bottom:8px;">Actual: ' + (loteActual ? escapeHTML(loteActual.nombre) : 'Sin lote') + '</div><div class="flex-col gap10">'; var compatibles = DB.lotes.filter(function(l) { return l.tipo === a.tipo; }); for (var i = 0; i < compatibles.length; i++) html += '<button class="btn btn-sm btn-gray" onclick="confirmarCambioLote(' + id + ',\'' + compatibles[i].id + '\')">' + escapeHTML(compatibles[i].nombre) + '</button>'; html += '<button class="btn btn-sm btn-gray" onclick="confirmarCambioLote(' + id + ',null)">📋 Sin lote</button><button class="btn btn-gray btn-sm mt8" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>'; showModal(html); }
function confirmarCambioLote(id, loteId) { var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.lote = loteId; save(); var overlay = document.querySelector('.modal-overlay'); if (overlay) overlay.remove(); showProfile(id); showToast('✅ Lote actualizado'); }
function registrarLeche(id) { var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; var litrosHoy = a.produccionLeche && a.produccionLeche.length > 0 ? a.produccionLeche[a.produccionLeche.length-1].litros : 0; showModal('<div class="modal-title">🥛 LECHE - ' + escapeHTML(a.nombre) + '</div><div class="flex-col gap10"><input id="lecheLitros" type="number" value="' + litrosHoy + '"><button class="btn btn-gold mt8" onclick="guardarLeche(' + id + ')">✅ GUARDAR</button><button class="btn btn-gray" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>'); }
function guardarLeche(id) { var litros = parseFloat(document.getElementById('lecheLitros').value); if (isNaN(litros) || litros < 0) { showToast('⚠️ Litros válidos'); return; } var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; if (!a.produccionLeche) a.produccionLeche = []; a.produccionLeche.push({ fecha: new Date().toLocaleDateString(), litros: litros }); save(); var overlay = document.querySelector('.modal-overlay'); if (overlay) overlay.remove(); showProfile(id); showToast('✅ Registrado'); }
function quedoPrenada(id) { showConfirm('¿Confirmar preñez?', function(ok) { if (!ok) return; var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; var hoy = new Date(); a.fechaPrenez = hoy.toLocaleDateString(); a.fechaPartoEstimada = new Date(hoy.getTime() + 285 * 86400000).toLocaleDateString(); save(); showProfile(id); showToast('✅ Preñez registrada'); }); }
function yaPario(id) { showConfirm('¿Confirmar parto?', function(ok) { if (!ok) return; var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.estadoRepro = 'parida'; a.fechaParto = new Date().toLocaleDateString(); save(); showProfile(id); showToast('✅ Parto registrado'); }); }
function cambiarAEngorde(id) { showConfirm('¿Cambiar a Engorde?', function(ok) { if (!ok) return; var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.tipo = 'engorde'; a.estadoRepro = 'venta'; save(); showProfile(id); showToast('✅ Cambiado a Engorde'); }); }

// ==================== SANIDAD ====================
function openAplicarSanidad(animalId) { var a = DB.animales.find(function(x) { return x.id === animalId; }); if (!a) return; var cat = getCatalogoSanidadCompleto(); var opts = ''; for (var i = 0; i < cat.length; i++) opts += '<option value="' + cat[i].id + '">' + (cat[i].icono || '💉') + ' ' + escapeHTML(cat[i].nombre) + '</option>'; showModal('<div class="modal-title">💉 APLICAR A ' + escapeHTML(a.nombre) + '</div><div class="flex-col gap10"><select id="aplProducto">' + opts + '</select><input id="aplML" type="number" placeholder="ml aplicados" value="50"><button class="btn btn-gold mt8" onclick="aplicarProductoSanidad(' + animalId + ')">✅ CONFIRMAR</button><button class="btn btn-gray" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>'); }
function aplicarProductoSanidad(animalId) { var sel = document.getElementById('aplProducto'), mlEl = document.getElementById('aplML'); if (!sel || !mlEl) return; var pid = sel.value, ml = parseFloat(mlEl.value); if (isNaN(ml) || ml <= 0) { showToast('⚠️ ml válidos'); return; } var cat = getCatalogoSanidadCompleto(); var p = cat.find(function(x) { return x.id === pid; }); if (!p) return; var prc = p.tipo === 'fijo' ? (DB.preciosSanidad[pid] || 0) : (p.precioML || 0); DB.aplicaciones.push({ animalId: animalId, productoId: pid, producto: p.nombre, cantidad: ml, unidad: 'ml', costo: prc * ml, fecha: new Date().toLocaleDateString(), tipo: 'sanidad' }); if (p.tipo === 'fijo' && !DB.stockSanidad[pid]) DB.stockSanidad[pid] = 100; save(); var overlay = document.querySelector('.modal-overlay'); if (overlay) overlay.remove(); showProfile(animalId); showToast('✅ Aplicado'); }

// ==================== RENDER INSUMOS ====================
function renderInsumos() {
    var mez = { pasto:0, salvado:0, sal:0, melaza:0, urea:0, levadura:0, bicarb:0 };
    for (var i = 0; i < DB.animales.length; i++) { var a = DB.animales[i]; var d = getDietaCompleta(a.historial[a.historial.length-1].peso, a.tipo, a.estadoRepro); for (var k in mez) mez[k] += (d[k] || 0); }
    
    var html = '<div class="card"><div style="font-weight:700;margin-bottom:14px;color:var(--accent);">📦 ALIMENTOS - CONSUMO DIARIO</div>';
    for (var i = 0; i < ALIMENTOS.length; i++) {
        var idAlim = ALIMENTOS[i], st = DB.stock[idAlim] || 0, co = mez[idAlim] || 0, precio = DB.precios[idAlim] || 0;
        var consumoDiarioKg = (idAlim === 'pasto' || idAlim === 'salvado') ? co : (co / 1000);
        var consumoMostrar = (idAlim === 'pasto' || idAlim === 'salvado') ? co.toFixed(1) + ' kg' : Math.round(co) + ' g';
        var diasStock = consumoDiarioKg > 0 && st > 0 ? Math.round(st / consumoDiarioKg) : 999;
        var diasTexto = diasStock === 999 ? '--' : diasStock + ' días';
        var alertaColor = diasStock < 3 && diasStock !== 999 ? 'style="color:#ef4444;font-weight:700;"' : '';
        html += '<div class="insumo-row"><span class="ic">' + IC_ALIMENTOS[idAlim] + '</span><div class="insumo-info"><span class="insumo-nombre">' + NM_ALIMENTOS[idAlim] + '</span><span class="insumo-detalle">Consumo: ' + consumoMostrar + ' | <b ' + alertaColor + '>Stock: ' + fm(st) + ' kg (' + diasTexto + ')</b></span></div><div class="insumo-inputs"><span style="font-size:.6rem;color:var(--muted);">$</span><input id="pr-' + idAlim + '" type="number" value="' + precio + '" placeholder="Precio" style="width:60px;"><span style="font-size:.6rem;color:var(--muted);">kg</span><input id="st-' + idAlim + '" type="number" value="' + Math.round(st) + '" placeholder="Stock" style="width:60px;"><span style="font-size:.6rem;color:var(--muted);">kg</span></div></div>';
    }
    html += '<button class="btn btn-gold mt12" onclick="saveAlimentos()">✅ GUARDAR PRECIOS Y STOCK</button></div>';
    
    // Suplementos
    html += '<div class="card"><div style="font-weight:700;margin-bottom:14px;color:var(--accent);">🧪 SUPLEMENTOS ALIMENTICIOS</div>';
    if (DB.suplementosAlimento && DB.suplementosAlimento.length > 0) {
        for (var s = 0; s < DB.suplementosAlimento.length; s++) { var sup = DB.suplementosAlimento[s]; html += '<div class="sup-card"><div class="sup-card-header"><span class="sup-nombre">🧪 ' + escapeHTML(sup.nombre) + '</span><div class="sup-card-actions"><button onclick="eliminarSuplementoAlimento(\'' + sup.id + '\')" style="background:rgba(239,68,68,.1);color:#ef4444;border:none;padding:4px 8px;border-radius:6px;font-size:.7rem;cursor:pointer;">🗑️</button></div></div><div class="sup-card-body"><span>' + (sup.gramosPorKg||0) + ' g/kg</span><span>Stock: ' + fm(sup.stock||0) + ' kg</span></div></div>'; }
    } else { html += '<div style="font-size:.7rem;color:var(--muted);text-align:center;padding:10px;">No hay suplementos registrados</div>'; }
    html += '<button class="btn btn-purple mt12" onclick="openAgregarSuplementoAlimento()">➕ AGREGAR SUPLEMENTO</button></div>';
    
    // Sanidad
    html += '<div class="card"><div style="font-weight:700;margin-bottom:14px;color:var(--accent);">💉 PRODUCTOS SANIDAD</div>';
    var cat = getCatalogoSanidadCompleto();
    for (var i = 0; i < cat.length; i++) { var p = cat[i], stSan = p.tipo === 'fijo' ? (DB.stockSanidad[p.id] || 0) : (p.stock || 0), precSan = p.tipo === 'fijo' ? (DB.preciosSanidad[p.id] || 0) : (p.precioML || 0); html += '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.03);"><div style="display:flex;align-items:center;gap:8px;"><span>' + (p.icono||'💉') + '</span><span style="flex:1;">' + escapeHTML(p.nombre) + '</span><span style="font-size:.6rem;color:var(--muted);">Stock: ' + fm(stSan) + ' ml · $' + fm(precSan) + '/ml</span></div></div>'; }
    html += '<button class="btn btn-purple mt12" onclick="openAgregarSuplementoSanidad()">➕ AGREGAR PRODUCTO</button></div>';
    
    var insumosEl = document.getElementById('v-insumos');
    if (insumosEl) insumosEl.innerHTML = html;
}
function saveAlimentos() { for (var i = 0; i < ALIMENTOS.length; i++) { var pel = document.getElementById('pr-' + ALIMENTOS[i]), sel = document.getElementById('st-' + ALIMENTOS[i]); if (pel) DB.precios[ALIMENTOS[i]] = parseFloat(pel.value) || 0; if (sel) DB.stock[ALIMENTOS[i]] = parseFloat(sel.value) || 0; } save(); showToast('✅ Guardado'); }
function openAgregarSuplementoAlimento() { showModal('<div class="modal-title">➕ SUPLEMENTO</div><div class="flex-col gap10"><input id="supAlimNombre" type="text" placeholder="Nombre"><input id="supAlimGramos" type="number" value="50" placeholder="g/kg"><button class="btn btn-purple mt8" onclick="agregarSuplementoAlimento()">✅ AGREGAR</button><button class="btn btn-gray" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>'); }
function agregarSuplementoAlimento() { var nEl = document.getElementById('supAlimNombre'), gEl = document.getElementById('supAlimGramos'); if (!nEl) return; var n = nEl.value.trim(), g = gEl ? parseInt(gEl.value) || 50 : 50; if (!n) return; DB.suplementosAlimento.push({ id:'sup_'+Date.now(), nombre:escapeHTML(n), gramosPorKg:g, stock:0 }); save(); var overlay = document.querySelector('.modal-overlay'); if (overlay) overlay.remove(); renderInsumos(); showToast('✅ Agregado'); }
function eliminarSuplementoAlimento(id) { DB.suplementosAlimento = DB.suplementosAlimento.filter(function(s) { return s.id !== id; }); save(); renderInsumos(); showToast('✅ Eliminado'); }
function openAgregarSuplementoSanidad() { showModal('<div class="modal-title">💉 NUEVO PRODUCTO</div><div class="flex-col gap10"><input id="supSanNombre" type="text" placeholder="Nombre"><input id="supSanDosis" type="number" value="50" placeholder="Dosis ml"><input id="supSanPrecio" type="number" value="0" placeholder="Precio por ml"><button class="btn btn-purple mt8" onclick="agregarSuplementoSanidad()">✅ AGREGAR</button><button class="btn btn-gray" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>'); }
function agregarSuplementoSanidad() { var nEl = document.getElementById('supSanNombre'), dEl = document.getElementById('supSanDosis'), pEl = document.getElementById('supSanPrecio'); if (!nEl) return; var n = nEl.value.trim(), dosis = dEl ? parseInt(dEl.value) || 50 : 50, precio = pEl ? parseFloat(pEl.value) || 0 : 0; if (!n) return; DB.suplementosSanidad.push({ id:'supSan_'+Date.now(), nombre:escapeHTML(n), dosis:dosis, stock:100, precioML:precio, icono:'💉', color:'#a78bfa', tipo:'personalizado' }); save(); var overlay = document.querySelector('.modal-overlay'); if (overlay) overlay.remove(); renderInsumos(); showToast('✅ Agregado'); }

// ==================== RENDER AJUSTES ====================
function renderAjustes() {
    var lotesHTML = '';
    if (DB.lotes && DB.lotes.length > 0) {
        for (var i = 0; i < DB.lotes.length; i++) { var l = DB.lotes[i], count = DB.animales.filter(function(a) { return a.lote === l.id; }).length; lotesHTML += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.03);"><span>' + (l.tipo==='engorde'?'🐄':'🥛') + '</span><span style="flex:1;">' + escapeHTML(l.nombre) + ' <span style="font-size:.6rem;color:var(--muted);">(' + count + ')</span></span><button class="btn btn-danger btn-sm" onclick="eliminarLote(\'' + l.id + '\')" style="padding:4px 8px;">🗑️</button></div>'; }
    } else { lotesHTML = '<div style="font-size:.7rem;color:var(--muted);text-align:center;padding:10px;">No hay lotes creados</div>'; }
    
    var html = '<div class="card config-section"><h3>📊 LOTES</h3>' + lotesHTML + '<button class="btn btn-purple btn-sm mt8" onclick="openCrearLote()" style="width:100%;">➕ CREAR LOTE</button></div>' +
        '<div class="card config-section"><h3>🥛 PRECIO LITRO LECHE</h3><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:1.1rem;font-weight:800;color:var(--accent);">$</span><input id="inpLeche" type="number" value="' + (DB.litroLeche||1500) + '" style="font-size:1rem;"><span style="font-size:.7rem;color:var(--muted);">COP</span><button class="btn btn-green btn-sm" onclick="saveLeche()" style="white-space:nowrap;">✅</button></div></div>' +
        '<div class="card config-section"><h3>💾 RESPALDO</h3><button class="btn btn-gold" onclick="exportarDatos()">📥 EXPORTAR DATOS</button><button class="btn btn-gray" onclick="importarDatos()">📤 IMPORTAR DATOS</button></div>' +
        '<div class="card config-section"><h3>📲 INSTALAR APP</h3><button class="btn btn-gold" onclick="instalarApp()">📱 INSTALAR PWA</button></div>' +
        '<div class="card config-section"><h3>ℹ️ INFORMACIÓN</h3><p style="font-size:.7rem;color:var(--muted);">GANADERO ÉLITE v4.0.1</p><p style="font-size:.6rem;color:var(--muted);">🥩 Engorde + 🥛 Leche · 🧠 IA Predictiva</p><p style="font-size:.6rem;color:var(--muted);">📡 100% Offline</p><p style="font-size:.6rem;color:var(--muted);">Animales: ' + DB.animales.length + ' · Lotes: ' + (DB.lotes?DB.lotes.length:0) + '</p></div>';
    
    var ajustesEl = document.getElementById('v-ajustes');
    if (ajustesEl) ajustesEl.innerHTML = html;
}
function saveLeche() { var el = document.getElementById('inpLeche'); if (el) { DB.litroLeche = parseFloat(el.value) || 1500; save(); showToast('✅ Precio leche actualizado'); } }
function openCrearLote() { showModal('<div class="modal-title">📦 NUEVO LOTE</div><div class="flex-col gap10"><input id="loteNombre" type="text" placeholder="Nombre del lote"><select id="loteTipo"><option value="engorde">🥩 Engorde</option><option value="leche">🥛 Leche</option></select><button class="btn btn-gold mt8" onclick="crearLote()">✅ CREAR</button><button class="btn btn-gray" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>'); }
function crearLote() { var nEl = document.getElementById('loteNombre'), tEl = document.getElementById('loteTipo'); if (!nEl) return; var n = nEl.value.trim(), t = tEl ? tEl.value : 'engorde'; if (!n) return; DB.lotes.push({ id:'lote_'+Date.now(), nombre:escapeHTML(n), tipo:t }); save(); var overlay = document.querySelector('.modal-overlay'); if (overlay) overlay.remove(); renderAjustes(); showToast('✅ Lote creado'); }
function eliminarLote(id) { DB.lotes = DB.lotes.filter(function(l) { return l.id !== id; }); DB.animales.forEach(function(a) { if (a.lote === id) a.lote = null; }); save(); renderAjustes(); showToast('✅ Lote eliminado'); }
function exportarDatos() { var b = new Blob([JSON.stringify(DB,null,2)],{type:'application/json'}); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ganadero-respaldo-' + new Date().toISOString().split('T')[0] + '.json'; a.click(); showToast('✅ Exportado'); }
function importarDatos() { var i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = function(e) { var r = new FileReader(); r.onload = function(e) { try { var datos = JSON.parse(e.target.result); if (datos.animales !== undefined) { DB = datos; migrateDB(); save(); goPage('lotes'); showToast('✅ Importado: ' + DB.animales.length + ' animales'); } else { showToast('❌ Archivo inválido'); } } catch(err) { showToast('❌ Error al leer archivo'); } }; r.readAsText(e.target.files[0]); }; i.click(); }

// ==================== INIT ====================
function init() {
    cargarDatos();
    setupNav();
    renderLotes();
    console.log('✅ GANADERO ÉLITE v4.0.1 inicializado - ' + DB.animales.length + ' animales, ' + (DB.lotes?DB.lotes.length:0) + ' lotes');
}
window.addEventListener('load', function() { setTimeout(init, 200); });
window.addEventListener('beforeunload', function() { save(); });
document.addEventListener('visibilitychange', function() { if (document.hidden) save(); });
setInterval(function() { save(); }, 30000);
