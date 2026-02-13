/**
 * MÓDULO DE LÓGICA DE NEGOCIO - HOTEL ELITE
 * Maneja cálculos, filtrado de reservas y procesamiento de datos.
 */

export const HotelLogic = {

    /**
     * Calcula el costo total de una estancia.
     * @param {string} fechaIn - Fecha de entrada (YYYY-MM-DD)
     * @param {string} fechaOut - Fecha de salida (YYYY-MM-DD)
     * @param {number} precioNoche - Precio según tipo de habitación
     */
    calcularTotal: (fechaIn, fechaOut, precioNoche) => {
        const d1 = new Date(fechaIn);
        const d2 = new Date(fechaOut);

        // Validaciones iniciales de fecha
        if (isNaN(d1) || isNaN(d2)) return { total: 0, noches: 0, error: null };
        
        if (d2 <= d1) {
            return { total: 0, noches: 0, error: "La salida debe ser después del ingreso" };
        }

        const diferenciaMs = d2 - d1;
        const noches = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
        const total = noches * precioNoche;

        return { 
            total, 
            noches, 
            totalTexto: `Total: $${total.toLocaleString()} COP (${noches} noches)`,
            error: null 
        };
    },

    /**
     * Filtra la base de datos de reservas según texto y estado.
     */
    filtrarReservas: (reservas, query = "", status = "todos") => {
        const q = query.toLowerCase();
        return reservas.filter(r => {
            const coincideTexto = r.userName.toLowerCase().includes(q) || 
                                 r.tipo.toLowerCase().includes(q);
            const coincideEstado = (status === "todos") || (r.estado === status);
            return coincideTexto && coincideEstado;
        });
    },

    /**
     * Procesa las estadísticas financieras y de ocupación.
     */
    obtenerEstadisticas: (reservas) => {
        const ingresosBrutos = reservas.reduce((acc, r) => {
            // Limpieza de caracteres no numéricos para el cálculo
            const valorNumerico = parseInt(r.total.replace(/\D/g, '')) || 0;
            return acc + valorNumerico;
        }, 0);

        return {
            ingresosBrutos,
            totalReservas: reservas.length,
            confirmadas: reservas.filter(r => r.estado === 'confirmada').length
        };
    },

    /**
     * Valida y formatea el objeto de reserva antes de guardarlo.
     */
    estructurarReserva: (formData, user, esEdicion, reservaPrevia = null) => {
        return {
            id: esEdicion ? reservaPrevia.id : Date.now(),
            userEmail: esEdicion ? reservaPrevia.userEmail : user.email,
            userName: esEdicion ? reservaPrevia.userName : user.name,
            tipo: formData.tipoTexto,
            fechas: `${formData.fechaIn} a ${formData.fechaOut}`,
            hora: formData.hora,
            total: formData.totalTexto,
            estado: esEdicion ? reservaPrevia.estado : "pendiente"
        };
    }
};