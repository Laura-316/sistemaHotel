// ui-logistica.js
// =============================================================================
// Vista Logística de Reservas (para operadores y admins)
// Incluye: tabla de reservas, filtros por nombre/estado, acciones de edición
// =============================================================================

import { mainContent } from './ui-core.js';
import { getReservas, StorageService } from '../storage.js';

// ─── RENDER PRINCIPAL DE LOGÍSTICA ───────────────────────────────────────────
export const renderLogisticaOperador = () => {
    if (!mainContent) return;

    const reservas = getReservas()
        .filter(r => r.estado !== 'cancelada')
        .reverse(); // más recientes primero

    mainContent.innerHTML = `
        <div style="animation: fadeIn 0.5s ease;">
            <h2 class="serif-title">Logística de Flujo</h2>
            
            <div style="background:#0a0a0a; padding:20px; border-radius:12px; border:1px solid #1a1a1a; margin-bottom:20px; display:flex; gap:15px; align-items:center;">
                <div style="flex:2;">
                    <input type="text" id="op-search" placeholder="Buscar por nombre..." 
                           onkeyup="UI.filtrarLogistica()"
                           style="width:100%; background:#000; color:#fff; border:1px solid #333; padding:12px; border-radius:5px;">
                </div>
                <div style="flex:1;">
                    <select id="op-filter-status" onchange="UI.filtrarLogistica()"
                            style="width:100%; background:#000; color:#fff; border:1px solid #333; padding:12px; border-radius:5px;">
                        <option value="todos">Todos los Estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="confirmada">Confirmadas</option>
                    </select>
                </div>
            </div>

            <div id="contenedor-tabla-logistica">
                ${pintarTablaOperador(reservas)}
            </div>
        </div>
    `;
};

// ─── GENERA LA TABLA DE RESERVAS ─────────────────────────────────────────────
const pintarTablaOperador = (data) => `
    <table class="admin-table">
        <thead>
            <tr>
                <th>HUÉSPED</th>
                <th>ESTADO</th>
                <th>TOTAL</th>
                <th>REPROGRAMAR</th>
                <th>ACCIÓN</th>
            </tr>
        </thead>
        <tbody id="logistica-body">
            ${data.map(r => `
                <tr data-user="${r.userName.toLowerCase()}" 
                    data-status="${r.estado}">
                    <td>
                        <strong>${r.userName}</strong><br>
                        <small>${r.fechas || '—'}</small>
                    </td>
                    <td>
                        <select onchange="UI.cambiarEstadoReserva('${r.id}', this.value)" 
                                class="status-select ${r.estado === 'confirmada' ? 'status-confirmada' : 'status-pendiente'}"
                                style="background:#111; color:#fff; border:1px solid #333; padding:5px; border-radius:4px;">
                            <option value="pendiente" ${r.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="confirmada" ${r.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                        </select>
                    </td>
                    <td><strong>$${(r.total || 0).toLocaleString()}</strong></td>
                    <td>
                        <div style="display:flex; gap:5px;">
                            <input type="date" id="re-date-${r.id}" 
                                   style="background:#111; color:#fff; border:1px solid #333; font-size:0.7rem; padding:5px;">
                            <button onclick="UI.reproOperador('${r.id}')" 
                                    style="background:#3498db; border:none; color:white; padding:5px 8px; border-radius:4px; cursor:pointer;">
                                OK
                            </button>
                        </div>
                    </td>
                    <td>
                        <button class="btn-delete" 
                                style="color:#e74c3c; background:none; border:none; font-size:1.2rem; cursor:pointer;" 
                                onclick="UI.borrarReserva('${r.id}')">
                            ×
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;

// ─── FILTRO LOCAL COMBINADO (nombre + estado) ────────────────────────────────
export const filtrarLogistica = () => {
    const searchInput = document.getElementById('op-search');
    const statusSelect = document.getElementById('op-filter-status');

    if (!searchInput || !statusSelect) return;

    const term = searchInput.value.toLowerCase().trim();
    const status = statusSelect.value;

    const rows = document.querySelectorAll('#logistica-body tr');

    rows.forEach(row => {
        const matchesName  = row.getAttribute('data-user').includes(term);
        const matchesStatus = (status === 'todos' || row.getAttribute('data-status') === status);

        row.style.display = (matchesName && matchesStatus) ? '' : 'none';
    });
};

// ─── ACCIONES SOBRE RESERVAS ─────────────────────────────────────────────────
export const cambiarEstadoReserva = (id, nuevoEstado) => {
    StorageService.actualizarEstado(id, nuevoEstado);
    
    // Refrescar la vista sin recargar todo
    const currentStatus = document.getElementById('op-filter-status')?.value || 'todos';
    renderLogisticaOperador();
    
    // Restaurar filtro si existía
    if (currentStatus !== 'todos') {
        const select = document.getElementById('op-filter-status');
        if (select) select.value = currentStatus;
        filtrarLogistica();
    }
};

export const reproOperador = (id) => {
    const input = document.getElementById(`re-date-${id}`);
    if (!input || !input.value) {
        alert("Seleccione una fecha para reprogramar");
        return;
    }

    // Asumiendo que reprogramar cambia la fecha de ingreso (ajusta según tu lógica)
    StorageService.reprogramarReserva(id, input.value, input.value);
    renderLogisticaOperador();
};

export const borrarReserva = (id) => {
    if (!confirm("¿Eliminar esta reserva definitivamente?")) return;

    StorageService.eliminarReserva(id);

    // Refrescar según contexto actual
    const user = JSON.parse(localStorage.getItem('sesion_activa'));
    if (!user) return;

    if (document.getElementById('logistica-body')) {
        // Estamos en logística → refrescar
        renderLogisticaOperador();
    } else if (user.role.toLowerCase() === 'admin') {
        // Si estamos en dashboard admin
        import('./ui-dashboard.js').then(m => m.renderDashboard(user));
    } else {
        // fallback
        import('./ui-dashboard.js').then(m => m.renderDashboard(user));
    }
};

// ─── EXPORTACIONES FINALES ───────────────────────────────────────────────────
// renderLogisticaOperador, filtrarLogistica, cambiarEstadoReserva, reproOperador y borrarReserva
// YA están exportados arriba con export const → NO repetir export { ... }

// Si más adelante necesitas exportar alguna función adicional que no tenga export const,
// agrégala aquí. Por ahora: vacío