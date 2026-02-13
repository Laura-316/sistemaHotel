// ui-helpers.js
// =============================================================================
// Funciones auxiliares reutilizables en toda la interfaz
// - Formateo de tablas
// - Mensajes y alertas
// - Helpers de fechas y números
// - Filtros genéricos DOM
// - Otras utilidades comunes
// =============================================================================

import { mainContent } from './ui-core.js';

// ─── TABLA GENÉRICA DE RESERVAS ──────────────────────────────────────────────
// Usada en dashboard admin, historial cliente, logística, etc.
export const pintarTablaReservas = (reservas, opciones = {}) => {
    const { 
        mostrarAccionEliminar = false, 
        mostrarReprogramar = false,
        esVistaCliente = false   // bandera para mostrar "Cancelar" en vista cliente
    } = opciones;

    if (!reservas || reservas.length === 0) {
        return '<p style="color:#666; padding:20px; text-align:center;">No hay reservas para mostrar.</p>';
    }

    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Fechas</th>
                    <th>Total</th>
                    <th>Estado</th>
                    ${mostrarAccionEliminar || mostrarReprogramar ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${reservas.map(r => `
                    <tr data-id="${r.id || ''}">
                        <td><strong>${r.userName || '—'}</strong><br><small>${r.userEmail || '—'}</small></td>
                        <td>${r.tipo || '—'}</td>
                        <td>${r.fechas || '—'}</td>
                        <td><strong>$${(r.total || 0).toLocaleString()}</strong></td>
                        <td><span class="status-badge ${r.estado || 'pendiente'}">${r.estado || 'pendiente'}</span></td>
                        ${(mostrarAccionEliminar || mostrarReprogramar) ? `
                            <td style="white-space:nowrap; text-align:center;">
                                ${mostrarReprogramar ? `
                                    <div style="display:flex; gap:5px; justify-content:center;">
                                        <input type="date" id="re-date-${r.id}" style="background:#111; color:#fff; border:1px solid #333; font-size:0.7rem; padding:5px;">
                                        <button onclick="UI.reproOperador('${r.id}')" style="background:#3498db; border:none; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;">
                                            Reprogramar
                                        </button>
                                    </div>
                                ` : ''}
                                ${mostrarAccionEliminar && r.estado !== 'cancelada' ? `
                                    <button class="btn-delete" 
                                            onclick="UI.cancelarReserva('${r.id}')"
                                            style="color:#e74c3c; background:none; border:none; font-size:1rem; cursor:pointer; margin:0 8px;">
                                        ${esVistaCliente ? 'Cancelar' : '× Eliminar'}
                                    </button>
                                ` : r.estado === 'cancelada' ? 
                                    '<span style="color:#888; font-style:italic;">Cancelada</span>' : ''}
                            </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
};

// ─── VERSIÓN SIMPLIFICADA PARA DASHBOARD ADMIN ────────────────────────────────
export const pintarTablaGeneral = (data) => {
    return pintarTablaReservas(data, {
        mostrarAccionEliminar: true,
        mostrarReprogramar: false
    });
};

// ─── MOSTRAR MENSAJE (toast temporal) ────────────────────────────────────────
export const mostrarMensaje = (texto, tipo = 'info', duracionMs = 4000) => {
    const colores = {
        success: '#2ecc71',
        error:   '#e74c3c',
        info:    '#3498db',
        warning: '#f1c40f'
    };

    const color = colores[tipo] || '#3498db';

    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 16px 24px; border-radius: 8px; color: white; font-weight: 500;
        background: ${color}; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        animation: fadeIn 0.4s ease, fadeOut 0.4s ease ${duracionMs/1000 + 0.4}s forwards;
    `;
    msg.textContent = texto;
    document.body.appendChild(msg);

    setTimeout(() => msg.remove(), duracionMs + 800);
};

// ─── HELPER PARA OBTENER USUARIO ACTIVO ──────────────────────────────────────
export const getUsuarioActivo = () => {
    try {
        const sesion = localStorage.getItem('sesion_activa');
        return sesion ? JSON.parse(sesion) : null;
    } catch (e) {
        console.error("Error al parsear usuario activo:", e);
        return null;
    }
};

// ─── FORMATEO DE FECHA SIMPLE (YYYY-MM-DD → DD/MM/YYYY) ───────────────────────
export const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    try {
        const [y, m, d] = fechaStr.split('-');
        return `${d}/${m}/${y}`;
    } catch {
        return fechaStr;
    }
};

// ─── FILTRO GENÉRICO PARA TABLAS (buscador por texto) ────────────────────────
export const aplicarFiltroTextoTabla = (inputId, tbodyId) => {
    const input = document.getElementById(inputId);
    const tbody = document.getElementById(tbodyId);
    if (!input || !tbody) return;

    const term = input.value.toLowerCase().trim();

    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
};

// ─── REFRESCAR VISTA ACTUAL (fallback simple) ────────────────────────────────
export const refrescarVistaActual = () => {
    const user = getUsuarioActivo();
    if (!user) return;

    const currentView = document.querySelector('#main-content h2')?.innerText.trim() || '';

    if (currentView.includes('Agenda Diaria')) {
        import('./ui-agenda.js').then(m => m.renderAgendaOperador());
    } else if (currentView.includes('Logística') || currentView.includes('Gestión Reservas')) {
        import('./ui-logistica.js').then(m => m.renderLogisticaOperador());
    } else {
        import('./ui-dashboard.js').then(m => m.renderDashboard(user));
    }
};

// ─── EXPORTACIONES ────────────────────────────────────────────────────────────
// Todas las funciones ya están exportadas con export const
// → NO agregar bloque export { ... } al final