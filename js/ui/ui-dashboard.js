// ui-dashboard.js
// =============================================================================
// Renderizado de dashboards según rol del usuario
// Incluye: dashboard operador (con mapa ocupación), admin y cliente
// =============================================================================

import { mainContent } from './ui-core.js';
import { getReservas } from '../storage.js';

// ─── VARIABLE GLOBAL PARA EL MES VISUAL EN EL MINI-CALENDARIO ────────────────
if (typeof window.mesVisualMapa === 'undefined') {
    window.mesVisualMapa = new Date().getMonth(); // mes actual por defecto
}

// ─── DASHBOARD PRINCIPAL (selector por rol) ──────────────────────────────────
export const renderDashboard = (user) => {
    if (!mainContent) return;

    mainContent.innerHTML = ""; // limpiar contenido previo

    const rol = user.role.toLowerCase();

    if (rol === 'admin') {
        renderDashboardAdmin(user);
    } else if (rol === 'operador' || rol === 'operator') {
        renderDashboardOperador(user);
    } else {
        // cliente por defecto
        renderDashboardCliente(user);
    }
};

// ─── DASHBOARD OPERADOR ──────────────────────────────────────────────────────
export const renderDashboardOperador = (user) => {
    const reservas = getReservas();
    const hoy = new Date().toISOString().split('T')[0];

    const llegadasHoy = reservas.filter(r => 
        r.fechas?.includes(hoy) && r.estado !== 'cancelada'
    ).length;

    const pendientes = reservas.filter(r => r.estado === 'pendiente').length;

    mainContent.innerHTML = `
        <div style="animation: fadeIn 0.5s ease;">
            <h1 class="serif-title">Centro de Control</h1>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
                <div class="stat-card" onclick="UI.ejecutarAccion('Agenda Diaria')" 
                     style="cursor:pointer; border-top: 4px solid #3498db;">
                    <small>TRÁFICO HOY</small>
                    <h3>${llegadasHoy} Movimientos</h3>
                    <p style="font-size:0.7rem; color:#666;">Ver cronograma detallado</p>
                </div>
                <div class="stat-card" onclick="UI.ejecutarAccion('Logística de Reservas')" 
                     style="cursor:pointer; border-top: 4px solid #f1c40f;">
                    <small>FLUJO DE TRABAJO</small>
                    <h3>${pendientes} Pendientes</h3>
                    <p style="font-size:0.7rem; color:#666;">Confirmar o reprogramar</p>
                </div>
                <div class="stat-card" onclick="UI.ejecutarAccion('Nueva Reserva')" 
                     style="cursor:pointer; border-top: 4px solid #2ecc71;">
                    <small>RÁPIDO</small>
                    <h3>Nueva Reserva</h3>
                    <p style="font-size:0.7rem; color:#666;">Check-in presencial</p>
                </div>
            </div>

            <div class="stat-card" style="background: #000; border: 1px solid #1a1a1a;">
                <h4 style="margin-bottom:15px; font-size:0.8rem; color: #3498db;">
                    MAPA DE OCUPACIÓN 2026
                </h4>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
                    ${generarCalendarioOperador(reservas)}
                </div>
            </div>
        </div>
    `;
};

// ─── MINI-CALENDARIO DE OCUPACIÓN ────────────────────────────────────────────
const generarCalendarioOperador = (reservas) => {
    const anioActual = 2026;
    const mesActual = window.mesVisualMapa;
    
    const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0).getDate();
    const hoy = new Date().toISOString().split('T')[0];

    let html = `
        <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 5px;">
            <span style="color: #3498db; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                ${nombresMeses[mesActual]} ${anioActual}
            </span>
            <div style="display: flex; gap: 8px;">
                <button onclick="UI.cambiarMesMapa(-1)" style="background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 2px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">‹</button>
                <button onclick="UI.cambiarMesMapa(1)" style="background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 2px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">›</button>
            </div>
        </div>
    `;

    for (let i = 1; i <= ultimoDiaMes; i++) {
        const diaStr = i < 10 ? `0${i}` : i;
        const mesStr = (mesActual + 1) < 10 ? `0${mesActual + 1}` : mesActual + 1;
        const fecha = `${anioActual}-${mesStr}-${diaStr}`;
        
        const ocupado   = reservas.some(r => r.fechas?.includes(fecha) && r.estado === 'confirmada');
        const pendiente = reservas.some(r => r.fechas?.includes(fecha) && r.estado === 'pendiente');
        const esHoy     = fecha === hoy;

        let fondo      = "#0a0a0a";
        let colorTexto = "#444";

        if (ocupado) {
            fondo = "#3498db";
            colorTexto = "#fff";
        } else if (pendiente) {
            fondo = "#3498db33";
            colorTexto = "#3498db";
        }

        let borde = esHoy ? "1px solid #d4af37" : "1px solid #222";

        html += `
            <div title="Fecha: ${fecha}" 
                 onclick="UI.ejecutarAccion('Agenda Diaria', '${fecha}')"
                 style="height: 32px; background: ${fondo}; border: ${borde}; border-radius: 4px; 
                        display: flex; align-items: center; justify-content: center; 
                        font-size: 0.7rem; font-weight: 500; color: ${colorTexto}; 
                        cursor: pointer; transition: all 0.2s ease;">
                ${i}
            </div>`;
    }

    return html;
};

// ─── NAVEGACIÓN DE MESES ─────────────────────────────────────────────────────
export const cambiarMesMapa = (delta) => {
    window.mesVisualMapa += delta;
    if (window.mesVisualMapa > 11) window.mesVisualMapa = 0;
    if (window.mesVisualMapa < 0)  window.mesVisualMapa = 11;
    
    const user = JSON.parse(localStorage.getItem('sesion_activa'));
    if (user) renderDashboard(user);
};

// ─── DASHBOARD ADMIN ─────────────────────────────────────────────────────────
const renderDashboardAdmin = (user) => {
    const reservas = getReservas();
    const ingresos = reservas
        .filter(r => r.estado === 'confirmada')
        .reduce((acc, r) => acc + (r.total || 0), 0);

    mainContent.innerHTML = `
        <h1 class="serif-title">Panel Maestro</h1>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top:20px;">
            <div class="stat-card">
                <small>INGRESOS CONFIRMADOS</small>
                <h2>$${ingresos.toLocaleString()}</h2>
            </div>
            <div class="stat-card">
                <small>SOLICITUDES</small>
                <h2>${reservas.filter(r => r.estado === 'pendiente').length} Pendientes</h2>
            </div>
        </div>
        <div style="margin-top:40px">
            ${pintarTablaGeneral(reservas)}
        </div>
    `;
};

// ─── DASHBOARD CLIENTE ───────────────────────────────────────────────────────
const renderDashboardCliente = (user) => {
    const reservas = getReservas().filter(r => r.userEmail === user.email);
    const activa = reservas.find(r => r.estado !== 'cancelada');

    mainContent.innerHTML = `
        <h1 class="serif-title">Bienvenido, ${user.name.split(' ')[0]}</h1>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 30px;">
            <div class="stat-card">
                <h4>Próxima Estancia</h4>
                ${activa 
                    ? `<p>${activa.tipo || '—'}</p><span class="status-badge ${activa.estado}">${activa.estado}</span>` 
                    : `<p>Sin reservas activas.</p>`}
            </div>
            <div class="stat-card" style="cursor:pointer" onclick="UI.ejecutarAccion('Mis Reservas')">
                <h4>Historial</h4>
                <p>Ver mis reservas y consumos</p>
            </div>
        </div>
    `;
};

// ─── TABLA GENÉRICA DE RESERVAS ──────────────────────────────────────────────
const pintarTablaGeneral = (data) => `
    <table class="admin-table">
        <thead>
            <tr><th>Huésped</th><th>Habitación</th><th>Total</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
            ${data.map(r => `
                <tr>
                    <td><strong>${r.userName || '—'}</strong></td>
                    <td>${r.tipo || '—'}</td>
                    <td>$${(r.total || 0).toLocaleString()}</td>
                    <td><span class="status-badge ${r.estado}">${r.estado}</span></td>
                    <td>
                        <button class="btn-delete" 
                                style="color:#e74c3c; background:none; border:none; font-size:1.1rem; cursor:pointer;" 
                                onclick="UI.borrarReserva('${r.id}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;

// ─── EXPORTACIONES FINALES ───────────────────────────────────────────────────
// renderDashboard, renderDashboardOperador y cambiarMesMapa YA están exportados arriba
// → NO repetir export { ... } aquí