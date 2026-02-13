// ui.js
// =============================================================================
// BARRIL PRINCIPAL + ORQUESTADOR DE NAVEGACIÓN
// - Importa todos los módulos de UI
// - Define y expone el objeto UI central para eventos y acciones
// - Maneja la navegación entre vistas
// =============================================================================

// Imports (ajusta rutas si tus archivos están en subcarpeta ui/)
import * as Core from './ui-core.js';
import * as Dashboard from './ui-dashboard.js';
import * as Agenda from './ui-agenda.js';
import * as Logistica from './ui-logistica.js';
import * as Reserva from './ui-reserva.js';
import * as Estadisticas from './ui-estadisticas.js';
import * as Helpers from './ui-helpers.js';

// ─── OBJETO UI CENTRAL (facade para toda la aplicación) ─────────────────────
export const UI = {
    // Helpers comunes
    mostrarMensaje: Helpers.mostrarMensaje,
    getUsuarioActivo: Helpers.getUsuarioActivo,
    formatearFecha: Helpers.formatearFecha,
    refrescarVistaActual: Helpers.refrescarVistaActual,

    // Navegación principal (router central)
    ejecutarAccion: (accion, ...args) => {
        const user = Helpers.getUsuarioActivo();
        if (!user || !Core.mainContent) {
            console.warn("[UI] No hay usuario activo o mainContent no encontrado");
            return;
        }

        const acciones = {
            // Dashboard principal
            'Dashboard': () => Dashboard.renderDashboard(user),

            // Operador
            'Agenda Diaria': () => Agenda.renderAgendaOperador(...args),
            'Logística de Reservas': () => Logistica.renderLogisticaOperador(),
            'Gestión Reservas': () => Logistica.renderLogisticaOperador(), // alias admin

            // Reservas
            'Nueva Reserva': () => Reserva.renderFormReserva(user),

            // Admin
            'Gestión Usuarios': () => Estadisticas.renderGestionUsuarios(),
            'Estadísticas': () => Estadisticas.renderEstadisticas(),

            // Cliente
            'Mis Reservas': () => Estadisticas.renderHistorialCliente(user),

            // Acciones específicas
            'cancelarReserva': () => Estadisticas.cancelarReserva(...args),
            'borrarReserva': () => Logistica.borrarReserva(...args), // si lo usas en admin

            // Sesión
            'Cerrar Sesión': () => {
                Helpers.mostrarMensaje("Sesión cerrada", "success");
                localStorage.removeItem('sesion_activa');
                location.reload(); // recarga para volver al login
            }
        };

        const handler = acciones[accion];
        if (handler) {
            handler(...args);
        } else {
            console.warn(`[UI] Acción no encontrada: ${accion}`);
            Dashboard.renderDashboard(user); // fallback
        }
    },

    // Exposiciones directas de funciones específicas (para onclick/onchange)
    renderAgendaOperador: Agenda.renderAgendaOperador,
    filtrarAgendaLocal: Agenda.filtrarAgendaLocal,
    cambiarDiaAgenda: Agenda.cambiarDiaAgenda,

    renderLogisticaOperador: Logistica.renderLogisticaOperador,
    filtrarLogistica: Logistica.filtrarLogistica,
    cambiarEstadoReserva: Logistica.cambiarEstadoReserva,
    reproOperador: Logistica.reproOperador,
    borrarReserva: Logistica.borrarReserva,

    actualizarCotizacion: Reserva.actualizarCotizacion,
    filtrarHorasUI: Reserva.filtrarHorasUI,
    seleccionarHora: Reserva.seleccionarHora,

    filtrarUsuarios: Estadisticas.filtrarUsuarios,
    setFiltroRol: Estadisticas.setFiltroRol,
    eliminarUsuario: Estadisticas.eliminarUsuario,
    cancelarReserva: Estadisticas.cancelarReserva,   // ← clave para el botón del cliente

    cambiarMesMapa: Dashboard.cambiarMesMapa
};

// ─── EXPOSICIÓN PRINCIPAL ────────────────────────────────────────────────────
export const mostrarPanel = Core.mostrarPanel;

// Exposición temporal a window (para compatibilidad con onclick/onchange)
if (typeof window !== 'undefined') {
    window.UI = UI;
    console.log("[UI] Objeto UI cargado y expuesto correctamente");
}

// Log de inicialización
console.log("[UI] Módulos cargados y navegación central lista");