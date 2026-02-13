/**
 * MÓDULO DE INTERFAZ DE USUARIO (UI) - HOTEL ELITE
 * Versión: Control Maestro con Filtros de Selección para Admin
 */

import { getReservas, getUsers, StorageService } from './storage.js';
import { HotelLogic } from './logic.js';

const mainContent = document.getElementById('main-content');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');

/**
 * 1. NAVEGACIÓN Y ACCESO
 */
export const mostrarPanel = (user) => {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    document.getElementById('user-badge').innerText = `${user.name} (${user.role})`;
    cargarMenu(user);
    renderDashboard(user);
};

export const cargarMenu = (user) => {
    const menu = document.getElementById('menu-items');
    let opciones = ['Dashboard', 'Nueva Reserva'];
    
    if (user.role === 'admin') {
        opciones.push('Gestión Reservas', 'Gestión Usuarios', 'Estadísticas');
    } else {
        opciones.push('Mis Reservas');
    }
    opciones.push('Cerrar Sesión');

    menu.innerHTML = opciones.map(opt => `
        <a href="#" class="nav-link" onclick="window.ejecutarAccion('${opt}')">${opt}</a>
    `).join('');
};

/**
 * 2. DASHBOARDS (ADMIN vs CLIENTE)
 */
export const renderDashboard = (u) => {
    u.role === 'admin' ? renderDashboardAdmin(u) : renderDashboardCliente(u);
};

const renderDashboardAdmin = (u) => {
    const reservas = getReservas();
    const ingresos = reservas
        .filter(r => r.estado === 'confirmada')
        .reduce((acc, r) => acc + parseInt(r.total.replace(/[^0-9]/g, '') || 0), 0);

    mainContent.innerHTML = `
        <h1 class="serif-title">Panel Maestro</h1>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top:20px;">
            <div class="stat-card" style="border-left: 4px solid var(--primary-gold);">
                <small>INGRESOS CONFIRMADOS</small>
                <h3 style="color:var(--primary-gold)">$${ingresos.toLocaleString()}</h3>
            </div>
            <div class="stat-card" style="border-left: 4px solid #f1c40f;">
                <small>PENDIENTES</small>
                <h3>${reservas.filter(r => r.estado === 'pendiente').length} Por revisar</h3>
            </div>
        </div>
        <div style="margin-top:40px">
            <h3 class="serif-title" style="font-size: 1.2rem;">Últimos Movimientos</h3>
            ${pintarTabla(reservas.slice(-5).reverse(), true)}
        </div>
    `;
};

const renderDashboardCliente = (u) => {
    const reservas = getReservas().filter(r => r.userEmail === u.email);
    const activa = reservas.find(r => r.estado !== 'cancelada');

    mainContent.innerHTML = `
        <h1 class="serif-title">Bienvenido, ${u.name.split(' ')[0]}</h1>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 30px;">
            <div class="stat-card">
                <h4 style="color: var(--primary-gold);">Su Próxima Estancia</h4>
                ${activa ? `
                    <p><b>${activa.tipo}</b></p>
                    <p><small>Check-in: ${activa.fechas.split(' a ')[0]}</small></p>
                    <span class="badge ${activa.estado}">${activa.estado}</span>
                ` : `<p>No tiene reservas activas actualmente.</p>`}
            </div>
            <div class="stat-card" style="cursor:pointer" onclick="window.ejecutarAccion('Mis Reservas')">
                <h4>Mi Actividad</h4>
                <p>Consulte su historial o cancele servicios.</p>
                <span style="font-size: 1.5rem;">📅 Historial</span>
            </div>
        </div>
    `;
};

/**
 * 3. GESTIÓN DE RESERVAS (ADMIN)
 */
export const renderGestionReservas = () => {
    const db = getReservas();
    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 class="serif-title">Gestión de Reservas</h2>
            <div style="display: flex; gap: 10px;">
                <button class="filter-btn active" onclick="UIUtils.filtrarPorEstado('todas', this)">Todas</button>
                <button class="filter-btn" onclick="UIUtils.filtrarPorEstado('pendiente', this)">Pendientes</button>
                <button class="filter-btn" onclick="UIUtils.filtrarPorEstado('confirmada', this)">Confirmadas</button>
            </div>
        </div>
        <input type="text" id="res-search" placeholder="Buscar por huésped..." 
            style="width: 100%; padding: 15px; background: #000; color: #fff; border: 1px solid #444; border-radius: 8px; margin-bottom: 20px;"
            onkeyup="UIUtils.aplicarFiltros()">
        <div id="res-table-results">${pintarTabla(db, true)}</div>
    `;
};

/**
 * 4. GESTIÓN DE USUARIOS (ADMIN - FILTRADO)
 */
export const renderGestionUsuarios = () => {
    const usuarios = getUsers().filter(u => u.role !== 'admin');
    
    mainContent.innerHTML = `
        <h2 class="serif-title">Control de Usuarios</h2>
        <p style="margin-bottom: 20px; color: #888;">Gestión de accesos para Operadores y Clientes.</p>
        
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th style="text-align:right">Acción</th>
                </tr>
            </thead>
            <tbody>
                ${usuarios.length > 0 ? usuarios.map(u => `
                    <tr>
                        <td>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="width:30px; height:30px; background:var(--primary-gold); border-radius:50%; color:#000; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px;">
                                    ${u.name.charAt(0)}
                                </div>
                                <strong>${u.name}</strong>
                            </div>
                        </td>
                        <td>${u.email}</td>
                        <td><span class="badge ${u.role}">${u.role.toUpperCase()}</span></td>
                        <td style="text-align:right">
                            <button class="btn-delete" onclick="window.eliminarUsuario('${u.email}')">Dar de Baja</button>
                        </td>
                    </tr>
                `).join('') : `<tr><td colspan="4" style="text-align:center; padding:30px;">No hay otros usuarios registrados.</td></tr>`}
            </tbody>
        </table>
    `;
};

/**
 * 5. PINTAR TABLA (RESERVAS CON SELECT DE ESTADO PARA ADMIN)
 */
export const pintarTabla = (data, esAdmin = false) => {
    if (data.length === 0) return "<p style='padding:40px; color:#666; text-align:center;'>Sin registros.</p>";

    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Ingreso / Salida</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(r => `
                    <tr>
                        <td><strong>${r.userName}</strong></td>
                        <td>${r.tipo}</td>
                        <td><small>${r.fechas}</small></td>
                        <td>
                            ${esAdmin ? `
                                <select class="status-select status-${r.estado}" 
                                        style="background: #111; color: #fff; border: 1px solid #444; padding: 5px; border-radius: 4px; cursor: pointer;"
                                        onchange="window.cambiarEstadoReserva('${r.id}', this.value)">
                                    <option value="pendiente" ${r.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                                    <option value="confirmada" ${r.estado === 'confirmada' ? 'selected' : ''}>✅ Confirmada</option>
                                    <option value="cancelada" ${r.estado === 'cancelada' ? 'selected' : ''}>❌ Cancelada</option>
                                </select>` 
                            : `<span class="badge ${r.estado}">${r.estado}</span>`}
                        </td>
                        <td>
                            ${(!esAdmin && r.estado !== 'cancelada') ? 
                                `<button class="btn-delete" style="border: 1px solid #e67e22; color: #e67e22;" onclick="window.cambiarEstadoReserva('${r.id}', 'cancelada')">Cancelar</button>` : 
                                `<button class="btn-delete" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" onclick="window.borrarRes('${r.id}')">Eliminar</button>`
                            }
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
};

/**
 * 6. ESTADÍSTICAS
 */
export const renderEstadisticas = () => {
    const res = getReservas();
    const total = res.length || 1;
    const ingresosConf = res.filter(r => r.estado === 'confirmada').reduce((acc, r) => acc + parseInt(r.total.replace(/[^0-9]/g, '') || 0), 0);

    mainContent.innerHTML = `
        <h2 class="serif-title">Análisis de Operaciones</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div class="stat-card"><h3>$${ingresosConf.toLocaleString()}</h3><small>Caja Confirmada</small></div>
            <div class="stat-card"><h3>${res.filter(r => r.estado === 'pendiente').length}</h3><small>Esperando Confirmación</small></div>
            <div class="stat-card"><h3>${total}</h3><small>Reservas Totales</small></div>
        </div>
    `;
};

/**
 * 7. FORMULARIO DE RESERVA
 */
export const renderFormReserva = (user, reservaExistente = null) => {
    const esEdicion = !!reservaExistente;
    let horas = "";
    for(let i=8; i<=20; i++) {
        let h = i > 12 ? `${i-12}:00 PM` : `${i}:00 AM`;
        horas += `<option value="${h}">${h}</option>`;
    }

    mainContent.innerHTML = `
        <h2 class="serif-title">${esEdicion ? 'Editar' : 'Nueva'} Reserva</h2>
        <form id="res-form" class="auth-card" style="max-width:500px">
            <div class="input-group">
                <label>Habitación Premium</label>
                <select id="h-tipo">
                    <option value="120000">Sencilla Elite ($120.000)</option>
                    <option value="200000">Doble Luxury ($200.000)</option>
                    <option value="500000">Suite Imperial ($500.000)</option>
                </select>
            </div>
            <div style="display:flex; gap:10px;">
                <div class="input-group" style="flex:1"><label>Ingreso</label><input type="date" id="h-in" required></div>
                <div class="input-group" style="flex:1"><label>Salida</label><input type="date" id="h-out" required></div>
            </div>
            <div class="input-group">
                <label>Hora de Llegada</label>
                <select id="h-hora">${horas}</select>
            </div>
            <div id="h-total" style="font-weight:bold; color:var(--primary-gold); margin:20px 0; text-align:center; font-size:1.3rem;">Total: $0 COP</div>
            <button type="submit" class="btn-primary" style="width:100%;">Confirmar Reserva</button>
        </form>
    `;

    const form = document.getElementById('res-form');
    form.onchange = () => {
        const res = HotelLogic.calcularTotal(document.getElementById('h-in').value, document.getElementById('h-out').value, parseInt(document.getElementById('h-tipo').value));
        document.getElementById('h-total').innerText = res.error || res.totalTexto;
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const total = document.getElementById('h-total').innerText;
        if(total.includes("Error")) return alert(total);
        StorageService.guardarReserva(HotelLogic.estructurarReserva({
            tipoTexto: document.getElementById('h-tipo').selectedOptions[0].text,
            fechaIn: document.getElementById('h-in').value,
            fechaOut: document.getElementById('h-out').value,
            hora: document.getElementById('h-hora').value,
            totalTexto: total
        }, user, esEdicion, reservaExistente));
        alert("Reserva procesada con éxito."); 
        renderDashboard(user);
    };
};

export const renderHistorialCliente = (user) => {
    const db = getReservas().filter(r => r.userEmail === user.email);
    mainContent.innerHTML = `<h2 class="serif-title">Mi Historial</h2>${pintarTabla(db, false)}`;
};

/**
 * 8. FUNCIONES DE VENTANA (WINDOW)
 */
window.eliminarUsuario = (email) => {
    if(confirm(`¿Desea eliminar permanentemente al usuario: ${email}?`)) {
        const usuariosActuales = getUsers().filter(u => u.email !== email);
        localStorage.setItem('hotel_users', JSON.stringify(usuariosActuales));
        renderGestionUsuarios();
    }
};

export const UIUtils = {
    filtrosActivos: { texto: "", estado: "todas" },
    aplicarFiltros: () => {
        UIUtils.filtrosActivos.texto = document.getElementById('res-search').value.toLowerCase();
        UIUtils.procesarRenderizado();
    },
    filtrarPorEstado: (estado, btn) => {
        btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UIUtils.filtrosActivos.estado = estado;
        UIUtils.procesarRenderizado();
    },
    procesarRenderizado: () => {
        let datos = getReservas();
        if (UIUtils.filtrosActivos.texto) datos = datos.filter(r => r.userName.toLowerCase().includes(UIUtils.filtrosActivos.texto));
        if (UIUtils.filtrosActivos.estado !== 'todas') datos = datos.filter(r => r.estado === UIUtils.filtrosActivos.estado);
        document.getElementById('res-table-results').innerHTML = pintarTabla(datos, true);
    }
};

window.UIUtils = UIUtils;