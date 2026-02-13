/**
 * LOGIC.JS - NÚCLEO DE NEGOCIO HOTEL ELITE (VERSIÓN 2026)
 * Gestión de 3 habitaciones y cálculos financieros de estancia.
 */

export const HotelLogic = {
    // 1. DEFINICIÓN DE HABITACIONES Y TARIFAS (3 CATEGORÍAS)
    habitaciones: {
        'Sencilla Elite': 120000,
        'Doble Luxury': 200000,
        'Suite Imperial': 450000
    },

    /**
     * Calcula la diferencia de días entre dos fechas.
     */
    calcularNoches(entrada, salida) {
        const f1 = new Date(entrada);
        const f2 = new Date(salida);
        
        if (isNaN(f1) || isNaN(f2) || f2 <= f1) return 1;

        const diferenciaMilisegundos = Math.abs(f2 - f1);
        const noches = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
        
        return noches;
    },

    /**
     * Procesa y estructura la reserva con los cálculos de precio.
     * ACTUALIZACIÓN: Ahora genera el array de fechas para el Mapa de Ocupación.
     */
    estructurarReserva(datos, user) {
        const precioNoche = this.habitaciones[datos.tipoTexto] || 0;
        const totalNoches = this.calcularNoches(datos.fechaIn, datos.fechaOut);
        const montoTotal = totalNoches * precioNoche;

        // --- NUEVA LÓGICA PARA EL MAPA DE OCUPACIÓN ---
        const fechasOcupadas = [];
        let fechaActual = new Date(datos.fechaIn + 'T12:00:00'); // Ajuste de zona horaria
        const fechaFin = new Date(datos.fechaOut + 'T12:00:00');

        while (fechaActual <= fechaFin) {
            fechasOcupadas.push(fechaActual.toISOString().split('T')[0]);
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        // ----------------------------------------------

        return {
            id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userEmail: user.email,
            userName: user.name,
            tipo: datos.tipoTexto,
            precioUnitario: precioNoche,
            noches: totalNoches,
            total: montoTotal,
            fechaIngreso: datos.fechaIn,
            fechaSalida: datos.fechaOut,
            // Guardamos el array para que el Mapa de Ocupación funcione:
            fechas: fechasOcupadas, 
            // Guardamos el string para que las tablas no se rompan:
            rangoTexto: `${datos.fechaIn} al ${datos.fechaOut}`, 
            hora: datos.hora,
            estado: 'pendiente',
            creadoEn: new Date().toISOString()
        };
    },

    filtrarPorEstado(reservas, estado) {
        if (estado === 'todos') return reservas;
        return reservas.filter(r => r.estado === estado);
    }
};