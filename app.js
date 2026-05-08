// ==================== VARIABLES GLOBALES ====================
var currentPage = 'lote';
var DB_CACHE = { animales: [], aplicaciones: [], precios: {}, stock: {}, preciosSanidad: {}, stockSanidad: {}, precioKG: 9800, suplementos: [], stockSuplementos: [] };

// ==================== INICIALIZACIÓN ====================
window.addEventListener('load', function() {
    setTimeout(function() {
        var splash = document.getElementById('splash');
        if (splash) splash.classList.add('hide');
    }, 800);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js', {scope: './'}).then(function(reg) {
            console.log('SW OK');
        }).catch(function(err) {
            console.log('SW Error:', err);
        });
    });
}

// ==================== TOAST Y MODAL ====================
function showToast(m, d) { d = d || 3000; var t = document.createElement('div'); t.className = 'toast'; t.innerHTML = m; document.getElementById('toastContainer').appendChild(t); setTimeout(function() { t.remove(); }, d); }
function showModal(h) { var o = document.createElement('div'); o.className = 'modal-overlay'; o.innerHTML = '<div class="modal">' + h + '</div>'; o.onclick = function(e) { if (e.target === o) o.remove(); }; document.getElementById('modalContainer').appendChild(o); }

// ==================== NAVEGACIÓN ====================
document.getElementById('nav').addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (btn) goPage(btn.getAttribute('data-p'));
});

function goPage(p) {
    ['v-lote','v-precios','v-stock','v-sanidad','v-config','v-perfil'].forEach(function(id) { document.getElementById(id).classList.add('hidden'); });
    document.getElementById('v-' + p).classList.remove('hidden');
    var btns = document.querySelectorAll('#nav .nav-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    var ab = document.querySelector('#nav button[data-p="' + p + '"]');
    if (ab) ab.classList.add('active');
    currentPage = p;
    if (p === 'lote') cargarYRenderLote();
    if (p === 'precios') renderPrecios();
    if (p === 'stock') renderStock();
    if (p === 'sanidad') renderSanidad();
    if (p === 'config') renderConfig();
    window.scrollTo(0, 0);
}

// ==================== CARGA DE DATOS ====================
function cargarDatos(callback) {
    getAnimales(function(animales) {
        DB_CACHE.animales = animales || [];
        getAplicaciones(function(aplicaciones) {
            DB_CACHE.aplicaciones = aplicaciones || [];
            getConfig('precioKG', function(v) { DB_CACHE.precioKG = v || 9800;
                getConfig('precios', function(v) { DB_CACHE.precios = v || {};
                    getConfig('stock', function(v) { DB_CACHE.stock = v || {};
                        getConfig('preciosSanidad', function(v) { DB_CACHE.preciosSanidad = v || {};
                            getConfig('stockSanidad', function(v) { DB_CACHE.stockSanidad = v || {};
                                getSuplementos(function(s) { DB_CACHE.suplementos = s || [];
                                    getStockSuplementos(function(ss) { DB_CACHE.stockSuplementos = ss || [];
                                        if (callback) callback();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function cargarYRenderLote() { cargarDatos(function() { renderLote(); }); }

// ==================== RENDER LOTE ====================
function renderLote() {
    var price = DB_CACHE.precioKG;
    var totalKg = 0, mez = { pasto: 0, salvado: 0, sal: 0, melaza: 0, urea: 0, levadura: 0, bicarb: 0 };
    var costoTotal = 0, est = { verde: 0, azul: 0, naranja: 0, rojo: 0, gris: 0 };
    var etapas = { Iniciación: 0, Desarrollo: 0, Ceba: 0, Madurez: 0 };
    var alertas = [], cards = '', csTotal = 0;
    var catalogo = CATALOGO_SANIDAD.concat(DB_CACHE.suplementos);

    for (var i = 0; i < DB_CACHE.animales.length; i++) {
        csTotal += getCostoSanidadDiario(DB_CACHE.animales[i].id, DB_CACHE.aplicaciones, catalogo);
    }

    for (var i = 0; i < DB_CACHE.animales.length; i++) {
        var a = DB_CACHE.animales[i];
        var cp = a.historial[a.historial.length - 1].peso;
        totalKg += cp;
        var d = getDiet(cp);
        for (var k in mez) mez[k] += d[k];
        costoTotal += getCostoDiario(cp, DB_CACHE.precios);
        var r = getRendimiento(a.historial);
        est[r.nivel] = (est[r.nivel] || 0) + 1;
        var etapa = getEtapa(cp);
        etapas[etapa.nombre] = (etapas[etapa.nombre] || 0) + 1;
        var lm = { verde: 'ml-g', azul: 'ml-b', naranja: 'ml-o', rojo: 'ml-r', gris: 'ml-x' };
        var sg = r.cm >= 0 ? '+' : '';
        var ret = false;
        for (var j = DB_CACHE.aplicaciones.length - 1; j >= 0; j--) {
            if (DB_CACHE.aplicaciones[j].animalId === a.id) {
                var pr = catalogo.find(function(p) { return p.id === DB_CACHE.aplicaciones[j].productoId; });
                if (pr && pr.retiro > 0 && getDiasDesde(DB_CACHE.aplicaciones[j].fecha) < pr.retiro) { ret = true; break; }
            }
        }
        cards += '<div class="animal-card" onclick="showProfile(' + a.id + ')"><div class="mini-led ' + lm[r.nivel] + '"></div>' +
            (etapa.ureaBloqueada ? '<div class="lock-icon"><i class="fa-solid fa-lock"></i></div>' : '') +
            '<span style="font-size:1.5rem;">' + etapa.icono + '</span><div class="name">' + a.nombre + '</div>' +
            '<span class="etapa-tag ' + etapa.clase + '">' + etapa.rango + '</span><div class="weight">' + fm(cp) + ' kg</div>' +
            (ret ? '<div class="retiro-badge">🚫 EN VEDA</div>' : '') +
            '<div class="cm" style="color:' + (r.cm >= 0 ? '#22c55e' : '#ef4444') + '">' + sg + r.cm.toFixed(1) + '%</div></div>';
    }

    var ta = DB_CACHE.animales.length, prom = ta > 0 ? totalKg / ta : 0;
    var gmdL = ta > 0 ? DB_CACHE.animales.reduce(function(s, a) { return s + getGMD(a.historial); }, 0) / ta : 0;
    var ingM = gmdL * 30 * price * ta, cosM = costoTotal * 30, gan = ingM - cosM - (csTotal / 12);
    var pctB = ta > 0 ? ((est.verde + est.azul) / ta) * 100 : 0;

    var mezHTML = '';
    for (var z = 0; z < ALIMENTOS.length; z++) {
        mezHTML += '<div class="row"><span class="row-label"><i class="fa-solid ' + IC_ALIMENTOS[ALIMENTOS[z]] + '"></i> ' + NM_ALIMENTOS[ALIMENTOS[z]] + '</span><span class="row-val">' +
            (ALIMENTOS[z] === 'pasto' || ALIMENTOS[z] === 'salvado' ? mez[ALIMENTOS[z]].toFixed(1) + ' kg' : Math.round(mez[ALIMENTOS[z]]) + ' g') + '</span></div>';
    }

    var html = '<div class="card"><div class="row-label mb6" style="font-weight:600;"><i class="fa-solid fa-coins"></i> PRECIO KG EN PIE</div>' +
        '<div style="display:flex;align-items:center;gap:6px;"><span style="font-size:1.1rem;font-weight:800;color:var(--accent);">$</span>' +
        '<input id="inpPKG" type="number" value="' + price + '" style="font-size:1.1rem;font-weight:700;text-align:center;">' +
        '<span style="font-size:.7rem;color:var(--muted);">COP</span></div>' +
        '<button class="btn btn-green mt12" onclick="savePKG()"><i class="fa-solid fa-check"></i> ACTUALIZAR</button></div>' +
        '<button class="btn btn-gold" onclick="toggleAdd()"><i id="addIco" class="fa-solid fa-plus-circle"></i> NUEVO REGISTRO</button>' +
        '<div id="addF" class="card hidden"><div class="flex-col gap10">' +
        '<input id="newN" type="text" placeholder="Nombre del Animal"><input id="newW" type="number" placeholder="Peso Inicial (kg)" min="20" max="2000">' +
        '<button class="btn btn-gold" onclick="addAnimal()"><i class="fa-solid fa-check-circle"></i> GUARDAR</button></div></div>' +
        '<div class="card"><div class="row-label mb6" style="font-weight:600;"><i class="fa-solid fa-chart-pie"></i> CAPITAL</div>' +
        '<div class="capital-value">$ ' + fm(totalKg * price) + '</div><div class="stats-grid">' +
        '<div class="stat-item"><div class="row-label"><i class="fa-solid fa-users"></i> Cabezas</div><div class="row-val">' + ta + '</div></div>' +
        '<div class="stat-item"><div class="row-label"><i class="fa-solid fa-weight-scale"></i> Peso Total</div><div class="row-val">' + fm(totalKg) + ' kg</div></div>' +
        '<div class="stat-item"><div class="row-label"><i class="fa-solid fa-calculator"></i> Promedio</div><div class="row-val">' + fm(prom) + ' kg</div></div>' +
        '<div class="stat-item"><div class="row-label"><i class="fa-solid fa-layer-group"></i> Etapas</div><div class="row-val" style="font-size:.7rem;">🐮' + etapas.Iniciación + ' 🐂' + etapas.Desarrollo + ' 🐃' + etapas.Ceba + ' 🦬' + etapas.Madurez + '</div></div></div></div>' +
        '<div class="card"><div style="font-weight:700;font-size:.7rem;margin-bottom:10px;color:var(--muted);"><i class="fa-solid fa-chart-simple"></i> ESTADO</div>' +
        '<div class="estado-simple"><div class="estado-pildora e"><div class="num">' + est.verde + '</div><div class="lbl">Excelente</div></div>' +
        '<div class="estado-pildora b"><div class="num">' + est.azul + '</div><div class="lbl">Bueno</div></div>' +
        '<div class="estado-pildora r"><div class="num">' + est.naranja + '</div><div class="lbl">Regular</div></div>' +
        '<div class="estado-pildora m"><div class="num">' + est.rojo + '</div><div class="lbl">Bajo</div></div></div>' +
        '<div class="progress"><div class="progress-fill" style="width:' + pctB + '%;background:var(--info);"></div></div></div>' +
        '<div class="card"><div style="font-weight:700;font-size:.7rem;margin-bottom:10px;color:var(--muted);"><i class="fa-solid fa-coins"></i> FINANZAS</div>' +
        '<div class="row"><span class="row-label"><i class="fa-solid fa-receipt"></i> Alimentación/día</span><span class="row-val">$ ' + fm(costoTotal) + '</span></div>' +
        '<div class="row"><span class="row-label"><i class="fa-solid fa-syringe"></i> Sanidad total</span><span class="row-val">$ ' + fm(csTotal) + '</span></div>' +
        '<div class="row"><span class="row-label"><i class="fa-solid fa-chart-line"></i> Ganancia neta/mes</span><span class="row-val" style="color:' + (gan >= 0 ? '#22c55e' : '#ef4444') + '">$ ' + fm(gan) + '</span></div></div>' +
        '<div class="card"><div style="font-weight:700;font-size:.7rem;margin-bottom:10px;color:var(--accent);"><i class="fa-solid fa-blender"></i> CONSUMO DIARIO</div>' + mezHTML + '</div>' +
        '<div class="section-title"><i class="fa-solid fa-layer-group"></i> INVENTARIO</div><div class="grid">' + cards + '</div>';
    document.getElementById('v-lote').innerHTML = html;
}

function savePKG() { var el = document.getElementById('inpPKG'); if (el) { DB_CACHE.precioKG = parseFloat(el.value) || 0; setConfig('precioKG', DB_CACHE.precioKG); renderLote(); showToast('✅ Precio actualizado'); } }
function toggleAdd() { var f = document.getElementById('addF'), i = document.getElementById('addIco'); f.classList.toggle('hidden'); i.className = f.classList.contains('hidden') ? 'fa-solid fa-plus-circle' : 'fa-solid fa-xmark-circle'; }

function addAnimal() {
    var n = document.getElementById('newN').value.trim(), p = parseFloat(document.getElementById('newW').value);
    if (!n || n.length < 2) { alert('⚠️ Ingrese un nombre válido'); return; }
    if (isNaN(p) || p < 20 || p > 2000) { alert('⚠️ Peso entre 20 y 2.000 kg'); return; }
    var id = Date.now();
    guardarAnimal({ id: id, nombre: n, historial: [{ fecha: new Date().toLocaleDateString(), peso: p }] }, function() {
        cargarYRenderLote();
        showToast('✅ ' + n + ' registrado');
    });
    document.getElementById('newN').value = ''; document.getElementById('newW').value = '';
    toggleAdd();
}

// ==================== PERFIL ====================
function showProfile(id) {
    cargarDatos(function() {
        var a = DB_CACHE.animales.find(function(x) { return x.id === id; });
        if (!a) return;
        var catalogo = CATALOGO_SANIDAD.concat(DB_CACHE.suplementos);
        var p = a.historial[a.historial.length - 1].peso;
        var etapa = getEtapa(p), d = getDiet(p), r = getRendimiento(a.historial), gmd = getGMD(a.historial);
        var cd = getCostoDiario(p, DB_CACHE.precios);
        var csd = getCostoSanidadDiario(id, DB_CACHE.aplicaciones, catalogo);
        var cst = 0;
        for (var i = 0; i < DB_CACHE.aplicaciones.length; i++) { if (DB_CACHE.aplicaciones[i].animalId === id) cst += (DB_CACHE.aplicaciones[i].costo || 0); }
        var ckp = getCkp(id, a.historial, DB_CACHE.precios, DB_CACHE.aplicaciones, catalogo, DB_CACHE.precioKG);
        var ingM = gmd * 30 * DB_CACHE.precioKG, gan = ingM - (cd * 30) - (cst / 12);
        var diasUltimo = getDiasDesde(a.historial[a.historial.length - 1].fecha);
        var proy30 = p + (gmd * 30), proy60 = p + (gmd * 60), proy90 = p + (gmd * 90), valorActual = p * DB_CACHE.precioKG;

        var apps = DB_CACHE.aplicaciones.filter(function(app) { return app.animalId === id; }).slice(-5).reverse();
        var appsHTML = '';
        if (apps.length > 0) {
            appsHTML = '<div class="section-title"><i class="fa-solid fa-syringe"></i> APLICACIONES</div>';
            for (var ap = 0; ap < apps.length; ap++) {
                var prod = catalogo.find(function(p2) { return p2.id === apps[ap].productoId; });
                appsHTML += '<div class="aplicacion-item"><span><i class="fa-solid ' + (prod ? prod.icono : 'fa-circle') + '" style="color:' + (prod ? prod.color : '#fff') + ';"></i> ' + apps[ap].producto + '</span><span style="font-size:.65rem;">' + apps[ap].ml + ' ml · $' + fm(apps[ap].costo || 0) + ' · ' + apps[ap].fecha + '</span></div>';
            }
        }

        var hist = '', rev = a.historial.slice().reverse();
        for (var i = 0; i < rev.length; i++) {
            var h = rev[i], ch = '', diasInfo = '';
            if (i === 0) diasInfo = '<span style="font-size:.6rem;color:var(--muted);margin-left:4px;">hace ' + getDiasDesde(h.fecha) + ' d</span>';
            if (i < a.historial.length - 1) {
                var ant = a.historial[a.historial.length - 2 - i].peso, dif = h.peso - ant;
                var cls = dif >= 0 ? 'badge-up' : 'badge-down', sig = dif >= 0 ? '+' : '';
                ch = '<span class="badge ' + cls + '">' + sig + ((dif / ant) * 100).toFixed(1) + '%</span>';
            }
            hist += '<div class="hist-item"><span><i class="fa-regular fa-calendar"></i> ' + h.fecha + diasInfo + '</span><div><span class="row-val">' + fm(h.peso) + ' kg</span>' + ch + '</div></div>';
        }

        var dietaHTML = '';
        for (var x = 0; x < ALIMENTOS.length; x++) {
            var bl = (ALIMENTOS[x] === 'urea' || ALIMENTOS[x] === 'melaza') && etapa.ureaBloqueada;
            dietaHTML += '<div class="row"><span class="row-label"><i class="fa-solid ' + IC_ALIMENTOS[ALIMENTOS[x]] + '"></i> ' + NM_ALIMENTOS[ALIMENTOS[x]] + '</span><span class="row-val" style="' + (bl ? 'color:#6b7280;text-decoration:line-through' : '') + '">' + (bl ? '0 g (🔒)' : (ALIMENTOS[x] === 'pasto' || ALIMENTOS[x] === 'salvado' ? d[ALIMENTOS[x]].toFixed(1) + ' kg' : Math.round(d[ALIMENTOS[x]]) + ' g')) + '</span></div>';
        }

        document.getElementById('v-lote').classList.add('hidden');
        document.getElementById('v-precios').classList.add('hidden');
        document.getElementById('v-stock').classList.add('hidden');
        document.getElementById('v-sanidad').classList.add('hidden');
        document.getElementById('v-config').classList.add('hidden');
        document.getElementById('v-perfil').classList.remove('hidden');
        document.getElementById('nav').style.display = 'none';

        var html = '<div class="card"><div class="profile-header"><div><div class="profile-name">' + a.nombre + ' ' + etapa.icono + '</div><div class="profile-sub">' + etapa.rango + ' · ' + etapa.nombre + '</div></div>' +
            '<div style="display:flex;gap:6px;"><button class="btn btn-purple btn-sm" onclick="openAplicarProducto(' + id + ')"><i class="fa-solid fa-syringe"></i></button>' +
            '<button class="btn btn-gray btn-sm" onclick="deleteAnimal(' + id + ')" style="background:rgba(255,0,0,.06);color:#ef4444;"><i class="fa-solid fa-trash-can"></i></button></div></div>' +
            '<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--muted);margin-bottom:4px;"><span>Progreso</span><span>Faltan ' + fm(etapa.max - p) + ' kg para ' + etapa.siguienteEtapa + '</span></div>' +
            '<div class="progress"><div class="progress-fill" style="width:' + getProgresoEtapa(p, etapa) + '%;background:' + etapa.color + ';"></div></div></div>' +
            '<div class="alerta-card ' + r.color + '"><div class="alerta-led ' + r.color + '"><i class="fa-solid ' + r.icono + '"></i></div><div><div class="alerta-titulo">' + r.texto + '</div>' +
            '<div class="alerta-met">Ganancia diaria: ' + gmd.toFixed(2) + ' kg/d | Crecimiento: ' + (r.cm >= 0 ? '+' : '') + r.cm.toFixed(1) + '% | Costo/kg: $' + fm(ckp) + '</div></div></div>' +
            '<div class="mb14"><div class="row"><span class="row-label"><i class="fa-solid fa-weight-scale"></i> Peso</span><span class="row-val">' + fm(p) + ' kg</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-sack-dollar"></i> Valor</span><span class="row-val" style="color:var(--accent);">$ ' + fm(valorActual) + '</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-calendar-check"></i> Último pesaje</span><span class="row-val">' + a.historial[a.historial.length - 1].fecha + ' (' + diasUltimo + ' d)</span></div></div>' +
            '<div class="card" style="background:rgba(255,255,255,.02);margin-bottom:14px;"><div style="font-weight:700;font-size:.7rem;margin-bottom:10px;color:var(--muted);"><i class="fa-solid fa-chart-line"></i> PROYECCIÓN</div><div class="proyeccion-grid">' +
            '<div class="proyeccion-item"><div class="dias">30 DÍAS</div><div class="peso">' + fm(proy30) + ' kg</div><div class="ganancia" style="color:' + ((proy30 * DB_CACHE.precioKG - valorActual) >= 0 ? '#22c55e' : '#ef4444') + '">' + ((proy30 * DB_CACHE.precioKG - valorActual) >= 0 ? '+' : '') + '$ ' + fm(Math.abs(proy30 * DB_CACHE.precioKG - valorActual)) + '</div></div>' +
            '<div class="proyeccion-item"><div class="dias">60 DÍAS</div><div class="peso">' + fm(proy60) + ' kg</div><div class="ganancia" style="color:' + ((proy60 * DB_CACHE.precioKG - valorActual) >= 0 ? '#22c55e' : '#ef4444') + '">' + ((proy60 * DB_CACHE.precioKG - valorActual) >= 0 ? '+' : '') + '$ ' + fm(Math.abs(proy60 * DB_CACHE.precioKG - valorActual)) + '</div></div>' +
            '<div class="proyeccion-item"><div class="dias">90 DÍAS</div><div class="peso">' + fm(proy90) + ' kg</div><div class="ganancia" style="color:' + ((proy90 * DB_CACHE.precioKG - valorActual) >= 0 ? '#22c55e' : '#ef4444') + '">' + ((proy90 * DB_CACHE.precioKG - valorActual) >= 0 ? '+' : '') + '$ ' + fm(Math.abs(proy90 * DB_CACHE.precioKG - valorActual)) + '</div></div></div></div>' +
            '<div class="card" style="background:rgba(255,255,255,.02);margin-bottom:14px;"><div style="font-weight:700;font-size:.7rem;margin-bottom:8px;color:var(--muted);">RENTABILIDAD</div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-receipt"></i> Costo alimentación/día</span><span class="row-val">$ ' + fm(cd) + '</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-syringe"></i> Costo sanidad/día</span><span class="row-val">$ ' + fm(csd) + '</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-calculator"></i> Costo por kilo</span><span class="row-val" style="color:' + (ckp < DB_CACHE.precioKG ? '#22c55e' : '#ef4444') + '">$ ' + fm(ckp) + '/kg</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-sack-dollar"></i> Ganancia neta/mes</span><span class="row-val" style="color:' + (gan >= 0 ? '#22c55e' : '#ef4444') + '">$ ' + fm(gan) + '</span></div></div>' +
            appsHTML + '<div class="section-title"><i class="fa-solid fa-clock-rotate-left"></i> HISTORIAL</div>' + hist +
            '<div class="section-title"><i class="fa-solid fa-mortar-pestle"></i> DIETA</div>' + dietaHTML +
            '<div class="flex-col gap10 mt20 pt12 bt"><button class="btn btn-gold" onclick="updateWeight(' + id + ')"><i class="fa-solid fa-gauge-high"></i> REGISTRAR PESAJE</button></div></div>';

        document.getElementById('v-perfil').innerHTML = html;
        var oldBtn = document.getElementById('btnBackFloat'); if (oldBtn) oldBtn.remove();
        var btnBack = document.createElement('button'); btnBack.className = 'btn-back-float'; btnBack.id = 'btnBackFloat';
        btnBack.innerHTML = '<i class="fa-solid fa-arrow-left"></i>'; btnBack.onclick = closeProfile;
        document.body.appendChild(btnBack);
        window.scrollTo(0, 0);
    });
}

function updateWeight(id) {
    var p = prompt('⚖️ Nuevo pesaje (kg):'); if (!p) return;
    p = parseFloat(p); if (isNaN(p) || p < 20 || p > 2000) { alert('⚠️ Peso entre 20 y 2.000 kg'); return; }
    var a = DB_CACHE.animales.find(function(x) { return x.id === id; }); if (!a) return;
    a.historial.push({ fecha: new Date().toLocaleDateString(), peso: p });
    guardarAnimal(a, function() { showProfile(id); });
}

function deleteAnimal(id) {
    if (confirm('⚠️ ¿Eliminar este animal definitivamente?')) {
        eliminarAnimal(id, function() { closeProfile(); });
    }
}

function closeProfile() {
    var btn = document.getElementById('btnBackFloat'); if (btn) btn.remove();
    document.getElementById('v-perfil').classList.add('hidden');
    document.getElementById('nav').style.display = 'flex';
    goPage('lote');
}

// ==================== APLICAR PRODUCTO ====================
function openAplicarProducto(animalId) {
    cargarDatos(function() {
        var a = DB_CACHE.animales.find(function(x) { return x.id === animalId; }); if (!a) return;
        var peso = a.historial[a.historial.length - 1].peso;
        var catalogo = CATALOGO_SANIDAD.concat(DB_CACHE.suplementos);
        var prodOptions = '';
        for (var i = 0; i < catalogo.length; i++) {
            prodOptions += '<option value="' + catalogo[i].id + '">' + catalogo[i].nombre + ' (' + catalogo[i].diasEfecto + 'd efecto, ' + catalogo[i].retiro + 'd venta)</option>';
        }
        var html = '<div style="font-weight:700;font-size:.9rem;margin-bottom:12px;color:var(--accent);">💉 APLICAR A ' + a.nombre + ' (' + fm(peso) + ' kg)</div><div class="flex-col gap10">' +
            '<select id="aplProducto" onchange="calcularDosisModal(' + peso + ')">' + prodOptions + '</select>' +
            '<div id="dosisInfo" style="font-size:.7rem;color:var(--muted);"></div>' +
            '<input id="aplML" type="number" placeholder="ml aplicados" step=".1">' +
            '<button class="btn btn-gold mt8" onclick="aplicarProducto(' + animalId + ')"><i class="fa-solid fa-check"></i> CONFIRMAR</button>' +
            '<button class="btn btn-gray" onclick="document.querySelector(\'.modal-overlay\').remove()">CANCELAR</button></div>';
        showModal(html);
        setTimeout(function() { calcularDosisModal(peso); }, 100);
    });
}

function calcularDosisModal(peso) {
    var sel = document.getElementById('aplProducto'), info = document.getElementById('dosisInfo');
    if (!sel || !info) return;
    var catalogo = CATALOGO_SANIDAD.concat(DB_CACHE.suplementos);
    var prod = catalogo.find(function(p) { return p.id === sel.value; });
    if (prod) info.innerHTML = '📋 Dosis: <b>' + (peso / prod.dosis).toFixed(1) + ' ml</b> (1 ml/' + prod.dosis + ' kg)';
}

function aplicarProducto(animalId) {
    var sel = document.getElementById('aplProducto'), mlInput = document.getElementById('aplML');
    if (!sel || !mlInput) return;
    var prodId = sel.value, ml = parseFloat(mlInput.value);
    if (isNaN(ml) || ml <= 0) { alert('⚠️ Ingrese ml válidos'); return; }
    var catalogo = CATALOGO_SANIDAD.concat(DB_CACHE.suplementos);
    var prod = catalogo.find(function(p) { return p.id === prodId; });
    var a = DB_CACHE.animales.find(function(x) { return x.id === animalId; });
    if (!prod || !a) return;
    var precioML = DB_CACHE.preciosSanidad[prodId] || 0, costoTotal = precioML * ml;
    guardarAplicacion({ animalId: animalId, productoId: prodId, producto: prod.nombre, ml: ml, costo: costoTotal, fecha: new Date().toLocaleDateString() }, function() {
        if (!DB_CACHE.stockSuplementos.find(function(s) { return s.id === prodId; })) {
            DB_CACHE.stockSanidad[prodId] = Math.max(0, (DB_CACHE.stockSanidad[prodId] || 0) - ml);
            setConfig('stockSanidad', DB_CACHE.stockSanidad);
        } else {
            var st = DB_CACHE.stockSuplementos.find(function(s) { return s.id === prodId; });
            if (st) { st.cantidad = Math.max(0, (st.cantidad || 0) - ml); guardarStockSuplemento(st); }
        }
        document.querySelector('.modal-overlay').remove();
        showToast('✅ ' + prod.nombre + ': ' + ml + ' ml ($' + fm(costoTotal) + ')');
        cargarDatos(function() { showProfile(animalId); });
    });
}

// ==================== PÁGINAS ====================
function renderPrecios() {
    cargarDatos(function() {
        var totalKg = 0, costoTotal = 0, csTotal = 0;
        DB_CACHE.animales.forEach(function(a) { var cp = a.historial[a.historial.length - 1].peso; totalKg += cp; costoTotal += getCostoDiario(cp, DB_CACHE.precios); });
        csTotal = 0; for (var i = 0; i < DB_CACHE.aplicaciones.length; i++) csTotal += (DB_CACHE.aplicaciones[i].costo || 0);
        var gmdL = DB_CACHE.animales.length > 0 ? DB_CACHE.animales.reduce(function(s, a) { return s + getGMD(a.historial); }, 0) / DB_CACHE.animales.length : 0;
        var ingM = gmdL * 30 * DB_CACHE.precioKG * DB_CACHE.animales.length, gan = ingM - (costoTotal * 30) - (csTotal / 12);
        var html = '<div class="card"><div style="font-weight:700;margin-bottom:14px;color:var(--accent);"><i class="fa-solid fa-tags"></i> PRECIOS ALIMENTOS (COP/kg)</div>';
        for (var i = 0; i < ALIMENTOS.length; i++) html += '<div style="display:flex;align-items:center;gap:8px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.03);"><i class="fa-solid ' + IC_ALIMENTOS[ALIMENTOS[i]] + '" style="width:18px;"></i><span style="flex:1;font-size:.78rem;">' + NM_ALIMENTOS[ALIMENTOS[i]] + '</span><span style="font-size:.7rem;color:var(--muted);">$</span><input id="pr-' + ALIMENTOS[i] + '" type="number" value="' + (DB_CACHE.precios[ALIMENTOS[i]] || 0) + '" style="width:85px;text-align:right;padding:8px 10px;"></div>';
        html += '<button class="btn btn-gold mt12" onclick="savePrecios()"><i class="fa-solid fa-check"></i> GUARDAR</button></div>' +
            '<div class="card"><div style="font-weight:700;margin-bottom:10px;color:var(--muted);"><i class="fa-solid fa-calculator"></i> RENTABILIDAD</div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-sack-dollar"></i> Valor del lote</span><span class="row-val">$ ' + fm(totalKg * DB_CACHE.precioKG) + '</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-syringe"></i> Sanidad total</span><span class="row-val">$ ' + fm(csTotal) + '</span></div>' +
            '<div class="row"><span class="row-label"><i class="fa-solid fa-chart-line"></i> Ganancia neta/mes</span><span class="row-val" style="color:' + (gan >= 0 ? '#22c55e' : '#ef4444') + '">$ ' + fm(gan) + '</span></div></div>';
        document.getElementById('v-precios').innerHTML = html;
    });
}

function savePrecios() {
    for (var i = 0; i < ALIMENTOS.length; i++) { var el = document.getElementById('pr-' + ALIMENTOS[i]); if (el) DB_CACHE.precios[ALIMENTOS[i]] = parseFloat(el.value) || 0; }
    setConfig('precios', DB_CACHE.precios); showToast('✅ Precios actualizados');
}

function renderStock() {
    cargarDatos(function() {
        var mez = { pasto: 0, salvado: 0, sal: 0, melaza: 0, urea: 0, levadura: 0, bicarb: 0 };
        DB_CACHE.animales.forEach(function(a) { var d = getDiet(a.historial[a.historial.length - 1].peso); for (var k in mez) mez[k] += d[k]; });
        var html = '<div class="card"><div style="font-weight:700;margin-bottom:14px;color:var(--accent);"><i class="fa-solid fa-boxes"></i> STOCK ALIMENTOS (kg)</div>';
        for (var j = 0; j < ALIMENTOS.length; j++) {
            var st = DB_CACHE.stock[ALIMENTOS[j]] || 0, co = mez[ALIMENTOS[j]] || 0, cr = (ALIMENTOS[j] === 'pasto' || ALIMENTOS[j] === 'salvado') ? co : co / 1000;
            var dias = cr > 0 && st > 0 ? st / cr : 999, dCol = dias < 3 ? '#ef4444' : dias < 7 ? '#f59e0b' : '#22c55e';
            html += '<div class="stock-row"><i class="fa-solid ' + IC_ALIMENTOS[ALIMENTOS[j]] + '"></i><div class="stock-info"><span class="stock-name">' + NM_ALIMENTOS[ALIMENTOS[j]] + '</span><span class="stock-consumo">Consumo diario: ' + cr.toFixed(1) + ' kg</span></div><input id="st-' + ALIMENTOS[j] + '" type="number" value="' + Math.round(st) + '" style="width:80px;text-align:right;padding:8px 10px;font-size:.85rem;min-height:40px;" step="1"><span style="font-size:.68rem;font-weight:600;color:' + dCol + ';min-width:35px;text-align:center;">' + (dias === 999 ? '--' : Math.round(dias) + 'd') + '</span></div>';
        }
        html += '<button class="btn btn-gold mt12" onclick="saveStock()"><i class="fa-solid fa-check"></i> GUARDAR</button></div>';
        document.getElementById('v-stock').innerHTML = html;
    });
}

function saveStock() {
    for (var i = 0; i < ALIMENTOS.length; i++) { var el = document.getElementById('st-' + ALIMENTOS[i]); if (el) DB_CACHE.stock[ALIMENTOS[i]] = parseFloat(el.value) || 0; }
    setConfig('stock', DB_CACHE.stock); showToast('✅ Stock actualizado');
}

function renderSanidad() {
    cargarDatos(function() {
        var catalogo = CATALOGO_SANIDAD.concat(DB_CACHE.suplementos);
        var html = '<div class="card"><div style="font-weight:700;font-size:.8rem;margin-bottom:12px;color:var(--accent);"><i class="fa-solid fa-syringe"></i> INVENTARIO SANIDAD</div>';
        for (var i = 0; i < catalogo.length; i++) {
            var prod = catalogo[i];
            var stock = DB_CACHE.stockSanidad[prod.id] || 0;
            var supStock = DB_CACHE.stockSuplementos.find(function(s) { return s.id === prod.id; });
            if (supStock) stock = supStock.cantidad || 0;
            var precioML = DB_CACHE.preciosSanidad[prod.id] || 0;
            if (supStock) precioML = supStock.precioML || 0;
            html += '<div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.03);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;"><i class="fa-solid ' + prod.icono + '" style="color:' + prod.color + ';font-size:1.2rem;width:22px;"></i><div style="flex:1;"><span style="font-size:.78rem;font-weight:600;">' + prod.nombre + '</span><span style="font-size:.6rem;color:var(--muted);display:block;">Stock: <b>' + fm(stock) + ' ml</b> · $<b>' + fm(precioML) + '/ml</b> · Efecto: ' + prod.diasEfecto + 'd · Venta: ' + prod.retiro + 'd</span></div></div>' +
                '<div style="font-size:.65rem;color:var(--muted);margin-bottom:6px;">➕ Comprar:</div><div style="display:flex;gap:6px;align-items:center;">' +
                '<input id="compraML-' + prod.id + '" type="number" placeholder="ml" style="flex:1;padding:8px 10px;font-size:.7rem;min-height:36px;">' +
                '<input id="compraCosto-' + prod.id + '" type="number" placeholder="Costo total ($)" style="flex:1;padding:8px 10px;font-size:.7rem;min-height:36px;">' +
                '<button class="btn btn-green" onclick="agregarCompraSanidad(\'' + prod.id + '\')" style="width:auto;padding:8px 12px;font-size:.65rem;"><i class="fa-solid fa-plus"></i></button></div></div>';
        }
        html += '</div>';
        document.getElementById('v-sanidad').innerHTML = html;
    });
}

function agregarCompraSanidad(prodId) {
    var mlEl = document.getElementById('compraML-' + prodId), costoEl = document.getElementById('compraCosto-' + prodId);
    if (!mlEl || !costoEl) return;
    var ml = parseFloat(mlEl.value), costo = parseFloat(costoEl.value);
    if (isNaN(ml) || ml <= 0) { alert('⚠️ Cantidad válida'); return; }
    if (isNaN(costo) || costo <= 0) { alert('⚠️ Costo válido'); return; }
    var supStock = DB_CACHE.stockSuplementos.find(function(s) { return s.id === prodId; });
    if (supStock) { supStock.cantidad = (supStock.cantidad || 0) + ml; supStock.precioML = costo / ml; guardarStockSuplemento(supStock); }
    else { DB_CACHE.stockSanidad[prodId] = (DB_CACHE.stockSanidad[prodId] || 0) + ml; DB_CACHE.preciosSanidad[prodId] = costo / ml; setConfig('stockSanidad', DB_CACHE.stockSanidad); setConfig('preciosSanidad', DB_CACHE.preciosSanidad); }
    mlEl.value = ''; costoEl.value = ''; renderSanidad();
    showToast('✅ Compra registrada ($' + fm(costo / ml) + '/ml)');
}

// ==================== CONFIGURACIÓN ====================
function renderConfig() {
    cargarDatos(function() {
        var supsHTML = '';
        for (var i = 0; i < DB_CACHE.suplementos.length; i++) {
            var s = DB_CACHE.suplementos[i];
            supsHTML += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.03);"><i class="fa-solid ' + s.icono + '" style="color:' + s.color + ';"></i><span style="flex:1;font-size:.75rem;">' + s.nombre + ' (' + s.unidad + ')</span><button class="btn btn-danger btn-sm" onclick="eliminarSuplemento(\'' + s.id + '\')" style="padding:4px 10px;"><i class="fa-solid fa-trash"></i></button></div>';
        }
        var html = '<div class="card config-section"><h3><i class="fa-solid fa-flask"></i> SUPLEMENTOS PERSONALIZADOS</h3>' +
            '<div class="flex-col gap8"><input id="supNombre" type="text" placeholder="Nombre del suplemento"><input id="supDosis" type="number" placeholder="Dosis (ml o g por kg)" step="1"><input id="supEfecto" type="number" placeholder="Días de efecto" step="1"><input id="supRetiro" type="number" placeholder="Días de retiro (0=sin retiro)" step="1">' +
            '<select id="supUnidad"><option value="ml">Mililitros (ml)</option><option value="g">Gramos (g)</option></select>' +
            '<button class="btn btn-purple" onclick="agregarSuplemento()"><i class="fa-solid fa-plus"></i> AGREGAR SUPLEMENTO</button>' + supsHTML + '</div></div>' +
            '<div class="card config-section"><h3><i class="fa-solid fa-database"></i> RESPALDO</h3>' +
            '<div class="flex-col gap8"><button class="btn btn-gold" onclick="exportarDatos()"><i class="fa-solid fa-download"></i> EXPORTAR DATOS</button>' +
            '<button class="btn btn-gray" onclick="importarDatos()"><i class="fa-solid fa-upload"></i> IMPORTAR DATOS</button></div></div>' +
            '<div class="card config-section"><h3><i class="fa-solid fa-bell"></i> NOTIFICACIONES</h3>' +
            '<button class="btn btn-green" onclick="solicitarPermisoNotificaciones()"><i class="fa-solid fa-bell"></i> ACTIVAR NOTIFICACIONES</button>' +
            '<p style="font-size:.65rem;color:var(--muted);margin-top:6px;">Recibirás recordatorios de pesaje cada 30 días.</p></div>';
        document.getElementById('v-config').innerHTML = html;
    });
}

function agregarSuplemento() {
    var n = document.getElementById('supNombre').value.trim();
    var dosis = parseFloat(document.getElementById('supDosis').value);
    var efecto = parseInt(document.getElementById('supEfecto').value);
    var retiro = parseInt(document.getElementById('supRetiro').value);
    var unidad = document.getElementById('supUnidad').value;
    if (!n || isNaN(dosis) || isNaN(efecto)) { alert('⚠️ Complete todos los campos'); return; }
    var sup = { id: generarId(), nombre: n, dosis: dosis, diasEfecto: efecto || 30, retiro: retiro || 0, unidad: unidad, icono: 'fa-flask', color: '#a78bfa', tipo: 'personalizado' };
    guardarSuplemento(sup, function() { cargarDatos(function() { renderConfig(); showToast('✅ Suplemento agregado'); }); });
}

// ==================== NOTIFICACIONES ====================
function solicitarPermisoNotificaciones() {
    if (!('Notification' in window)) { showToast('❌ Este dispositivo no soporta notificaciones'); return; }
    Notification.requestPermission().then(function(perm) {
        if (perm === 'granted') { showToast('✅ Notificaciones activadas'); programarNotificaciones(); }
        else { showToast('❌ Permiso denegado'); }
    });
}

function programarNotificaciones() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var ahora = new Date();
    var recordatorio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 30, 8, 0, 0);
    var tiempo = recordatorio.getTime() - ahora.getTime();
    if (tiempo > 0) {
        setTimeout(function() {
            new Notification('🐄 GANADERO ÉLITE', { body: 'Toca registrar el pesaje mensual de tus animales.', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Ctext y="22" font-size="20"%3E🐄%3C/text%3E%3C/svg%3E', tag: 'pesaje-mensual' });
            programarNotificaciones();
        }, Math.min(tiempo, 30 * 24 * 60 * 60 * 1000));
    }
}

// ==================== INICIAR ====================
initDB(function() {
    cargarDatos(function() { renderLote(); });
    solicitarPermisoNotificaciones();
});
