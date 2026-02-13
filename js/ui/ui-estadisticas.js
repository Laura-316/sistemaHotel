// ui-estadisticas.js
// =============================================================================
// Vistas relacionadas con estadísticas y gestión de usuarios
// - Panel de Estadísticas (admin)
// - Gestión de Usuarios (admin)
// - Historial de Reservas del Cliente
// =============================================================================

import { mainContent } from './ui-core.js';
import { getReservas, getUsers } from '../storage.js';
import { pintarTablaReservas } from './ui-helpers.js';

// ─── RENDER PRINCIPAL DE ESTADÍSTICAS ────────────────────────────────────────
export const renderEstadisticas = () => {
    if (!mainContent) return;

    const reservas = getReservas();
    const usuarios = getUsers();

    const totalIngresos = reservas
        .filter(r => r.estado === 'confirmada')
        .reduce((acc, r) => acc + (r.total || 0), 0);

    const totalReservas = reservas.length;
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    const ocupacion = totalReservas > 0 ? ((confirmadas / totalReservas) * 100).toFixed(1) : 0;

    mainContent.innerHTML = `
        <div style="animation: fadeIn 0.5s ease;">
            <h2 class="serif-title">Análisis de Rendimiento</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px;">
                <div class="stat-card" style="border-left: 4px solid #d4af37;">
                    <small style="color: #d4af37;">INGRESOS TOTALES</small>
                    <h2 style="margin: 10px 0;">$${totalIngresos.toLocaleString()}</h2>
                    <p style="font-size: 0.7rem; color: #666;">Confirmados</p>
                </div>
                <div class="stat-card" style="border-left: 4px solid #3498db;">
                    <small style="color: #3498db;">OCUPACIÓN</small>
                    <h2 style="margin: 10px 0;">${ocupacion}%</h2>
                    <div style="width: 100%; background: #222; height: 4px; border-radius: 2px; margin-top:5px;">
                        <div style="width: ${ocupacion}%; background: #3498db; height: 100%;"></div>
                    </div>
                </div>
                <div class="stat-card" style="border-left: 4px solid #2ecc71;">
                    <small style="color: #2ecc71;">CLIENTES</small>
                    <h2 style="margin: 10px 0;">${usuarios.filter(u => u.role?.toLowerCase() === 'client').length}</h2>
                    <p style="font-size: 0.7rem; color: #666;">Registrados</p>
                </div>
                <div class="stat-card" style="border-left: 4px solid #e74c3c;">
                    <small style="color: #e74c3c;">RESERVAS</small>
                    <h2 style="margin: 10px 0;">${totalReservas}</h2>
                    <p style="font-size: 0.7rem; color: #666;">Totales</p>
                </div>
            </div>
        </div>
    `;
};

// ─── GESTIÓN DE USUARIOS ─────────────────────────────────────────────────────
export const renderGestionUsuarios = () => {
    if (!mainContent) return;

    const usuarios = getUsers().filter(u => u.role?.toLowerCase() !== 'admin');

    mainContent.innerHTML = `
        <h2 class="serif-title">Gestión de Usuarios</h2>
        
        <div class="filter-bar" style="background: #0a0a0a; padding: 15px; border-radius: 12px; border: 1px solid #1a1a1a; margin: 25px 0; display: flex; gap: 15px; align-items: center;">
            <input type="text" id="user-search" placeholder="Buscar por nombre o email..." 
                   onkeyup="UI.filtrarUsuarios()"
                   style="flex-grow: 1; padding: 12px; border-radius: 8px; border: 1px solid #333; background: #000; color: white;">
            
            <div class="role-filters" style="display: flex; gap: 8px;">
                <button class="filter-btn active" onclick="UI.setFiltroRol('todos', this)">Todos</button>
                <button class="filter-btn" onclick="UI.setFiltroRol('client', this)">Clientes</button>
                <button class="filter-btn" onclick="UI.setFiltroRol('operator', this)">Operadores</button>
            </div>
            <input type="hidden" id="rol-activo-val" value="todos">
        </div>

        <table class="admin-table">
            <thead>
                <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acción</th></tr>
            </thead>
            <tbody id="user-table-body">
                ${usuarios.map(u => `
                    <tr data-rol="${u.role?.toLowerCase() || ''}" 
                        data-info="${(u.name || '').toLowerCase()} ${(u.email || '').toLowerCase()}">
                        <td><strong>${u.name || '—'}</strong></td>
                        <td>${u.email || '—'}</td>
                        <td><span class="rol-pill ${u.role?.toLowerCase() || ''}">${u.role || '—'}</span></td>
                        <td>
                            <button class="btn-delete" 
                                    onclick="UI.eliminarUsuario('${u.email}')">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
};

// ─── FILTRO DE USUARIOS ──────────────────────────────────────────────────────
export const filtrarUsuarios = () => {
    const busqueda = document.getElementById('user-search')?.value?.toLowerCase().trim() || '';
    let rolActivo = document.getElementById('rol-activo-val')?.value || 'todos';

    // Normalización para compatibilidad con valores antiguos o errores de tipeo
    if (rolActivo === 'cliente') rolActivo = 'client';
    if (rolActivo === 'operador') rolActivo = 'operator';

    // Debug temporal (comenta esta línea cuando todo esté estable)
    console.log(`[Filtro Usuarios] Búsqueda: "${busqueda}" | Rol activo: "${rolActivo}"`);

    const filas = document.querySelectorAll('#user-table-body tr');

    filas.forEach(fila => {
        const info = fila.getAttribute('data-info') || '';
        const rol  = fila.getAttribute('data-rol') || '';

        const coincideRol   = (rolActivo === 'todos' || rol === rolActivo);
        const coincideTexto = info.includes(busqueda);

        fila.style.display = (coincideRol && coincideTexto) ? '' : 'none';
    });
};

// ─── CAMBIAR FILTRO DE ROL ───────────────────────────────────────────────────
export const setFiltroRol = (rol, boton) => {
    document.querySelectorAll('.role-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    boton.classList.add('active');
    
    const hiddenInput = document.getElementById('rol-activo-val');
    if (hiddenInput) hiddenInput.value = rol;

    filtrarUsuarios();
};

// ─── ELIMINAR USUARIO ────────────────────────────────────────────────────────
export const eliminarUsuario = (email) => {
    if (!confirm("¿Eliminar usuario? Esta acción no se puede deshacer.")) return;

    const usuariosActuales = getUsers().filter(u => u.email !== email);
    localStorage.setItem('hotel_users', JSON.stringify(usuariosActuales));

    // Refrescar la vista
    renderGestionUsuarios();
};

// ─── HISTORIAL DE RESERVAS DEL CLIENTE ───────────────────────────────────────
export const renderHistorialCliente = (user) => {
    if (!mainContent || !user) return;

    const misReservas = getReservas().filter(r => r.userEmail === user.email);

    mainContent.innerHTML = `
        <h2 class="serif-title">Mis Reservas</h2>
        <div style="margin-top: 25px;">
            ${pintarTablaReservas(misReservas, {
                mostrarAccionEliminar: true,     // ACTIVADO → botón "Cancelar" debe aparecer
                mostrarReprogramar: false,
                esVistaCliente: true             // muestra "Cancelar" en vez de "× Eliminar"
            })}
        </div>
    `;
};

// ─── CANCELAR RESERVA (para clientes) ────────────────────────────────────────
export const cancelarReserva = (id) => {
    console.log("[cancelarReserva] Iniciando cancelación para ID:", id); // debug

    if (!confirm("¿Realmente quieres cancelar esta reserva?")) {
        console.log("[cancelarReserva] Cancelado por el usuario");
        return;
    }

    let reservas = getReservas();
    console.log("[cancelarReserva] Reservas antes:", reservas.length);

    const index = reservas.findIndex(r => r.id === id);
    if (index === -1) {
        console.error("[cancelarReserva] No se encontró reserva con ID:", id);
        Helpers.mostrarMensaje("No se encontró la reserva", "error");
        return;
    }

    // Cambiar estado
    reservas[index].estado = 'cancelada';
    console.log("[cancelarReserva] Reserva actualizada:", reservas[index]);

    // Guardar de nuevo
    try {
        localStorage.setItem('hotel_reservas', JSON.stringify(reservas));
        console.log("[cancelarReserva] Guardado en localStorage");
    } catch (e) {
        console.error("[cancelarReserva] Error al guardar:", e);
        Helpers.mostrarMensaje("Error al guardar el cambio", "error");
        return;
    }

    Helpers.mostrarMensaje("Reserva cancelada exitosamente", "success");

    // Refrescar vista del cliente
    const user = Helpers.getUsuarioActivo();
    if (user) {
        console.log("[cancelarReserva] Refrescando historial para usuario:", user.name);
        renderHistorialCliente(user);
    } else {
        console.warn("[cancelarReserva] No se encontró usuario activo");
    }
};

// ─── EXPORTACIONES FINALES ───────────────────────────────────────────────────
// Todas las funciones ya están exportadas individualmente con export const
// → NO repetir export { ... } aquí para evitar errores de duplicado