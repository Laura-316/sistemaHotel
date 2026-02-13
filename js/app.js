/**
 * APP.JS - NÚCLEO INTEGRADO HOTEL ELITE
 * Control maestro de navegación, autenticación y gestión global
 */
import { 
    mostrarPanel, 
    renderDashboard, 
    renderFormReserva, 
    renderGestionReservas, 
    renderHistorialCliente, 
    renderEstadisticas,
    renderGestionUsuarios 
} from './ui.js';

import { 
    StorageService, 
    getUsers, 
    getSesion, 
    ADMIN_USER, 
    getReservas 
} from './storage.js';

document.addEventListener('DOMContentLoaded', () => {

    // 1. INICIALIZACIÓN DE DATOS (ADMIN MAESTRO)
    const init = () => {
        const usuarios = getUsers();
        if (!usuarios.find(u => u.email === ADMIN_USER.email)) {
            localStorage.setItem('hotel_users', JSON.stringify([...usuarios, ADMIN_USER]));
        }
    };
    init();

    // 2. ELEMENTOS DEL DOM PARA NAVEGACIÓN DE ACCESO
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const linkToReg = document.getElementById('go-to-register');
    const linkToLogin = document.getElementById('go-to-login');

    // 3. LÓGICA DE INTERCAMBIO DE FORMULARIOS (LOGIN/REGISTRO)
    if (linkToReg) {
        linkToReg.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            regForm.classList.remove('hidden');
        });
    }

    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            regForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // 4. MANEJO DE INICIO DE SESIÓN
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
            const passInput = document.getElementById('login-password').value.trim();
            const roleInput = document.getElementById('login-role').value;
            
            const usuarios = getUsers();
            
            const user = usuarios.find(u => 
                u.email.toLowerCase() === emailInput && 
                u.password === passInput && 
                (u.role === roleInput || (u.role === 'client' && roleInput === 'cliente'))
            );

            if (user) {
                if (user.role === 'client') user.role = 'cliente';
                localStorage.setItem('sesion_activa', JSON.stringify(user));
                mostrarPanel(user);
            } else {
                alert("Credenciales inválidas o el rol seleccionado no coincide.");
            }
        };
    }

    // 5. MANEJO DE REGISTRO
    if (regForm) {
        regForm.onsubmit = (e) => {
            e.preventDefault();
            const nuevoUsuario = {
                name: document.getElementById('reg-name').value.trim(),
                email: document.getElementById('reg-email').value.trim().toLowerCase(),
                password: document.getElementById('reg-password').value.trim(),
                role: document.getElementById('reg-role').value 
            };

            const resultado = StorageService.registrarUsuario(nuevoUsuario);
            if (resultado.success) {
                alert("Cuenta creada con éxito. Ya puede ingresar.");
                regForm.reset();
                if (linkToLogin) linkToLogin.click();
            } else {
                alert(resultado.error);
            }
        };
    }

    // 6. SWITCH MAESTRO DE NAVEGACIÓN
    window.ejecutarAccion = (accion) => {
        const user = getSesion();
        if (!user) return;

        switch (accion) {
            case 'Dashboard': renderDashboard(user); break;
            case 'Nueva Reserva': renderFormReserva(user); break;
            case 'Gestión Reservas': renderGestionReservas(); break;
            case 'Gestión Usuarios': renderGestionUsuarios(); break;
            case 'Mis Reservas': renderHistorialCliente(user); break;
            case 'Estadísticas': renderEstadisticas(); break;
            case 'Cerrar Sesión': 
                localStorage.removeItem('sesion_activa');
                location.reload(); 
                break;
        }
    };

    // 7. FUNCIONES GLOBALES DE ESTADO (BOTONES CANCELAR Y ELIMINAR)
    // Se asignan a window para que los botones con onclick="..." las encuentren
    window.cambiarEstadoReserva = (id, nuevoEstado) => {
        let db = getReservas();
        // Usamos == para comparar string con número
        db = db.map(r => r.id == id ? { ...r, estado: nuevoEstado } : r);
        localStorage.setItem('hotel_reservas', JSON.stringify(db));
        
        const user = getSesion();
        user.role === 'admin' ? renderGestionReservas() : renderHistorialCliente(user);
    };

    window.borrarRes = (id) => {
        console.log("Solicitud de borrado para ID:", id);
        if (confirm("¿Está seguro de que desea eliminar permanentemente esta reserva?")) {
            StorageService.eliminarReserva(id);
            
            const user = getSesion();
            // Refrescar la vista actual
            if (user.role === 'admin') {
                renderDashboard(user); // Refresca el panel maestro
            } else {
                renderHistorialCliente(user);
            }
        }
    };

    // 8. PERSISTENCIA DE LA SESIÓN
    const sesionIniciada = getSesion();
    if (sesionIniciada) {
        mostrarPanel(sesionIniciada);
    }
});