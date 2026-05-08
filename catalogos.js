var CATALOGO_SANIDAD = [
    { id: 'modificador', nombre: 'Modificador Orgánico', dosis: 50, diasEfecto: 90, retiro: 0, icono: 'fa-flask', color: '#22c55e', tipo: 'fijo' },
    { id: 'vitaminaA', nombre: 'Vitamina ADE', dosis: 50, diasEfecto: 60, retiro: 30, icono: 'fa-sun', color: '#fbbf24', tipo: 'fijo' },
    { id: 'complejoB', nombre: 'Complejo B (B12)', dosis: 50, diasEfecto: 20, retiro: 0, icono: 'fa-capsules', color: '#3b82f6', tipo: 'fijo' },
    { id: 'ivermectina1', nombre: 'Ivermectina 1%', dosis: 50, diasEfecto: 30, retiro: 28, icono: 'fa-shield-virus', color: '#ef4444', tipo: 'fijo' },
    { id: 'ivermectina315', nombre: 'Ivermectina 3.15%', dosis: 50, diasEfecto: 90, retiro: 122, icono: 'fa-shield-halved', color: '#dc2626', tipo: 'fijo' },
    { id: 'fosforo', nombre: 'Fósforo B12', dosis: 20, diasEfecto: 30, retiro: 0, icono: 'fa-bone', color: '#a78bfa', tipo: 'fijo' },
    { id: 'hierro', nombre: 'Hierro Dextrano', dosis: 100, diasEfecto: 30, retiro: 0, icono: 'fa-droplet', color: '#f87171', tipo: 'fijo' }
];

var ALIMENTOS = ['pasto','salvado','melaza','levadura','bicarb','sal','urea'];
var IC_ALIMENTOS = { pasto:'fa-seedling', salvado:'fa-wheat-awn', melaza:'fa-droplet', levadura:'fa-flask', bicarb:'fa-cubes', sal:'fa-vial-circle-check', urea:'fa-flask-vial' };
var NM_ALIMENTOS = { pasto:'Pasto Picado', salvado:'Salvado Trigo', melaza:'Melaza', levadura:'Levadura', bicarb:'Bicarbonato', sal:'Sal Mineral', urea:'UREA' };

function getCatalogoCompleto(callback) {
    getSuplementos(function(sups) {
        var todos = CATALOGO_SANIDAD.slice();
        sups.forEach(function(s) { todos.push(s); });
        callback(todos);
    });
}

function generarId() { return 'sup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); }
