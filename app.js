// 📂 ganadero-elite/app.js - GANADERO ÉLITE v4.0.0 - IA TOTAL
console.log('🧠 GANADERO ÉLITE v4.0.0 - IA PREDICTIVA TOTAL');

// ==================== UTILIDADES ====================
function fm(n) { if (isNaN(n) || n === null) return '0'; n = Math.round(n); var s = String(n), r = '', c = 0; for (var i = s.length - 1; i >= 0; i--) { if (c > 0 && c % 3 === 0) r = '.' + r; r = s.charAt(i) + r; c++; } return r; }
function showToast(m, d) { d = d || 3000; var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.getElementById('toastContainer').appendChild(t); setTimeout(function() { if (t.parentNode) t.remove(); }, d); }
function showModal(h) { var o = document.createElement('div'); o.className = 'modal-overlay'; o.innerHTML = '<div class="modal">' + h + '</div>'; o.querySelector('.modal').onclick = function(e) { e.stopPropagation(); }; o.onclick = function(e) { if (e.target === o) o.remove(); }; document.getElementById('modalContainer').appendChild(o); }
function showConfirm(msg, callback) { showModal('<div class="modal-title">⚠️ Confirmar</div><p style="margin-bottom:12px;font-size:.8rem;">' + msg + '</p><div class="flex-col gap10"><button class="btn btn-gold" id="confirmYes">SÍ</button><button class="btn btn-gray" id="confirmNo">CANCELAR</button></div>'); setTimeout(function() { document.getElementById('confirmYes').onclick = function() { document.querySelector('.modal-overlay').remove(); callback(true); }; document.getElementById('confirmNo').onclick = function() { document.querySelector('.modal-overlay').remove(); callback(false); }; }, 50); }
function showInput(label, placeholder, callback) { showModal('<div class="modal-title">📝 Input</div><div class="flex-col gap10"><div style="font-size:.75rem;color:var(--muted);">' + label + '</div><input id="inputVal" type="text" placeholder="' + placeholder + '"><button class="btn btn-gold" id="inputOk">OK</button><button class="btn btn-gray" id="inputCancel">CANCELAR</button></div>'); setTimeout(function() { document.getElementById('inputVal').focus(); document.getElementById('inputOk').onclick = function() { var v = document.getElementById('inputVal').value.trim(); document.querySelector('.modal-overlay').remove(); callback(v); }; document.getElementById('inputCancel').onclick = function() { document.querySelector('.modal-overlay').remove(); callback(null); }; }, 50); }
function escapeHTML(str) { var div = document.createElement('div'); div.appendChild(document.createTextNode(str)); return div.innerHTML; }
function getIconoAnimal(a) { if (a.foto && a.foto.length > 100) return '<img src="' + a.foto + '" alt="">'; var etapa = getEtapaCompleta(a.historial[a.historial.length-1].peso, a.tipo, a.estadoRepro); return etapa.icono; }

// ==================== BASE DE DATOS ====================
var DB = { version: '4.0.0', animales: [], aplicaciones: [], lotes: [], precios: { pasto:1200, salvado:2500, melaza:3800, levadura:8000, bicarb:4500, sal:6200, urea:9500 }, stock: { pasto:500, salvado:200, melaza:50, levadura:10, bicarb:5, sal:2, urea:20 }, stockSanidad: {}, preciosSanidad: {}, suplementosAlimento: [], suplementosSanidad: [], precioKG: 9800, litroLeche: 1500, simulaciones: [] };
var fotosDB = {};

function cargarDatos() { try { var s = localStorage.getItem('ganadero_elite_v10'); if (s) DB = JSON.parse(s); } catch(e) {} try { var f = localStorage.getItem('ganadero_fotos'); if (f) { fotosDB = JSON.parse(f); for (var i = 0; i < DB.animales.length; i++) if (fotosDB[DB.animales[i].id]) DB.animales[i].foto = fotosDB[DB.animales[i].id]; } } catch(e) {} if (!DB.simulaciones) DB.simulaciones = []; DB.version = '4.0.0'; }
function save() { try { var copia = JSON.parse(JSON.stringify(DB)); for (var i = 0; i < copia.animales.length; i++) { if (copia.animales[i].foto && copia.animales[i].foto.length > 100) { fotosDB[copia.animales[i].id] = copia.animales[i].foto; copia.animales[i].foto = '[FOTO]'; } } localStorage.setItem('ganadero_elite_v10', JSON.stringify(copia)); localStorage.setItem('ganadero_fotos', JSON.stringify(fotosDB)); } catch(e) { showToast('⚠️ Error guardando'); } }

// ==================== CATÁLOGOS ====================
var ALIMENTOS = ['pasto','salvado','melaza','levadura','bicarb','sal','urea'];
var IC_ALIMENTOS = { pasto:'🌱', salvado:'🌾', melaza:'💧', levadura:'🧪', bicarb:'🧊', sal:'🧂', urea:'⚗️' };
var NM_ALIMENTOS = { pasto:'Pasto Picado', salvado:'Salvado Trigo', melaza:'Melaza', levadura:'Levadura', bicarb:'Bicarbonato', sal:'Sal Mineral', urea:'UREA' };
var CATALOGO_SANIDAD = [
    { id:'modificador', nombre:'Modificador Orgánico', dosis:50, diasEfecto:90, retiro:0, icono:'🧪', color:'#22c55e', tipo:'fijo', impactoGMD: 0.05 },
    { id:'vitaminaA', nombre:'Vitamina ADE', dosis:50, diasEfecto:60, retiro:30, icono:'☀️', color:'#fbbf24', tipo:'fijo', impactoGMD: 0.02 },
    { id:'complejoB', nombre:'Complejo B (B12)', dosis:50, diasEfecto:20, retiro:0, icono:'💊', color:'#3b82f6', tipo:'fijo', impactoGMD: 0.03 },
    { id:'ivermectina1', nombre:'Ivermectina 1%', dosis:50, diasEfecto:30, retiro:28, icono:'🛡️', color:'#ef4444', tipo:'fijo', impactoGMD: 0.04 },
    { id:'ivermectina315', nombre:'Ivermectina 3.15%', dosis:50, diasEfecto:90, retiro:122, icono:'🛡️', color:'#dc2626', tipo:'fijo', impactoGMD: 0.04 },
    { id:'fosforo', nombre:'Fósforo B12', dosis:20, diasEfecto:30, retiro:0, icono:'🦴', color:'#a78bfa', tipo:'fijo', impactoGMD: 0.01 },
    { id:'hierro', nombre:'Hierro Dextrano', dosis:100, diasEfecto:30, retiro:0, icono:'💧', color:'#f87171', tipo:'fijo', impactoGMD: 0.01 }
];
function getCatalogoSanidadCompleto() { return CATALOGO_SANIDAD.concat(DB.suplementosSanidad); }

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
        return { nombre:'Parida', clase:'etapa-ceba', icono:'🐄', rango:'Parida', min:350, max:9999, color:'#fb923c', cardClass:'etapa-ceba-card' };
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
function getRendimiento(h) { if (h.length < 2) return { nivel:'azul', texto:'Registre más', icono:'ℹ️', cm:0, color:'azul', pct:0 }; var act = h[h.length-1].peso, ant = h[h.length-2].peso, cm = ((act-ant)/ant)*100; var pct = Math.min(100, Math.max(0, 50 + cm * 10)); if (act < ant) return { nivel:'gris', texto:'Pérdida', icono:'⚠️', cm:cm, color:'gris', pct:Math.max(0, 40 + cm * 10) }; if (cm >= 5) return { nivel:'verde', texto:'Excelente', icono:'👑', cm:cm, color:'verde', pct:Math.min(100, 80 + cm) }; if (cm >= 3.5) return { nivel:'azul', texto:'Bueno', icono:'✅', cm:cm, color:'azul', pct:Math.min(79, 65 + cm * 2) }; if (cm >= 2.5) return { nivel:'naranja', texto:'Regular', icono:'⚠️', cm:cm, color:'naranja', pct:Math.min(64, 45 + cm * 4) }; return { nivel:'rojo', texto:'Bajo', icono:'❌', cm:cm, color:'rojo', pct:Math.min(44, 20 + cm * 6) }; }
function getEficiencia(pct) { if (pct >= 90) return { nivel:'Excelente', color:'#22c55e', icono:'🏆' }; if (pct >= 75) return { nivel:'Buena', color:'#60a5fa', icono:'✅' }; if (pct >= 60) return { nivel:'Regular', color:'#fbbf24', icono:'⚠️' }; return { nivel:'Crítica', color:'#ef4444', icono:'🔴' }; }

// ==================== 🧠 IA CENTRAL - MOTOR PREDICTIVO ====================
var CACHE_IA = { calculado: 0, datos: null };
function getIAData(force) {
    if (!force && CACHE_IA.calculado > Date.now() - 5000 && CACHE_IA.datos) return CACHE_IA.datos;
    
    var data = { animales: [], lotes: [], global: {}, alertas: [], ranking: [], tendencia: '', eficienciaGlobal: 0, gmdPromedio: 0 };
    var price = DB.precioKG;
    var todosGMD = [];
    
    // Análisis individual de cada animal
    for (var i = 0; i < DB.animales.length; i++) {
        var a = DB.animales[i];
        var pv = a.historial[a.historial.length-1].peso;
        var gmd = getGMD(a.historial);
        var etapa = getEtapaCompleta(pv, a.tipo, a.estadoRepro);
        var r = getRendimiento(a.historial);
        var cd = getCostoDiario(pv, a.tipo, a.estadoRepro);
        var pred30 = predecirPeso(a.historial, 30);
        var pred60 = predecirPeso(a.historial, 60);
        var pred90 = predecirPeso(a.historial, 90);
        var pred120 = predecirPeso(a.historial, 120);
        var confianza = getConfianzaPrediccion(a.historial);
        var tendTxt = getTendenciaTexto(a.historial);
        var diasPara500 = getDiasParaMeta(pv, 500, gmd);
        var fechaVenta = new Date(Date.now() + diasPara500 * 86400000);
        var ingM = gmd * 30 * price;
        var gan = ingM - (cd * 30);
        var eficiencia = r.pct;
        var valorActual = pv * price;
        var tendenciaHistorica = getTendenciaHistorica(a.historial);
        var anomalias = detectarAnomalias(a);
        
        var animalData = {
            id: a.id, nombre: a.nombre, tipo: a.tipo, peso: pv, gmd: gmd, etapa: etapa, rendimiento: r,
            costoDiario: cd, gananciaMensual: gan, valorActual: valorActual, eficiencia: eficiencia,
            predicciones: { p30: pred30 ? pred30.peso : null, p60: pred60 ? pred60.peso : null, p90: pred90 ? pred90.peso : null, p120: pred120 ? pred120.peso : null },
            confianza: confianza, tendencia: tendTxt, tendenciaHistorica: tendenciaHistorica,
            diasParaVenta: diasPara500, fechaVenta: fechaVenta, fechaVentaStr: fechaVenta.toLocaleDateString(),
            anomalias: anomalias, sugerencias: [], alertas: [], historial: a.historial, estadoRepro: a.estadoRepro, loteId: a.lote
        };
        
        // Generar sugerencias personalizadas
        if (gmd < 0.2) animalData.alertas.push({ tipo:'critico', icon:'🔴', texto:'GMD crítica. Considere venta urgente.', accion:'vender' });
        if (anomalias.length > 0) animalData.alertas.push({ tipo:'anomalia', icon:'⚠️', texto:'Posible anomalía en último pesaje. Verificar báscula.', accion:'revisar' });
        if (tendenciaHistorica === 'cayendo') animalData.alertas.push({ tipo:'tendencia', icon:'🟡', texto:'GMD en descenso hace 2 meses. Revisar dieta.', accion:'revisarDieta' });
        if (pv >= 500 && a.tipo === 'engorde') animalData.alertas.push({ tipo:'venta', icon:'🎯', texto:'Peso de venta alcanzado. Vender pronto para máx. ganancia.', accion:'vender' });
        if (etapa.nombre === 'Levante' && gmd > 0.3) animalData.sugerencias.push({ icon:'💡', texto:'Preparar cambio a dieta Ceba en ~' + getDiasParaMeta(pv, 350, gmd) + ' días', accion:'planificar', impacto: '+0.08 kg/d' });
        if (gmd > 0 && gmd < 0.3 && pv > 150) animalData.sugerencias.push({ icon:'🧪', texto:'Aplicar Modificador Orgánico (impacto est: +0.05 kg/d)', accion:'aplicarModificador', impacto: '+0.05 kg/d' });
        if (pv >= 350 && pv < 500) animalData.sugerencias.push({ icon:'📈', texto:'Aumentar melaza a 5% al entrar a Ceba (impacto: +0.08 kg/d)', accion:'aumentarMelaza', impacto: '+0.08 kg/d' });
        
        data.animales.push(animalData);
        if (a.historial.length >= 2) todosGMD.push(gmd);
    }
    
    // GMD promedio y tendencia global
    data.gmdPromedio = todosGMD.length > 0 ? todosGMD.reduce(function(a,b){return a+b;},0) / todosGMD.length : 0;
    data.tendencia = data.gmdPromedio > 0.35 ? '📈 ACELERANDO' : data.gmdPromedio > 0.25 ? '📊 ESTABLE' : '📉 CAYENDO';
    data.eficienciaGlobal = data.animales.length > 0 ? Math.round(data.animales.reduce(function(s,a){return s+a.eficiencia;},0) / data.animales.length) : 0;
    
    // Ranking
    data.ranking = data.animales.slice().sort(function(a,b){ return b.eficiencia - a.eficiencia; });
    
    // Análisis por lotes
    for (var l = 0; l < DB.lotes.length; l++) {
        var lote = DB.lotes[l];
        var animalesLote = data.animales.filter(function(a){ return a.loteId === lote.id; });
        if (animalesLote.length === 0) continue;
        var gmdLote = animalesLote.reduce(function(s,a){return s+a.gmd;},0) / animalesLote.length;
        var efLote = Math.round(animalesLote.reduce(function(s,a){return s+a.eficiencia;},0) / animalesLote.length);
        var kgLote = Math.round(animalesLote.reduce(function(s,a){return s+a.peso;},0));
        var ganLote = Math.round(animalesLote.reduce(function(s,a){return s+a.gananciaMensual;},0));
        var rankingLote = animalesLote.slice().sort(function(a,b){ return b.eficiencia - a.eficiencia; });
        data.lotes.push({ id: lote.id, nombre: lote.nombre, tipo: lote.tipo, gmd: gmdLote, eficiencia: efLote, kg: kgLote, ganancia: ganLote, animales: animalesLote.length, ranking: rankingLote, alertas: [], sugerencias: [] });
    }
    
    // Alertas globales del sistema
    data.alertas = getAlertasSistema();
    
    CACHE_IA = { calculado: Date.now(), datos: data };
    return data;
}

function getTendenciaHistorica(historial) {
    if (historial.length < 3) return 'estable';
    var gmds = [];
    for (var i = 1; i < historial.length; i++) {
        var dias = getDiasDesde(historial[i-1].fecha) - getDiasDesde(historial[i].fecha);
        if (dias > 0) gmds.push((historial[i].peso - historial[i-1].peso) / (dias / 30));
    }
    if (gmds.length < 2) return 'estable';
    var reciente = gmds.slice(-2).reduce(function(a,b){return a+b;},0)/2;
    var anterior = gmds.slice(0, -2).reduce(function(a,b){return a+b;},0)/(gmds.length-2) || reciente;
    var cambio = ((reciente - anterior) / (anterior || 1)) * 100;
    if (cambio > 10) return 'acelerando';
    if (cambio < -10) return 'cayendo';
    return 'estable';
}

function detectarAnomalias(animal) {
    var anomalias = [];
    var h = animal.historial;
    if (h.length < 3) return anomalias;
    // Detectar caídas bruscas de peso
    for (var i = 1; i < h.length; i++) {
        var cambio = h[i].peso - h[i-1].peso;
        var dias = getDiasDesde(h[i-1].fecha) - getDiasDesde(h[i].fecha);
        if (cambio < -20) anomalias.push({ tipo:'caida', fecha: h[i].fecha, detalle: 'Caída de ' + Math.abs(cambio) + ' kg. Posible error de báscula o enfermedad.' });
    }
    return anomalias;
}

function predecirPeso(historial, diasFuturo) {
    if (historial.length < 3) return null;
    var n = historial.length, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    var p0 = historial[0].fecha.split('/');
    var fb = new Date(parseInt(p0[2]), parseInt(p0[1])-1, parseInt(p0[0]));
    if (isNaN(fb.getTime())) return null;
    for (var i = 0; i < n; i++) {
        var pi = historial[i].fecha.split('/');
        var fa = new Date(parseInt(pi[2]), parseInt(pi[1])-1, parseInt(pi[0]));
        if (isNaN(fa.getTime())) continue;
        var dr = Math.floor((fa - fb) / 86400000);
        sumX += dr; sumY += historial[i].peso; sumXY += dr * historial[i].peso; sumX2 += dr * dr;
    }
    var den = (n * sumX2 - sumX * sumX);
    if (den === 0) return null;
    var m = (n * sumXY - sumX * sumY) / den;
    var b = (sumY - m * sumX) / n;
    var pu = historial[n-1].fecha.split('/');
    var fu = new Date(parseInt(pu[2]), parseInt(pu[1])-1, parseInt(pu[0]));
    return { peso: m * (Math.floor((fu - fb) / 86400000) + diasFuturo) + b, tendencia: m, gmd: m };
}
function getConfianzaPrediccion(historial) { if (historial.length < 3) return { nivel:'Baja', pct:40 }; var cm = []; for (var i = 1; i < historial.length; i++) cm.push(historial[i].peso - historial[i-1].peso); var med = cm.reduce(function(a,b){return a+b;},0)/cm.length; if (med === 0) return { nivel:'Baja', pct:30 }; var vr = cm.reduce(function(a,b){return a+Math.pow(b-med,2);},0)/cm.length; var cv = Math.sqrt(vr)/Math.abs(med); if (cv < 0.3) return { nivel:'Alta', pct:Math.round(100 - cv*100) }; if (cv < 0.6) return { nivel:'Media', pct:Math.round(100 - cv*100) }; return { nivel:'Baja', pct:Math.round(100 - cv*100) }; }
function getTendenciaTexto(historial) { if (historial.length < 2) return '📊 Estable'; var c = 0; for (var i = 1; i < historial.length; i++) { if (historial[i].peso > historial[i-1].peso) c++; else if (historial[i].peso < historial[i-1].peso) c--; } if (c > 1) return '📈 Acelerando'; if (c > 0) return '📈 Mejorando'; if (c < -1) return '📉 Cayendo'; return '📊 Estable'; }
function getDiasParaMeta(pesoActual, meta, gmd) { if (gmd <= 0) return 9999; return Math.round((meta - pesoActual) / gmd); }

// ==================== SIMULADOR IA ====================
function simularCambio(animalId, accion) {
    var a = DB.animales.find(function(x){ return x.id === animalId; });
    if (!a) return null;
    var pv = a.historial[a.historial.length-1].peso;
    var gmdActual = getGMD(a.historial);
    var cdActual = getCostoDiario(pv, a.tipo, a.estadoRepro);
    
    var simulacion = { gmdBase: gmdActual, costoBase: cdActual, gmdSimulado: gmdActual, costoSimulado: cdActual, acciones: [], roi: 0, impactoGanancia: 0 };
    
    if (accion === 'melaza5') {
        var d5 = getDietaCompleta(pv, a.tipo, a.estadoRepro, 5);
        var cd5 = getCostoDiario(pv, a.tipo, a.estadoRepro, 5);
        simulacion.gmdSimulado = gmdActual * 1.12;
        simulacion.costoSimulado = cd5;
        simulacion.acciones.push('Aumentar melaza al 5%');
    } else if (accion === 'modificador') {
        simulacion.gmdSimulado = gmdActual + 0.05;
        simulacion.costoSimulado = cdActual + 500;
        simulacion.acciones.push('Aplicar Modificador Orgánico');
    } else if (accion === 'desparasitar') {
        simulacion.gmdSimulado = gmdActual + 0.04;
        simulacion.costoSimulado = cdActual + 300;
        simulacion.acciones.push('Desparasitar');
    } else if (accion === 'ambos') {
        var d5 = getDietaCompleta(pv, a.tipo, a.estadoRepro, 5);
        var cd5 = getCostoDiario(pv, a.tipo, a.estadoRepro, 5);
        simulacion.gmdSimulado = gmdActual * 1.12 + 0.05;
        simulacion.costoSimulado = cd5 + 500;
        simulacion.acciones.push('Melaza 5% + Modificador');
    }
    
    var ingBase = gmdActual * 30 * DB.precioKG;
    var ingSim = simulacion.gmdSimulado * 30 * DB.precioKG;
    var ganBase = ingBase - cdActual * 30;
    var ganSim = ingSim - simulacion.costoSimulado * 30;
    simulacion.roi = Math.round(((ganSim - ganBase) / Math.abs(ganBase || 1)) * 100);
    simulacion.impactoGanancia = Math.round(ganSim - ganBase);
    
    // Fecha de venta
    var diasBase = getDiasParaMeta(pv, 500, gmdActual);
    var diasSim = getDiasParaMeta(pv, 500, simulacion.gmdSimulado);
    simulacion.fechaVentaBase = new Date(Date.now() + diasBase * 86400000).toLocaleDateString();
    simulacion.fechaVentaSim = new Date(Date.now() + diasSim * 86400000).toLocaleDateString();
    simulacion.diasAdelanto = diasBase - diasSim;
    
    return simulacion;
}

// ==================== ALERTAS ====================
function getAlertasSistema() {
    var alertas = [], mez = { pasto:0, salvado:0, sal:0, melaza:0, urea:0, levadura:0, bicarb:0 };
    DB.animales.forEach(function(a) { var d = getDietaCompleta(a.historial[a.historial.length-1].peso, a.tipo, a.estadoRepro); for (var k in mez) mez[k] += (d[k] || 0); });
    for (var j = 0; j < ALIMENTOS.length; j++) { var st = DB.stock[ALIMENTOS[j]] || 0, co = mez[ALIMENTOS[j]] || 0, cr = (ALIMENTOS[j] === 'pasto' || ALIMENTOS[j] === 'salvado') ? co : co/1000; if (st > 0 && cr > 0 && st/cr < 3) alertas.push({ t:'r', m: NM_ALIMENTOS[ALIMENTOS[j]] + ': Stock ' + Math.round(st/cr) + 'd', icon: IC_ALIMENTOS[ALIMENTOS[j]] }); }
    DB.animales.forEach(function(a) { var du = getDiasDesde(a.historial[a.historial.length-1].fecha); if (du > 30) alertas.push({ t:'w', m: a.nombre + ': Pesaje vencido (' + du + 'd)', icon:'📅' }); });
    return alertas;
}

// ==================== NAVEGACIÓN ====================
document.getElementById('bottomNav').addEventListener('click', function(e) { var btn = e.target.closest('button'); if (!btn || !btn.hasAttribute('data-p')) return; goPage(btn.getAttribute('data-p')); });
function goPage(p) { ['v-lotes','v-animales','v-insumos','v-ajustes','v-perfil'].forEach(function(id) { document.getElementById(id).classList.add('hidden'); }); document.getElementById('v-' + p).classList.remove('hidden'); var btns = document.querySelectorAll('#bottomNav .bn-btn'); for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active'); var ab = document.querySelector('#bottomNav button[data-p="' + p + '"]'); if (ab) ab.classList.add('active'); if (p === 'lotes') renderLotes(); if (p === 'animales') renderAnimales(); if (p === 'insumos') renderInsumos(); if (p === 'ajustes') renderAjustes(); window.scrollTo(0, 0); }

// ==================== MODAL AGREGAR (sin cambios) ====================
function toggleAdd() { var m = document.getElementById('addAnimalModal'); m.classList.toggle('hidden'); if (!m.classList.contains('hidden')) { actualizarSelectLotes(); document.getElementById('newN').focus(); } }
function closeAddModal() { document.getElementById('addAnimalModal').classList.add('hidden'); }
function toggleOrigen() { var o = document.getElementById('newOrigen').value; document.getElementById('origenNacimiento').classList.toggle('hidden', o !== 'nacimiento'); document.getElementById('origenComprado').classList.toggle('hidden', o !== 'comprado'); }
function actualizarSelectLotes() { var sel = document.getElementById('newLote'); sel.innerHTML = '<option value="">Sin lote</option>'; for (var i = 0; i < DB.lotes.length; i++) sel.innerHTML += '<option value="' + DB.lotes[i].id + '">' + DB.lotes[i].nombre + '</option>'; }
function addAnimal() { var n = document.getElementById('newN').value.trim(), p = parseFloat(document.getElementById('newW').value); if (!n || n.length < 2) { showToast('⚠️ Nombre válido'); return; } if (isNaN(p) || p < 20 || p > 2000) { showToast('⚠️ Peso 20-2000 kg'); return; } var tipo = document.getElementById('newTipo').value; var origen = document.getElementById('newOrigen').value; var loteId = document.getElementById('newLote').value; var animal = { id: Date.now(), nombre: escapeHTML(n), tipo: tipo, origen: origen, historial: [{ fecha: new Date().toLocaleDateString(), peso: p }], lote: loteId || null, foto: null }; if (origen === 'nacimiento') { animal.madre = document.getElementById('newMadre').value.trim() || null; animal.fechaNacimiento = new Date().toLocaleDateString(); } if (origen === 'comprado') { animal.precioCompra = parseFloat(document.getElementById('newPrecio').value) || 0; animal.fechaCompra = new Date().toLocaleDateString(); } if (tipo === 'leche') { animal.estadoRepro = (p < 350) ? 'novilla' : 'parida'; animal.produccionLeche = []; } DB.animales.push(animal); save(); CACHE_IA = { calculado: 0, datos: null }; closeAddModal(); renderLotes(); showToast('✅ ' + n + ' registrado'); }

// ==================== RENDER LOTES - DASHBOARD IA ====================
function renderLotes() {
    var ia = getIAData(true);
    var price = DB.precioKG, totalKg = 0;
    for (var i = 0; i < ia.animales.length; i++) totalKg += ia.animales[i].peso;
    var valorTotal = totalKg * price;
    var eficiencia = getEficiencia(ia.eficienciaGlobal);
    
    // Calcular proyecciones globales
    var pesoProy90 = 0, gananciaProy90 = 0;
    for (var i = 0; i < ia.animales.length; i++) {
        if (ia.animales[i].predicciones.p90) {
            pesoProy90 += ia.animales[i].predicciones.p90;
            gananciaProy90 += (ia.animales[i].predicciones.p90 - ia.animales[i].peso) * price - ia.animales[i].costoDiario * 90;
        }
    }
    
    // Mejor y peor lote
    var lotesOrdenados = ia.lotes.slice().sort(function(a,b){ return b.eficiencia - a.eficiencia; });
    var mejorLote = lotesOrdenados.length > 0 ? lotesOrdenados[0] : null;
    var peorLote = lotesOrdenados.length > 1 ? lotesOrdenados[lotesOrdenados.length-1] : null;
    
    // Sugerencia global
    var sugerenciaGlobal = '';
    if (ia.eficienciaGlobal < 85) sugerenciaGlobal = 'Para llegar al 90%: Desparasitar animales críticos y aumentar melaza en lotes de Ceba.';
    
    var iaHTML = '<div class="ia-card">' +
        '<div class="ia-title">🧠 IA DEL SISTEMA</div>' +
        '<div style="font-size:.68rem;color:var(--muted);margin-bottom:8px;">📈 TENDENCIA GENERAL: ' + ia.tendencia + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">' +
        '<div class="proyeccion-item"><div class="dias">PESO HOY</div><div class="peso">' + fm(totalKg) + ' kg</div><div class="ganancia">$ ' + fm(valorTotal) + '</div></div>' +
        '<div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(pesoProy90) + ' kg</div><div class="ganancia" style="color:' + (gananciaProy90 >= 0 ? '#22c55e' : '#ef4444') + '">' + (gananciaProy90 >= 0 ? '+' : '') + '$ ' + fm(gananciaProy90) + '</div></div>' +
        '<div class="proyeccion-item"><div class="dias">EFICIENCIA</div><div class="peso">' + ia.eficienciaGlobal + '%</div><div class="ganancia" style="color:' + eficiencia.color + '">' + eficiencia.nivel + '</div></div></div>';
    
    if (mejorLote) iaHTML += '<div class="ranking-item">🏆 LOTE ESTRELLA: <b>' + escapeHTML(mejorLote.nombre) + '</b> (' + mejorLote.eficiencia + '% efic.)</div>';
    if (peorLote && peorLote !== mejorLote) iaHTML += '<div class="ranking-item">⚠️ LOTE CRÍTICO: <b>' + escapeHTML(peorLote.nombre) + '</b> (' + peorLote.eficiencia + '% efic.)</div>';
    if (sugerenciaGlobal) iaHTML += '<div class="ia-sugerencia"><span class="ia-icon">💡</span>' + sugerenciaGlobal + '</div>';
    iaHTML += '</div>';

    // Lotes HTML
    var lotesHTML = '';
    for (var i = 0; i < ia.lotes.length; i++) {
        var l = ia.lotes[i];
        var tipoIcono = l.tipo === 'engorde' ? '🥩' : '🥛';
        lotesHTML += '<div class="lote-card" onclick="verLote(\'' + l.id + '\')"><div class="lote-nombre">' + tipoIcono + ' ' + escapeHTML(l.nombre) + ' <span style="font-size:.6rem;color:var(--muted);">(' + l.animales + ')</span></div><div class="lote-stats"><div class="lote-stat"><div class="val">' + fm(l.kg) + ' kg</div><div class="lbl">Peso total</div></div><div class="lote-stat"><div class="val">' + l.gmd.toFixed(2) + '</div><div class="lbl">GMD</div></div><div class="lote-stat"><div class="val" style="color:' + (l.ganancia >= 0 ? '#22c55e' : '#ef4444') + '">' + (l.ganancia >= 0 ? '+' : '') + '$' + fm(l.ganancia) + '</div><div class="lbl">Ganancia/mes</div></div></div><div class="progress-lote"><div class="progress-lote-fill" style="width:' + l.eficiencia + '%;"></div></div></div>';
    }
    
    var animalesSinLote = DB.animales.filter(function(a) { return !a.lote; });
    if (animalesSinLote.length > 0) lotesHTML += '<div class="lote-card" onclick="verAnimalesSinLote()"><div class="lote-nombre">📋 SIN LOTE <span style="font-size:.6rem;color:var(--muted);">(' + animalesSinLote.length + ')</span></div></div>';
    
    // Alertas
    var alHTML = '';
    var alertasL = ia.alertas;
    if (alertasL.length > 0) {
        alHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.68rem;margin-bottom:6px;color:var(--muted);">🔔 ALERTAS (' + alertasL.length + ')</div>';
        for (var x = 0; x < Math.min(alertasL.length, 4); x++) { var cls = alertasL[x].t === 'r' ? 'alert-danger' : 'alert-warning'; alHTML += '<div class="alert-item ' + cls + '">' + alertasL[x].icon + ' ' + alertasL[x].m + '</div>'; }
        alHTML += '</div>';
    }
    
    var html = '<div class="card card-sm"><div style="font-weight:600;">💰 PRECIO KG EN PIE</div><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:1.1rem;font-weight:800;color:var(--accent);">$</span><input id="inpPKG" type="number" value="' + price + '" style="font-size:1.1rem;font-weight:700;text-align:center;"><span style="font-size:.7rem;color:var(--muted);">COP</span></div><button class="btn btn-green mt8" onclick="savePKG()">✅ ACTUALIZAR</button></div>' +
        '<div class="card card-sm"><div class="capital-value">$ ' + fm(valorTotal) + '</div><div class="stats-grid"><div class="stat-item"><div class="row-label">🐄 Cabezas</div><div class="row-val">' + ia.animales.length + '</div></div><div class="stat-item"><div class="row-label">⚖️ Peso Total</div><div class="row-val">' + fm(totalKg) + ' kg</div></div></div></div>' +
        '<div class="section-title">📊 LOTES</div>' + lotesHTML + iaHTML + alHTML;
    document.getElementById('v-lotes').innerHTML = html;
}
function savePKG() { var el = document.getElementById('inpPKG'); if (el) { DB.precioKG = parseFloat(el.value) || 0; save(); renderLotes(); showToast('✅ Precio actualizado'); } }

// ==================== RENDER ANIMALES (TODOS) ====================
function renderAnimales() {
    var ia = getIAData(true);
    var price = DB.precioKG, totalKg = 0;
    for (var i = 0; i < ia.animales.length; i++) totalKg += ia.animales[i].peso;
    
    // Distribución por rendimiento
    var dist = { verde:0, azul:0, naranja:0, rojo:0, gris:0 };
    for (var i = 0; i < ia.animales.length; i++) dist[ia.animales[i].rendimiento.nivel]++;
    var distHTML = '<div class="ia-card"><div class="ia-title">🧠 IA - ANÁLISIS COMPLETO</div>' +
        '<div style="font-size:.68rem;color:var(--muted);margin-bottom:6px;">📊 DISTRIBUCIÓN POR RENDIMIENTO</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:.62rem;margin-bottom:8px;">' +
        '<span>🟢 Excelente: ' + (dist.verde||0) + '</span><span>🔵 Bueno: ' + (dist.azul||0) + '</span><span>🟡 Regular: ' + (dist.naranja||0) + '</span><span>🔴 Crítico: ' + (dist.rojo||0) + '</span></div>' +
        '<div style="font-size:.65rem;color:var(--muted);">📈 GMD prom: ' + ia.gmdPromedio.toFixed(2) + ' kg/d · Eficiencia: ' + ia.eficienciaGlobal + '%</div>' +
        '<div style="font-size:.65rem;color:var(--muted);">Tendencia: ' + ia.tendencia + '</div></div>';
    
    // Top 3
    var rankingHTML = '';
    for (var i = 0; i < Math.min(ia.ranking.length, 3); i++) {
        var medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        var rk = ia.ranking[i];
        rankingHTML += '<div class="ranking-item" onclick="showProfile(' + rk.id + ')">' + medalla + ' <b>' + escapeHTML(rk.nombre) + '</b>: ' + rk.eficiencia + '% (+' + rk.gmd.toFixed(2) + ')</div>';
    }
    
    // Críticos
    var criticos = ia.animales.filter(function(a){ return a.rendimiento.nivel === 'rojo' || a.rendimiento.nivel === 'gris'; });
    var criticosHTML = '';
    for (var c = 0; c < criticos.length; c++) {
        var cr = criticos[c];
        criticosHTML += '<div class="ranking-item" onclick="showProfile(' + cr.id + ')">🔴 <b>' + escapeHTML(cr.nombre) + '</b>: GMD ' + cr.gmd.toFixed(2) + ' (' + cr.eficiencia + '%)</div>';
    }
    
    // Grid de animales
    var cards = '';
    for (var i = 0; i < DB.animales.length; i++) {
        var a = DB.animales[i], cp = a.historial[a.historial.length-1].peso, etapa = getEtapaCompleta(cp, a.tipo, a.estadoRepro), r = getRendimiento(a.historial), lm = { verde:'ml-g', azul:'ml-b', naranja:'ml-o', rojo:'ml-r', gris:'ml-x' };
        cards += '<div class="animal-card ' + etapa.cardClass + '" onclick="showProfile(' + a.id + ')"><div class="mini-led ' + lm[r.nivel] + '"></div><div class="animal-avatar">' + getIconoAnimal(a) + '</div><div class="name">' + escapeHTML(a.nombre) + '</div><span class="etapa-tag ' + etapa.clase + '">' + etapa.rango + '</span><div class="weight">' + fm(cp) + ' kg</div><div class="cm" style="color:' + (r.cm >= 0 ? '#22c55e' : '#ef4444') + '">' + (r.cm >= 0 ? '+' : '') + r.cm.toFixed(1) + '%</div></div>';
    }
    
    var html = distHTML +
        '<div class="card card-sm"><div class="capital-value">$ ' + fm(totalKg * price) + '</div></div>' +
        '<div class="section-title">🏆 TOP 3</div>' + rankingHTML +
        (criticos.length > 0 ? '<div class="section-title">⚠️ CRÍTICOS</div>' + criticosHTML : '') +
        '<div class="section-title">🐄 TODOS</div><div class="grid">' + cards + '</div>';
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

// ==================== PERFIL ANIMAL - IA COMPLETA ====================
function showProfile(id) {
    var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return;
    var ia = getIAData();
    var animalData = ia.animales.find(function(x){ return x.id === id; });
    if (!animalData) return;
    
    var p = animalData.peso, gmd = animalData.gmd, etapa = animalData.etapa, r = animalData.rendimiento;
    var cd = animalData.costoDiario, gan = animalData.gananciaMensual, valorActual = animalData.valorActual;
    var confianza = animalData.confianza;
    var semaforo = getSemaforo(a);
    var loteActual = DB.lotes.find(function(l) { return l.id === a.lote; });
    
    // Comparativa
    var loteAnimales = ia.animales.filter(function(x){ return x.loteId === a.lote; });
    var gmdPromLote = loteAnimales.length > 0 ? loteAnimales.reduce(function(s,x){return s+x.gmd;},0) / loteAnimales.length : 0;
    var mejorLote = loteAnimales.length > 0 ? loteAnimales.reduce(function(mejor,x){ return x.gmd > mejor.gmd ? x : mejor; }, loteAnimales[0]) : null;
    var comp = getComparativa(gmd, gmdPromLote, mejorLote ? mejorLote.gmd : 0);
    
    // Sugerencias
    var sugerenciasHTML = '';
    for (var s = 0; s < animalData.sugerencias.length; s++) {
        var sug = animalData.sugerencias[s];
        sugerenciasHTML += '<div class="ia-sugerencia"><span class="ia-icon">' + sug.icon + '</span>' + sug.texto + ' <span style="color:#22c55e;font-size:.6rem;">' + (sug.impacto || '') + '</span></div>';
    }
    
    // Simulador inline
    var simulacion = simularCambio(id, 'ambos');
    var simHTML = '';
    if (simulacion) {
        simHTML = '<div class="ia-card" style="margin-top:8px;"><div class="ia-title">🔮 SIMULADOR</div>' +
            '<div style="font-size:.6rem;color:var(--muted);margin-bottom:4px;">¿Qué pasa si aplicas Melaza 5% + Modificador?</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:.62rem;">' +
            '<div>GMD actual: <b>' + gmd.toFixed(2) + '</b></div><div>GMD simulado: <b style="color:#22c55e">' + simulacion.gmdSimulado.toFixed(2) + '</b></div>' +
            '<div>Venta: <b>' + animalData.fechaVentaStr + '</b></div><div>Venta simulada: <b style="color:#fbbf24">' + simulacion.fechaVentaSim + '</b></div>' +
            '<div>Ganancia extra: <b style="color:#22c55e">+$' + fm(simulacion.impactoGanancia) + '</b></div><div>ROI: <b style="color:#22c55e">' + simulacion.roi + '%</b></div></div>' +
            '<div style="font-size:.55rem;color:var(--muted);margin-top:4px;">🟢 RECOMENDADO: El ROI es muy positivo</div></div>';
    }
    
    // Alertas del animal
    var alertasHTML = '';
    for (var al = 0; al < animalData.alertas.length; al++) {
        var alerta = animalData.alertas[al];
        var color = alerta.tipo === 'critico' ? '#ef4444' : alerta.tipo === 'anomalia' ? '#f59e0b' : '#60a5fa';
        alertasHTML += '<div class="ia-sugerencia" style="border-left:3px solid ' + color + ';padding-left:6px;"><span class="ia-icon">' + alerta.icon + '</span>' + alerta.texto + '</div>';
    }
    
    document.getElementById('v-lotes').classList.add('hidden'); document.getElementById('v-animales').classList.add('hidden'); document.getElementById('v-insumos').classList.add('hidden'); document.getElementById('v-ajustes').classList.add('hidden'); document.getElementById('v-perfil').classList.remove('hidden');
    
    var html = '<div class="card"><div class="profile-cover"><div class="profile-avatar" onclick="abrirFoto(' + id + ')">' + getIconoAnimal(a) + '<div class="foto-overlay">📸</div></div><div class="profile-name">' + escapeHTML(a.nombre) + '</div><div class="profile-sub">' + etapa.rango + ' · ' + (a.tipo === 'engorde' ? '🥩 Engorde' : '🥛 Leche') + '</div><div class="profile-stats"><div class="profile-stat"><div class="val">' + fm(p) + ' kg</div><div class="lbl">Peso</div></div><div class="profile-stat"><div class="val">' + gmd.toFixed(2) + '</div><div class="lbl">GMD</div></div><div class="profile-stat"><div class="val">$ ' + fm(valorActual) + '</div><div class="lbl">Valor</div></div></div></div>' +
        '<div class="alerta-card ' + r.color + '"><div class="alerta-led ' + r.color + '">' + r.icono + '</div><div><div class="alerta-titulo">' + r.texto + '</div><div class="alerta-met">' + (r.cm >= 0 ? '+' : '') + r.cm.toFixed(1) + '% · Eficiencia: ' + animalData.eficiencia + '%</div></div></div>' +
        '<div class="ia-card"><div class="ia-title">🧠 IA (' + confianza.nivel + ' ' + confianza.pct + '%)</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:6px;">' +
        '<div class="proyeccion-item"><div class="dias">30 DÍAS</div><div class="peso">' + fm(animalData.predicciones.p30 || p + gmd*30) + ' kg</div></div>' +
        '<div class="proyeccion-item"><div class="dias">60 DÍAS</div><div class="peso">' + fm(animalData.predicciones.p60 || p + gmd*60) + ' kg</div></div>' +
        '<div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(animalData.predicciones.p90 || p + gmd*90) + ' kg</div></div></div>' +
        '<div style="font-size:.62rem;color:var(--muted);">🎯 VENTA ÓPTIMA: ' + animalData.fechaVentaStr + ' (' + animalData.diasParaVenta + ' días) → $' + fm((500 - p) * DB.precioKG) + '</div>' +
        '<div style="font-size:.6rem;color:var(--muted);">📊 COMPARATIVA: ' + comp.textoProm + ' · ' + comp.textoMejor + '</div></div>' +
        (alertasHTML ? '<div class="card card-sm" style="background:rgba(239,68,68,.03);"><div style="font-weight:700;font-size:.65rem;color:#ef4444;margin-bottom:4px;">⚠️ ALERTAS IA</div>' + alertasHTML + '</div>' : '') +
        (sugerenciasHTML ? '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;color:var(--accent);margin-bottom:4px;">💡 SUGERENCIAS IA</div>' + sugerenciasHTML + '</div>' : '') +
        simHTML +
        '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;"><button class="btn btn-purple btn-sm" onclick="openAplicarSanidad(' + id + ')" style="flex:1;">💉 Sanidad</button><button class="btn btn-gold btn-sm" onclick="updateWeight(' + id + ')" style="flex:2;">⚖️ PESAJE</button></div>';
    document.getElementById('v-perfil').innerHTML = html;
    window.scrollTo(0, 0);
}

function updateWeight(id) { showInput('⚖️ Nuevo pesaje (kg):', 'Ej: 185', function(v) { if (!v) return; var p = parseFloat(v); if (isNaN(p) || p < 20 || p > 2000) { showToast('⚠️ Peso inválido'); return; } var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.historial.push({ fecha: new Date().toLocaleDateString(), peso: p }); save(); CACHE_IA = { calculado: 0, datos: null }; showProfile(id); showToast('✅ Pesaje guardado'); }); }
function abrirFoto(id) { var input = document.getElementById('fotoInput'); input.setAttribute('data-animal', id); input.click(); }
function guardarFoto() { var input = document.getElementById('fotoInput'); var id = parseInt(input.getAttribute('data-animal')); var file = input.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(e) { var a = DB.animales.find(function(x) { return x.id === id; }); if (!a) return; a.foto = e.target.result; fotosDB[id] = e.target.result; save(); showProfile(id); showToast('📸 Foto guardada'); }; reader.readAsDataURL(file); }
function cambiarLote(id) { /* ... (sin cambios) ... */ }
function confirmarCambioLote(id, loteId) { /* ... (sin cambios) ... */ }
function registrarLeche(id) { /* ... (sin cambios) ... */ }
function guardarLeche(id) { /* ... (sin cambios) ... */ }
function quedoPrenada(id) { /* ... (sin cambios) ... */ }
function yaPario(id) { /* ... (sin cambios) ... */ }
function cambiarAEngorde(id) { /* ... (sin cambios) ... */ }

// ==================== SANIDAD / INSUMOS / AJUSTES (sin cambios mayores) ====================
// ... (mantener funciones existentes) ...
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

    // ============ 🧠 NUEVO: IA AVANZADA ============
    // Datos del lote para comparativas
    var animalesLote = DB.animales.filter(function(x) { return x.lote === a.lote && x.id !== a.id; });
    var gmdPromLote = 0, mejorGMDLote = 0, mejorNombreLote = '', countLote = 0;
    for (var i = 0; i < animalesLote.length; i++) {
        var gmdL = getGMD(animalesLote[i].historial);
        if (animalesLote[i].historial.length >= 2) {
            gmdPromLote += gmdL;
            countLote++;
            if (gmdL > mejorGMDLote) { mejorGMDLote = gmdL; mejorNombreLote = animalesLote[i].nombre; }
        }
    }
    gmdPromLote = countLote > 0 ? gmdPromLote / countLote : gmd;
    
    // Datos globales para ranking
    var todos = DB.animales.filter(function(x) { return x.id !== a.id && x.historial.length >= 2; });
    var mejorGlobal = null, peorGlobal = null;
    for (var i = 0; i < todos.length; i++) {
        var gmdG = getGMD(todos[i].historial);
        if (!mejorGlobal || gmdG > mejorGlobal.gmd) mejorGlobal = { nombre: todos[i].nombre, gmd: gmdG };
        if (!peorGlobal || gmdG < peorGlobal.gmd) peorGlobal = { nombre: todos[i].nombre, gmd: gmdG };
    }
    
    // Comparativas
    var vsPromLote = gmdPromLote > 0 ? ((gmd - gmdPromLote) / gmdPromLote * 100) : 0;
    var vsMejorLote = mejorGMDLote > 0 ? ((gmd - mejorGMDLote) / mejorGMDLote * 100) : 0;
    var vsMejorGlobal = mejorGlobal ? ((gmd - mejorGlobal.gmd) / mejorGlobal.gmd * 100) : 0;
    
    // Tendencia histórica
    var tendenciaHistorica = getTendenciaHistorica(a.historial);
    var emojiTendencia = tendenciaHistorica === 'acelerando' ? '🚀' : tendenciaHistorica === 'cayendo' ? '📉' : '📊';
    var colorTendencia = tendenciaHistorica === 'acelerando' ? '#22c55e' : tendenciaHistorica === 'cayendo' ? '#ef4444' : '#fbbf24';
    
    // Eficiencia
    var eficiencia = r.pct || Math.round(50 + r.cm * 10);
    var nivelEficiencia = getEficiencia(eficiencia);
    
    // Detectar anomalías
    var anomalias = detectarAnomalias(a);
    
    // Generar alertas IA personalizadas
    var alertasIA = [];
    if (gmd < 0.2 && a.historial.length >= 2) alertasIA.push({ icon: '🔴', texto: 'GMD crítica. Considere venta urgente.', color: '#ef4444', accion: 'vender' });
    if (anomalias.length > 0) alertasIA.push({ icon: '⚠️', texto: 'Posible anomalía en último pesaje. Verificar báscula.', color: '#f59e0b', accion: 'revisar' });
    if (tendenciaHistorica === 'cayendo') alertasIA.push({ icon: '📉', texto: 'GMD en descenso hace 2 meses. Revisar dieta y sanidad.', color: '#f59e0b', accion: 'revisarDieta' });
    if (p >= 500 && a.tipo === 'engorde') alertasIA.push({ icon: '🎯', texto: 'Peso de venta alcanzado. Vender pronto para máx. ganancia.', color: '#22c55e', accion: 'vender' });
    if (diasUltimo > 30) alertasIA.push({ icon: '📅', texto: 'Pesaje vencido hace ' + diasUltimo + ' días. Actualice para mejores predicciones.', color: '#f59e0b', accion: 'pesar' });
    
    // Generar sugerencias IA
    var sugerencias = [];
    if (p >= 130 && p < 350 && gmd > 0) sugerencias.push({ icon: '💡', texto: 'Preparar cambio a dieta Ceba en ~' + getDiasParaMeta(p, 350, gmd) + ' días.', impacto: '+0.08 kg/d', accion: 'planificar' });
    if (gmd > 0 && gmd < 0.35 && p > 150) sugerencias.push({ icon: '🧪', texto: 'Aplicar Modificador Orgánico (impacto est: +0.05 kg/d, ~$12.000/dosis).', impacto: '+0.05 kg/d', accion: 'aplicarModificador' });
    if (p >= 350 && p < 500) sugerencias.push({ icon: '📈', texto: 'Aumentar melaza al 5% en Ceba (impacto: +0.08 kg/d).', impacto: '+0.08 kg/d', accion: 'aumentarMelaza' });
    if (gmd < 0.3) sugerencias.push({ icon: '💊', texto: 'Aplicar Complejo B + Desparasitante para reactivar GMD.', impacto: '+0.04 kg/d', accion: 'desparasitar' });
    if (p >= 500) sugerencias.push({ icon: '💰', texto: 'Vender ahora: $' + fm(valorActual) + '. Continuar cuesta $' + fm(cd*30) + '/mes.', impacto: 'análisis', accion: 'vender' });
    
    // Simulador de escenarios
    var simulacion = simularCambio(id, 'ambos');
    
    // Fecha óptima de venta
    var diasPara500 = getDiasParaMeta(p, 500, gmd);
    var fechaVentaOptima = new Date(Date.now() + diasPara500 * 86400000);
    var fechaVentaStr = diasPara500 < 9999 ? fechaVentaOptima.toLocaleDateString('es-CO', {day:'numeric', month:'short', year:'numeric'}) : 'N/A';

    // ============ 1. EDAD / ORIGEN (Tu versión base) ============
    var edadHTML = '';
    if (a.origen === 'nacimiento' && a.fechaNacimiento) { var diasEdad = getDiasDesde(a.fechaNacimiento); var meses = Math.floor(diasEdad / 30); edadHTML = '<div class="row"><span class="row-label">🎂 Edad</span><span class="row-val">' + meses + ' meses (' + diasEdad + ' días)</span></div>'; }
    if (a.origen === 'comprado' && a.fechaCompra) { var diasFinca = getDiasDesde(a.fechaCompra); edadHTML += '<div class="row"><span class="row-label">🚚 Días en finca</span><span class="row-val">' + diasFinca + ' días</span></div>'; if (a.precioCompra) { var roi = ((valorActual - a.precioCompra - cst) / a.precioCompra * 100).toFixed(1); edadHTML += '<div class="row"><span class="row-label">💰 Precio compra</span><span class="row-val">$ ' + fm(a.precioCompra) + '</span></div><div class="row"><span class="row-label">📈 ROI</span><span class="row-val" style="color:' + (roi >= 0 ? '#22c55e' : '#ef4444') + '">' + roi + '%</span></div>'; } }
    if (a.madre) { var madre = DB.animales.find(function(x) { return x.nombre === a.madre || x.id === a.madre; }); if (madre) edadHTML += '<div class="row"><span class="row-label">🐄 Madre</span><span class="row-val" style="cursor:pointer;color:var(--accent);" onclick="showProfile(' + madre.id + ')">' + madre.nombre + '</span></div>'; }

    // ============ 2. LOTE ACTUAL ============
    var loteHTML = '<div class="row"><span class="row-label">📊 Lote</span><span class="row-val">' + (loteActual ? escapeHTML(loteActual.nombre) : 'Sin lote') + ' <button class="btn btn-purple btn-sm" onclick="cambiarLote(' + id + ')" style="padding:2px 8px;font-size:.6rem;margin-left:4px;">✏️</button></span></div>';

    // ============ 3. CRÍAS ============
    var criasHTML = '';
    if (a.tipo === 'leche') { var crias = DB.animales.filter(function(x) { return x.madre === a.nombre || x.madre === a.id; }); if (crias.length > 0) { criasHTML = '<div class="section-title">👶 CRÍAS (' + crias.length + ')</div>'; for (var c = 0; c < crias.length; c++) criasHTML += '<div class="row" style="cursor:pointer;" onclick="showProfile(' + crias[c].id + ')"><span class="row-label"><div class="animal-avatar" style="width:24px;height:24px;font-size:.8rem;">' + getIconoAnimal(crias[c]) + '</div> ' + escapeHTML(crias[c].nombre) + '</span><span class="row-val">' + fm(crias[c].historial[crias[c].historial.length-1].peso) + ' kg</span></div>'; } }

    // ============ 4. PRODUCCIÓN LECHE ============
    var lecheHTML = '';
    if (a.tipo === 'leche' && a.estadoRepro === 'parida') { var litrosHoy = a.produccionLeche && a.produccionLeche.length > 0 ? a.produccionLeche[a.produccionLeche.length-1].litros : 0; var ingresoLeche = litrosHoy * (DB.litroLeche || 1500); lecheHTML = '<div class="card card-sm" style="background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.2);"><div style="font-weight:700;font-size:.65rem;color:var(--accent);">🥛 PRODUCCIÓN LECHE</div><div class="row"><span class="row-label">Litros hoy</span><span class="row-val">' + litrosHoy + ' L</span></div><div class="row"><span class="row-label">Ingreso diario</span><span class="row-val" style="color:var(--accent);">$ ' + fm(ingresoLeche) + '</span></div><button class="btn btn-green btn-sm mt8" onclick="registrarLeche(' + id + ')" style="width:100%;">➕ REGISTRAR LITROS</button></div>'; }

    // ============ 5. BOTONES DINÁMICOS ============
    var botonesHTML = '';
    if (a.tipo === 'leche' && a.estadoRepro === 'parida' && semaforo && semaforo.dias >= 60 && !a.fechaPrenez) { botonesHTML += '<button class="btn btn-purple btn-sm" onclick="quedoPrenada(' + id + ')" style="flex:1;">👶 Quedó Preñada</button>'; }
    if (a.tipo === 'leche' && a.fechaPrenez && a.fechaSecado) { var diasParaSecado = getDiasDesde(a.fechaSecado); if (diasParaSecado <= 7 && a.estadoRepro === 'parida') { botonesHTML += '<button class="btn btn-warning btn-sm" onclick="iniciarSecado(' + id + ')" style="flex:1;">⏸️ Iniciar Secado</button>'; } }
    if (a.tipo === 'leche' && a.estadoRepro === 'seca') { botonesHTML += '<button class="btn btn-green btn-sm" onclick="yaPario(' + id + ')" style="flex:1;">✅ Ya Parió</button>'; }
    if (a.tipo === 'leche' && (a.estadoRepro === 'seca' || a.estadoRepro === 'parida')) { botonesHTML += '<button class="btn btn-gray btn-sm" onclick="cambiarAEngorde(' + id + ')" style="flex:1;">🔄 Cambiar a Engorde</button>'; }

    // ============ 6. APLICACIONES ============
    var apps = DB.aplicaciones ? DB.aplicaciones.filter(function(app) { return app.animalId === id; }).slice(-5).reverse() : [];
    var appsHTML = '';
    if (apps.length > 0) { appsHTML = '<div class="section-title">💉 APLICACIONES</div>'; var cat = getCatalogoSanidadCompleto(); for (var ap = 0; ap < apps.length; ap++) { var p2 = cat.find(function(p3) { return p3.id === apps[ap].productoId; }); appsHTML += '<div class="aplicacion-item"><span>' + (p2 ? p2.icono : '💉') + ' ' + escapeHTML(apps[ap].producto) + '</span><span style="font-size:.63rem;">' + (apps[ap].cantidad || '') + ' ' + (apps[ap].unidad || 'ml') + ' · $' + fm(apps[ap].costo || 0) + ' · ' + apps[ap].fecha + '</span></div>'; } }

    // ============ 7. HISTORIAL ============
    var hist = '', rev = a.historial.slice().reverse();
    for (var i = 0; i < rev.length; i++) { var h = rev[i], ch = '', di = ''; if (i === 0) di = '<span style="font-size:.58rem;color:var(--muted);margin-left:4px;">hace ' + getDiasDesde(h.fecha) + ' d</span>'; if (i < a.historial.length-1) { var ant = a.historial[a.historial.length-2-i].peso, dif = h.peso - ant, cls = dif >= 0 ? 'badge-up' : 'badge-down', sig = dif >= 0 ? '+' : ''; ch = '<span class="badge ' + cls + '">' + sig + ((dif/ant)*100).toFixed(1) + '%</span>'; } hist += '<div class="hist-item"><span>📅 ' + h.fecha + di + '</span><div><span class="row-val">' + fm(h.peso) + ' kg</span>' + ch + '</div></div>'; }

    // ============ 8. DIETA ============
    var dietaHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;margin-bottom:6px;color:var(--accent);">🧪 DIETA DIARIA</div>';
    var items = [
        { icono:'🌱', nombre:'Pasto Picado', valor: (d.pasto||0).toFixed(1) + ' kg', costo: (d.pasto||0)*(DB.precios.pasto||0) },
        { icono:'🌾', nombre:'Salvado Trigo', valor: (d.salvado||0).toFixed(2) + ' kg', costo: (d.salvado||0)*(DB.precios.salvado||0) },
        { icono:'💧', nombre:'Melaza', valor: Math.round(d.melaza||0) + ' g', costo: ((d.melaza||0)/1000)*(DB.precios.melaza||0) },
        { icono:'⚗️', nombre:'UREA', valor: Math.round(d.urea||0) + ' g', costo: ((d.urea||0)/1000)*(DB.precios.urea||0) },
        { icono:'🧊', nombre:'Bicarbonato', valor: Math.round(d.bicarb||0) + ' g', costo: ((d.bicarb||0)/1000)*(DB.precios.bicarb||0) },
        { icono:'🧂', nombre:'Sal Mineral', valor: Math.round(d.sal||0) + ' g', costo: ((d.sal||0)/1000)*(DB.precios.sal||0) }
    ];
    for (var x = 0; x < items.length; x++) { var it = items[x]; var bloqueado = (it.nombre === 'UREA' && etapa.ureaBloqueada); dietaHTML += '<div class="row"><span class="row-label">' + it.icono + ' ' + it.nombre + '</span><span class="row-val" style="' + (bloqueado ? 'color:#6b7280;text-decoration:line-through' : '') + '">' + (bloqueado ? '0 g (🔒)' : it.valor + ' · $' + fm(it.costo)) + '</span></div>'; }
    dietaHTML += '</div>';

    // ============ 9. RENTABILIDAD ============
    var rentHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;margin-bottom:4px;color:var(--muted);">💰 RENTABILIDAD</div><div class="row"><span class="row-label">Costo alim./día</span><span class="row-val">$ ' + fm(cd) + '</span></div><div class="row"><span class="row-label">Costo/kg ganado</span><span class="row-val">$ ' + fm(ckp) + '</span></div><div class="row"><span class="row-label">Ganancia/mes</span><span class="row-val" style="color:' + (gan >= 0 ? '#22c55e' : '#ef4444') + '">$ ' + fm(gan) + '</span></div></div>';

    // ============ 🧠 10. NUEVO: IA PREDICCIÓN AVANZADA ============
    var iaHTML = '';
    if (hayIA) {
        var gan30 = (pred30 - p) * DB.precioKG, gan60 = (pred60 - p) * DB.precioKG, gan90 = (pred90 - p) * DB.precioKG, gan120 = (pred120 && pred120 > 0) ? (pred120 - p) * DB.precioKG : 0;
        iaHTML = '<div class="ia-card"><div class="ia-title">🧠 IA PREDICTIVA · Confianza: ' + confianza.nivel + ' (' + confianza.pct + '%)</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-bottom:8px;">' +
            '<div class="proyeccion-item"><div class="dias">30 DÍAS</div><div class="peso">' + fm(pred30) + ' kg</div><div class="ganancia" style="color:' + (gan30 >= 0 ? '#22c55e' : '#ef4444') + '">' + (gan30 >= 0 ? '+' : '') + '$ ' + fm(Math.abs(gan30)) + '</div></div>' +
            '<div class="proyeccion-item"><div class="dias">60 DÍAS</div><div class="peso">' + fm(pred60) + ' kg</div><div class="ganancia" style="color:' + (gan60 >= 0 ? '#22c55e' : '#ef4444') + '">' + (gan60 >= 0 ? '+' : '') + '$ ' + fm(Math.abs(gan60)) + '</div></div>' +
            '<div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(pred90) + ' kg</div><div class="ganancia" style="color:' + (gan90 >= 0 ? '#22c55e' : '#ef4444') + '">' + (gan90 >= 0 ? '+' : '') + '$ ' + fm(Math.abs(gan90)) + '</div></div>' +
            (pred120 > 0 ? '<div class="proyeccion-item"><div class="dias">120 DÍAS</div><div class="peso">' + fm(pred120) + ' kg</div><div class="ganancia" style="color:' + (gan120 >= 0 ? '#22c55e' : '#ef4444') + '">' + (gan120 >= 0 ? '+' : '') + '$ ' + fm(Math.abs(gan120)) + '</div></div>' : '<div class="proyeccion-item"><div class="dias">120 DÍAS</div><div class="peso">--</div></div>') +
            '</div>' +
            '<div style="font-size:.62rem;color:var(--muted);margin-bottom:4px;">🎯 VENTA ÓPTIMA (500kg): <b>' + fechaVentaStr + '</b> (' + diasPara500 + ' días) · Ganancia est: <b style="color:#22c55e">$' + fm((500-p)*DB.precioKG - cd*diasPara500) + '</b></div>' +
            '<div style="font-size:.62rem;color:var(--muted);">📈 Tendencia: <b style="color:' + colorTendencia + '">' + emojiTendencia + ' ' + tendTxt + '</b> · Basado en ' + a.historial.length + ' pesajes</div></div>';
    } else if (a.historial.length >= 1) {
        var p30s = p + (gmd * 30), p60s = p + (gmd * 60), p90s = p + (gmd * 90);
        iaHTML = '<div class="card card-sm"><div style="font-weight:700;font-size:.65rem;margin-bottom:4px;color:var(--muted);">📈 PROYECCIÓN SIMPLE</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;"><div class="proyeccion-item"><div class="dias">30 DÍAS</div><div class="peso">' + fm(p30s) + ' kg</div></div><div class="proyeccion-item"><div class="dias">60 DÍAS</div><div class="peso">' + fm(p60s) + ' kg</div></div><div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(p90s) + ' kg</div></div></div><div style="font-size:.55rem;color:var(--muted);margin-top:4px;">⚠️ 3+ pesajes para activar IA predictiva</div></div>';
    }

    // ============ 🧠 11. NUEVO: COMPARATIVA INTELIGENTE ============
    var compHTML = '<div class="ia-card"><div class="ia-title">📊 COMPARATIVA INTELIGENTE</div>' +
        '<div style="font-size:.62rem;display:flex;flex-direction:column;gap:4px;">' +
        '<div class="row"><span class="row-label">vs Promedio del lote</span><span class="row-val" style="color:' + (vsPromLote >= 0 ? '#22c55e' : '#ef4444') + '">' + (vsPromLote >= 0 ? '📈 +' : '📉 ') + Math.abs(vsPromLote).toFixed(1) + '%</span></div>' +
        (mejorNombreLote ? '<div class="row"><span class="row-label">vs Mejor del lote (' + escapeHTML(mejorNombreLote) + ')</span><span class="row-val" style="color:' + (vsMejorLote >= 0 ? '#22c55e' : '#f59e0b') + '">' + (vsMejorLote >= 0 ? '📈 +' : '📉 ') + Math.abs(vsMejorLote).toFixed(1) + '%</span></div>' : '') +
        (mejorGlobal ? '<div class="row"><span class="row-label">vs Mejor del sistema (' + escapeHTML(mejorGlobal.nombre) + ')</span><span class="row-val" style="color:' + (vsMejorGlobal >= 0 ? '#22c55e' : '#f59e0b') + '">' + (vsMejorGlobal >= 0 ? '📈 +' : '📉 ') + Math.abs(vsMejorGlobal).toFixed(1) + '%</span></div>' : '') +
        '<div class="row"><span class="row-label">Eficiencia</span><span class="row-val" style="color:' + nivelEficiencia.color + '">' + nivelEficiencia.icono + ' ' + eficiencia + '% (' + nivelEficiencia.nivel + ')</span></div>' +
        '</div></div>';

    // ============ 🧠 12. NUEVO: ALERTAS IA ============
    var alertasIAHTML = '';
    if (alertasIA.length > 0) {
        alertasIAHTML = '<div class="card card-sm" style="background:rgba(239,68,68,.03);border:1px solid rgba(239,68,68,.15);"><div style="font-weight:700;font-size:.65rem;color:#ef4444;margin-bottom:6px;">⚠️ ALERTAS IA (' + alertasIA.length + ')</div>';
        for (var al = 0; al < alertasIA.length; al++) {
            alertasIAHTML += '<div class="ia-sugerencia" style="border-left:3px solid ' + alertasIA[al].color + ';padding-left:6px;"><span class="ia-icon">' + alertasIA[al].icon + '</span>' + alertasIA[al].texto + '</div>';
        }
        alertasIAHTML += '</div>';
    }

    // ============ 🧠 13. NUEVO: SUGERENCIAS IA ============
    var sugerenciasHTML = '';
    if (sugerencias.length > 0) {
        sugerenciasHTML = '<div class="card card-sm" style="background:rgba(167,139,250,.03);border:1px solid rgba(167,139,250,.15);"><div style="font-weight:700;font-size:.65rem;color:var(--purple);margin-bottom:6px;">💡 SUGERENCIAS IA</div>';
        for (var su = 0; su < sugerencias.length; su++) {
            sugerenciasHTML += '<div class="ia-sugerencia"><span class="ia-icon">' + sugerencias[su].icon + '</span>' + sugerencias[su].texto + ' <span style="color:#22c55e;font-size:.6rem;font-weight:600;">' + (sugerencias[su].impacto || '') + '</span></div>';
        }
        sugerenciasHTML += '</div>';
    }

    // ============ 🧠 14. NUEVO: SIMULADOR IA ============
    var simHTML = '';
    if (simulacion && gmd > 0) {
        simHTML = '<div class="ia-card" style="margin-top:8px;background:rgba(34,197,94,.03);border:1px solid rgba(34,197,94,.2);"><div class="ia-title">🔮 SIMULADOR IA</div>' +
            '<div style="font-size:.6rem;color:var(--muted);margin-bottom:4px;">¿Qué pasa si aplicas Melaza 5% + Modificador?</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.62rem;">' +
            '<div>GMD actual: <b>' + gmd.toFixed(2) + ' kg/d</b></div>' +
            '<div>GMD simulado: <b style="color:#22c55e">' + simulacion.gmdSimulado.toFixed(2) + ' kg/d</b></div>' +
            '<div>Venta actual: <b>' + fechaVentaStr + '</b></div>' +
            '<div>Venta simulada: <b style="color:#fbbf24">' + simulacion.fechaVentaSim + '</b></div>' +
            '<div>Adelanto: <b style="color:#22c55e">' + simulacion.diasAdelanto + ' días</b></div>' +
            '<div>Ganancia extra: <b style="color:#22c55e">+$' + fm(simulacion.impactoGanancia) + '</b></div>' +
            '<div>ROI de la acción: <b style="color:#22c55e">' + simulacion.roi + '%</b></div>' +
            '</div>' +
            '<div style="font-size:.55rem;color:#22c55e;margin-top:4px;">🟢 RECOMENDADO: El ROI es muy positivo</div></div>';
    }

    // ============ ALERTA RENDIMIENTO (Tu versión base) ============
    var alertaHTML = '<div class="alerta-card ' + r.color + '" style="margin-bottom:10px;"><div class="alerta-led ' + r.color + '">' + r.icono + '</div><div><div class="alerta-titulo">' + r.texto + '</div><div class="alerta-met">' + (r.cm >= 0 ? '+' : '') + r.cm.toFixed(1) + '% · $' + fm(ckp) + '/kg ganado</div></div></div>';

    // ============ SEMÁFORO ============
    var semaforoHTML = semaforo ? ' · <span class="semaforo semaforo-' + semaforo.color + '"></span> ' + semaforo.texto + ' (' + semaforo.dias + 'd)' : '';

    // ============ 🏗️ CONSTRUIR HTML COMPLETO ============
    document.getElementById('v-lotes').classList.add('hidden');
    document.getElementById('v-animales').classList.add('hidden');
    document.getElementById('v-insumos').classList.add('hidden');
    document.getElementById('v-ajustes').classList.add('hidden');
    document.getElementById('v-perfil').classList.remove('hidden');

    var html = 
        // Tarjeta principal con avatar
        '<div class="card"><div class="profile-cover"><div class="profile-avatar" onclick="abrirFoto(' + id + ')">' + getIconoAnimal(a) + '<div class="foto-overlay">📸</div></div><div class="profile-name">' + escapeHTML(a.nombre) + '</div><div class="profile-sub">' + etapa.rango + ' · ' + (a.tipo === 'engorde' ? '🥩 Engorde' : '🥛 Leche') + semaforoHTML + '</div><div class="profile-stats"><div class="profile-stat"><div class="val">' + fm(p) + ' kg</div><div class="lbl">Peso</div></div><div class="profile-stat"><div class="val">' + gmd.toFixed(2) + '</div><div class="lbl">GMD</div></div><div class="profile-stat"><div class="val">$ ' + fm(valorActual) + '</div><div class="lbl">Valor</div></div></div>' + 
        (etapa.min !== undefined ? '<div class="progress"><div class="progress-fill" style="width:' + getProgresoEtapa(p, etapa) + '%;background:' + etapa.color + ';"></div></div><div style="font-size:.6rem;color:var(--muted);text-align:center;margin-top:4px;">Faltan ' + fm((etapa.max||9999) - p) + ' kg para ' + etapa.siguienteEtapa + '</div>' : '') + '</div>' +
        
        // Información básica
        edadHTML + loteHTML + lecheHTML + criasHTML + 
        
        // Alerta de rendimiento
        alertaHTML + 
        
        // 🧠 IA Predictiva
        iaHTML + 
        
        // 🧠 Comparativa Inteligente
        compHTML + 
        
        // 🧠 Alertas IA
        alertasIAHTML + 
        
        // 🧠 Sugerencias IA
        sugerenciasHTML + 
        
        // 🧠 Simulador IA
        simHTML + 
        
        // Rentabilidad
        rentHTML + 
        
        // Aplicaciones
        appsHTML + 
        
        // Historial
        '<div class="section-title">🕐 HISTORIAL (' + a.historial.length + ')</div>' + hist + 
        
        // Dieta
        dietaHTML + 
        
        // Botones de acción
        '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">' + botonesHTML + '<button class="btn btn-purple btn-sm" onclick="openAplicarSanidad(' + id + ')" style="flex:1;">💉 Sanidad</button><button class="btn btn-gold btn-sm" onclick="updateWeight(' + id + ')" style="flex:2;">⚖️ PESAJE</button></div>';

    document.getElementById('v-perfil').innerHTML = html;
    window.scrollTo(0, 0);
    save();
}

// ==================== INIT ====================
cargarDatos();
renderLotes();
window.addEventListener('beforeunload', function() { save(); });
document.addEventListener('visibilitychange', function() { if (document.hidden) save(); });
setInterval(function() { save(); }, 30000);
console.log('✅ GANADERO ÉLITE v4.0.0 - IA TOTAL ACTIVADA');
