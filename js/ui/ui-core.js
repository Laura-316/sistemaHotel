// ui-core.js
// =============================================================================
// Núcleo de la interfaz - Elementos DOM, control de sesión y menú principal
// =============================================================================

import { getReservas, getUsers, StorageService } from '../storage.js';
import { HotelLogic } from '../logic.js';

// ─── ELEMENTOS DEL DOM (constantes globales de la aplicación) ───────────────
export const mainContent   = document.getElementById('main-content');
export const authContainer = document.getElementById('auth-container');
export const appContainer  = document.getElementById('app-container');

// ─── CONTROL DE SESIÓN Y MENÚ ────────────────────────────────────────────────
export const mostrarPanel = (user) => {
    if (!authContainer || !appContainer) {
        console.error("No se encontraron contenedores de autenticación/app");
        return;
    }

    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    const badge = document.getElementById('user-badge');
    if (badge) {
        badge.innerText = `${user.name} (${user.role})`;
    }

    cargarMenu(user);
    // renderDashboard se llamará desde ui.js o desde el módulo correspondiente
    // NO lo llamamos directamente aquí para mantener la separación
};

/**
 * Genera el menú lateral según el rol del usuario
 * @param {Object} user - Objeto usuario con name y role
 */
export const cargarMenu = (user) => {
    const menu = document.getElementById('menu-items');
    if (!menu) return;

    const rol = user.role.toLowerCase();
    let opciones = ['Dashboard'];

    if (rol === 'admin') {
        opciones.push('Gestión Reservas', 'Gestión Usuarios', 'Estadísticas');
    } else if (rol === 'operador' || rol === 'operator') {
        opciones.push('Agenda Diaria', 'Logística de Reservas', 'Nueva Reserva');
    } else {
        // cliente por defecto
        opciones.push('Nueva Reserva', 'Mis Reservas');
    }

    opciones.push('Cerrar Sesión');

    menu.innerHTML = opciones
        .map(opt => `
            <a href="javascript:void(0)" 
               class="nav-link" 
               onclick="UI.ejecutarAccion('${opt}')">
                ${opt}
            </a>
        `)
        .join('');
};

// ─── OBJETO FACADE PARA ACCIONES (recomendado en vez de window.xxx) ──────────
export const UI = {
    // Se asignará desde ui.js después de importar todos los módulos
    ejecutarAccion: null,

    // Puedes ir agregando helpers comunes aquí si los necesitas globalmente
    getUserActivo: () => {
        try {
            return JSON.parse(localStorage.getItem('sesion_activa'));
        } catch {
            return null;
        }
    },

    cerrarSesion: () => {
        localStorage.removeItem('sesion_activa');
        location.reload();
    },

    // Placeholder para mostrar mensajes (puedes mejorarlo después)
    mostrarMensaje: (texto, tipo = 'info') => {
        const colores = {
            success: '#2ecc71',
            error:   '#e74c3c',
            info:    '#3498db',
            warning: '#f1c40f'
        };
        alert(texto); // → reemplazar por toast / modal más adelante
    }
};

// ─── Inicialización mínima (ejecutar una sola vez al cargar) ─────────────────
if (typeof window !== 'undefined') {
    // Exposición mínima para compatibilidad con onclick antiguos
    // Idealmente deberías quitar esto cuando migres todo a UI.ejecutarAccion
    window.UI = UI;
}

// Exportaciones principales para ser usadas desde ui.js (barril)
export default {
    mainContent,
    authContainer,
    appContainer,
    mostrarPanel,
    cargarMenu,
    UI
};