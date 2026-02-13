/**
 * STORAGE.JS - SISTEMA DE PERSISTENCIA HOTEL ELITE
 * Versión: Soporte Multi-Rol (Admin, Operador, Cliente) y Gestión Logística
 */

// 1. CONFIGURACIÓN DE USUARIOS MAESTROS
export const ADMIN_USER = {
    name: "Administrador Maestro",
    email: "admin@elite.com",
    password: "123",
    role: "admin"
};

// Usuario Operador por defecto para pruebas
export const OPERADOR_USER = {
    name: "Control Operativo",
    email: "operador@elite.com",
    password: "123",
    role: "operador"
};

// 2. OBTENCIÓN DE DATOS
export const getUsers = () => {
    const users = localStorage.getItem('hotel_users');
    // Si no hay usuarios, inicializamos con Admin y Operador
    return users ? JSON.parse(users) : [ADMIN_USER, OPERADOR_USER];
};

export const getReservas = () => {
    const reservas = localStorage.getItem('hotel_reservas');
    return reservas ? JSON.parse(reservas) : [];
};

export const getSesion = () => {
    const sesion = localStorage.getItem('sesion_activa');
    return sesion ? JSON.parse(sesion) : null;
};

// 3. SERVICIOS DE ALMACENAMIENTO (OBJETO MAESTRO)
export const StorageService = {
    
    // REGISTRO DE USUARIOS
    registrarUsuario: (usuario) => {
        const usuarios = getUsers();
        if (usuarios.find(u => u.email === usuario.email)) {
            return { success: false, error: "El correo electrónico ya está registrado." };
        }
        
        // Normalización de roles para consistencia en la base de datos
        if (usuario.role === 'cliente') usuario.role = 'client';
        
        usuarios.push(usuario);
        localStorage.setItem('hotel_users', JSON.stringify(usuarios));
        return { success: true };
    },

    // GUARDAR O ACTUALIZAR RESERVA (Soporta creación y edición)
    guardarReserva: (reserva) => {
        let reservas = getReservas();
        const index = reservas.findIndex(r => r.id == reserva.id);
        
        if (index !== -1) {
            reservas[index] = reserva;
        } else {
            reservas.push(reserva);
        }
        
        localStorage.setItem('hotel_reservas', JSON.stringify(reservas));
    },

    // ELIMINAR RESERVA (Mejorado para asegurar coincidencia de ID)
    eliminarReserva: (id) => {
        let reservas = getReservas();
        // Convertimos ambos a String para evitar errores si uno es número y el otro texto
        const nuevasReservas = reservas.filter(r => r.id.toString() !== id.toString());
        localStorage.setItem('hotel_reservas', JSON.stringify(nuevasReservas));
        return true; 
    },

    // --- NUEVAS FUNCIONES PARA EL OPERADOR ---

    // REPROGRAMAR FECHAS (Exclusivo Operador/Admin)
    reprogramarReserva: (id, nuevaIn, nuevaOut) => {
        let reservas = getReservas();
        const index = reservas.findIndex(r => r.id == id);
        
        if (index !== -1) {
            // Actualizamos solo el string de fechas manteniendo el resto intacto
            reservas[index].fechas = `${nuevaIn} a ${nuevaOut}`;
            localStorage.setItem('hotel_reservas', JSON.stringify(reservas));
            return { success: true };
        }
        return { success: false, error: "Reserva no encontrada" };
    },

    // ACTUALIZAR ESTADO RÁPIDO
    actualizarEstado: (id, nuevoEstado) => {
        let reservas = getReservas();
        const index = reservas.findIndex(r => r.id == id);
        if (index !== -1) {
            reservas[index].estado = nuevoEstado;
            localStorage.setItem('hotel_reservas', JSON.stringify(reservas));
            return true;
        }
        return false;
    }
};

// 4. MANTENIMIENTO DE DATOS
export const limpiarDatosDuplicados = () => {
    const usuarios = getUsers();
    const unicos = usuarios.filter((v, i, a) => a.findIndex(t => (t.email === v.email)) === i);
    localStorage.setItem('hotel_users', JSON.stringify(unicos));
};

/**
 * Inicializador: Asegura que los usuarios base existan en el sistema
 */
export const initStorage = () => {
    const usuarios = getUsers();
    let actualizados = false;

    if (!usuarios.find(u => u.email === ADMIN_USER.email)) {
        usuarios.push(ADMIN_USER);
        actualizados = true;
    }
    if (!usuarios.find(u => u.email === OPERADOR_USER.email)) {
        usuarios.push(OPERADOR_USER);
        actualizados = true;
    }

    if (actualizados) {
        localStorage.setItem('hotel_users', JSON.stringify(usuarios));
    }
};