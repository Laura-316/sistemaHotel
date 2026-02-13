/**
 * STORAGE.JS - SISTEMA DE PERSISTENCIA HOTEL ELITE
 * Gestión de usuarios y reservas en LocalStorage
 */

// 1. CONFIGURACIÓN INICIAL DEL ADMINISTRADOR
export const ADMIN_USER = {
    name: "Administrador Maestro",
    email: "admin@elite.com",
    password: "123",
    role: "admin"
};

// 2. OBTENCIÓN DE DATOS
export const getUsers = () => {
    const users = localStorage.getItem('hotel_users');
    return users ? JSON.parse(users) : [ADMIN_USER];
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
        
        // Normalización del rol para evitar errores de "client/cliente"
        if (usuario.role === 'cliente') usuario.role = 'client';
        
        usuarios.push(usuario);
        localStorage.setItem('hotel_users', JSON.stringify(usuarios));
        return { success: true };
    },

    // GUARDAR O ACTUALIZAR RESERVA
    guardarReserva: (reserva) => {
        let reservas = getReservas();
        
        // Si la reserva ya existe (edición), la actualizamos; si no, la agregamos
        const index = reservas.findIndex(r => r.id == reserva.id);
        
        if (index !== -1) {
            reservas[index] = reserva;
        } else {
            reservas.push(reserva);
        }
        
        localStorage.setItem('hotel_reservas', JSON.stringify(reservas));
    },

    // ELIMINAR RESERVA (CORREGIDO PARA TU ERROR)
    eliminarReserva: (id) => {
        // 1. Obtenemos las reservas actuales
        let reservas = getReservas();
        
        // 2. Filtramos usando != (no estricto) para capturar IDs en String o Number
        const nuevasReservas = reservas.filter(r => r.id != id);
        
        // 3. Verificamos si realmente se eliminó algo para evitar renderizados innecesarios
        if (reservas.length === nuevasReservas.length) {
            console.warn("No se encontró ninguna reserva con el ID:", id);
        }
        
        // 4. Guardamos la lista actualizada
        localStorage.setItem('hotel_reservas', JSON.stringify(nuevasReservas));
    }
};

// 4. LIMPIEZA AUTOMÁTICA (Mantenimiento)
export const limpiarDatosDuplicados = () => {
    const usuarios = getUsers();
    const unicos = usuarios.filter((v, i, a) => a.findIndex(t => (t.email === v.email)) === i);
    localStorage.setItem('hotel_users', JSON.stringify(unicos));
};