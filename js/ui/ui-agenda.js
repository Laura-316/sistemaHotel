// ui-agenda.js
// =============================================================================
// Vista Agenda Diaria (para operadores)
// Incluye: selector de fecha, buscador rápido, timeline de eventos
// =============================================================================

import { mainContent } from './ui-core.js';
import { getReservas } from '../storage.js';

// ─── RENDER PRINCIPAL DE LA AGENDA DIARIA ────────────────────────────────────
export const renderAgendaOperador = (fechaPropuesta = null) => {
    if (!mainContent) return;

    const hoy = fechaPropuesta || new Date().toISOString().split('T')[0];
    const reservas = getReservas();

    mainContent.innerHTML = `
        <div style="animation: slideIn 0.4s ease;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 class="serif-title" style="margin:0;">Agenda Diaria</h2>
                
                <div style="position:relative; display:flex; align-items:center; background:#0a0a0a; border:1px solid #3498db55; padding:8px 15px; border-radius:12px; cursor:pointer;" 
                     onclick="document.getElementById('agenda-date-picker').showPicker()">
                    <div style="margin-right:12px;">
                        <span style="display:block; font-size:0.6rem; color:#3498db; font-weight:bold; text-transform:uppercase;">Fecha de Gestión</span>
                        <span style="font-family:monospace; color:#fff; font-size:1rem;">${hoy}</span>
                    </div>
                    <span style="font-size:1.2rem;">📅</span>
                    
                    <input type="date" value="${hoy}" id="agenda-date-picker" 
                           style="position:absolute; opacity:0; width:100%; height:100%; left:0; top:0; cursor:pointer;"
                           onchange="UI.renderAgendaOperador(this.value)">
                </div>
            </div>

            <div style="margin-bottom:25px;">
                <input type="text" id="agenda-search" placeholder="🔍 Buscar por nombre de huésped o número de habitación..." 
                       onkeyup="UI.filtrarAgendaLocal()"
                       style="width:100%; background:#0a0a0a; color:#fff; border:1px solid #1a1a1a; padding:15px; border-radius:10px; font-size:0.9rem; border-left: 4px solid #3498db;">
            </div>
            
            <div class="timeline" id="agenda-timeline" style="border-left: 2px solid #3498db22; margin-left: 20px; padding-left: 30px;">
                ${pintarItemsAgenda(reservas, hoy)}
            </div>
        </div>
    `;
};

// ─── PINTAR ITEMS DEL TIMELINE ───────────────────────────────────────────────
const pintarItemsAgenda = (reservas, fecha) => {
    const filtradas = reservas.filter(r => 
        r.fechas?.includes(fecha) && r.estado !== 'cancelada'
    );

    if (filtradas.length === 0) {
        return '<p style="color:#444; padding: 20px 0;">No hay actividades programadas para esta fecha.</p>';
    }
    
    return filtradas
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .map(r => `
            <div class="agenda-item" style="position: relative; margin-bottom: 35px; animation: fadeIn 0.3s ease;">
                <div style="position: absolute; left: -36px; top: 5px; width: 10px; height: 10px; background: ${r.estado === 'confirmada' ? '#3498db' : '#f1c40f'}; border-radius: 50%;"></div>
                <div style="font-family: monospace; font-size: 1.4rem; color: #3498db; font-weight: bold;">${r.hora}</div>
                <div style="color: #fff; font-size: 1.1rem; text-transform: uppercase; font-weight:600;">${r.userName}</div>
                <small style="color: #bbb; display:block; margin-top:2px;">
                    HABITACIÓN: ${r.tipo} | 
                    <span style="color:${r.estado === 'confirmada' ? '#3498db' : '#f1c40f'}">
                        ESTADO: ${r.estado}
                    </span>
                </small>
            </div>
        `)
        .join('');
};

// ─── FILTRO LOCAL EN TIEMPO REAL ─────────────────────────────────────────────
export const filtrarAgendaLocal = () => {
    const input = document.getElementById('agenda-search');
    if (!input) return;

    const term = input.value.toLowerCase().trim();
    const items = document.querySelectorAll('.agenda-item');

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? '' : 'none';
    });
};

// ─── NAVEGACIÓN RÁPIDA DE DÍAS (±1 día) ──────────────────────────────────────
export const cambiarDiaAgenda = (fechaActual, dias) => {
    if (!fechaActual) return;

    const d = new Date(fechaActual);
    d.setDate(d.getDate() + dias);
    const nuevaFecha = d.toISOString().split('T')[0];

    renderAgendaOperador(nuevaFecha);
};

// ─── EXPORTACIONES FINALES ───────────────────────────────────────────────────
// renderAgendaOperador, filtrarAgendaLocal y cambiarDiaAgenda YA están exportados arriba
// → NO poner export { ... } aquí para evitar duplicados

// Si más adelante necesitas exportar alguna función adicional que no tenga export const,
// agrégala aquí. Por ahora: vacío