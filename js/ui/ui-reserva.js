// ui-reserva.js
// =============================================================================
// Vista y lógica del formulario "Nueva Reserva"
// Incluye: selección de habitación, fechas, hora, cotizador dinámico
// =============================================================================

import { mainContent } from './ui-core.js';
import { StorageService } from '../storage.js';
import { HotelLogic } from '../logic.js';

// ─── RENDER PRINCIPAL DEL FORMULARIO DE NUEVA RESERVA ─────────────────────────
export const renderFormReserva = (user) => {
    if (!mainContent) return;

    mainContent.innerHTML = `
        <h2 class="serif-title">Nueva Reserva</h2>
        <form id="res-form" class="auth-card" style="max-width:600px; animation: fadeIn 0.4s ease;">
            <div class="input-group">
                <label>Seleccione su Habitación</label>
                <select id="h-tipo" onchange="UI.actualizarCotizacion()">
                    <option value="120000">Sencilla Elite - $120.000 / noche</option>
                    <option value="200000">Doble Luxury - $200.000 / noche</option>
                    <option value="450000">Suite Imperial - $450.000 / noche</option>
                </select>
            </div>

            <div style="display:flex; gap:15px;">
                <div class="input-group" style="flex:1">
                    <label>Fecha de Ingreso</label>
                    <input type="date" id="h-in" required onchange="UI.actualizarCotizacion()">
                </div>
                <div class="input-group" style="flex:1">
                    <label>Fecha de Salida</label>
                    <input type="date" id="h-out" required onchange="UI.actualizarCotizacion()">
                </div>
            </div>

            <div class="input-group">
                <label>Hora de Llegada (Seleccione Franja)</label>
                <div class="time-picker-container" style="background:#0a0a0a; padding:15px; border-radius:10px; border:1px solid #222;">
                    <div class="time-tabs" style="display:flex; gap:10px; margin-bottom:15px;">
                        <span class="tab-btn active" style="cursor:pointer; padding:5px 10px; border:1px solid #d4af37; border-radius:5px;" 
                              onclick="UI.filtrarHorasUI('tarde')">Tarde</span>
                        <span class="tab-btn" style="cursor:pointer; padding:5px 10px; border:1px solid #333; border-radius:5px;" 
                              onclick="UI.filtrarHorasUI('mañana')">Mañana</span>
                        <span class="tab-btn" style="cursor:pointer; padding:5px 10px; border:1px solid #333; border-radius:5px;" 
                              onclick="UI.filtrarHorasUI('noche')">Noche</span>
                    </div>
                    <div id="hora-grid-dinamico" class="time-selector-container" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;">
                        <!-- Se llena dinámicamente -->
                    </div>
                </div>
                <input type="hidden" id="h-hora-val" value="14:00">
            </div>

            <div id="cotizacion-resumen" class="price-quote-card" style="background:#111; padding:20px; border-radius:10px; border:1px solid #d4af3733; margin-top:20px;">
                <p style="margin-bottom:10px; font-size:0.8rem; color:#d4af37; text-transform:uppercase; font-weight:bold;">Comparativa y Desglose:</p>
                <div id="lista-precios-habitaciones"></div>
                <hr style="border:0; border-top:1px dashed #333; margin:10px 0;">
                <div class="price-item total" style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold;">TOTAL SELECCIONADO:</span>
                    <span id="txt-total" style="color:#d4af37; font-size:1.4rem; font-weight:bold;">$0</span>
                </div>
                <small id="txt-detalles" style="color:#666; display:block; text-align:right; margin-top:5px;"></small>
            </div>

            <button type="submit" class="btn-primary" style="width:100%; margin-top:20px;">Confirmar Registro</button>
        </form>`;

    // Inicialización después de renderizar
    setTimeout(() => {
        UI.filtrarHorasUI('tarde');       // pestaña tarde por defecto
        UI.actualizarCotizacion();         // cotización inicial
    }, 50);

    // Manejo del submit
    const form = document.getElementById('res-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            const tipoSelect = document.getElementById('h-tipo');
            const inDate     = document.getElementById('h-in').value;
            const outDate    = document.getElementById('h-out').value;
            const hora       = document.getElementById('h-hora-val').value;
            const totalStr   = document.getElementById('txt-total').innerText;

            if (!inDate || !outDate) {
                alert("Por favor complete las fechas de ingreso y salida");
                return;
            }

            const total = parseInt(totalStr.replace(/[^0-9]/g, '')) || 0;

            const datos = {
                tipoTexto: tipoSelect.selectedOptions[0].text.split(' - ')[0],
                fechaIn: inDate,
                fechaOut: outDate,
                hora: hora,
                total: total
            };

            const reserva = HotelLogic.estructurarReserva(datos, user);
            StorageService.guardarReserva(reserva);

            alert("¡Reserva confirmada exitosamente!");
            
            // Volver al dashboard
            import('../ui.js').then(m => {
                m.UI.ejecutarAccion('Dashboard');
            });
        };
    }
};

// ─── ACTUALIZACIÓN DINÁMICA DE LA COTIZACIÓN ─────────────────────────────────
export const actualizarCotizacion = () => {
    const select      = document.getElementById('h-tipo');
    const txtTotal    = document.getElementById('txt-total');
    const txtDetalles = document.getElementById('txt-detalles');
    const lista       = document.getElementById('lista-precios-habitaciones');

    if (!select || !txtTotal || !lista) return;

    const precioSel = parseInt(select.value) || 0;
    const inVal     = document.getElementById('h-in')?.value;
    const outVal    = document.getElementById('h-out')?.value;

    const preciosBase = {
        "Sencilla": 120000,
        "Doble":    200000,
        "Suite":    450000
    };

    if (inVal && outVal) {
        const f1 = new Date(inVal);
        const f2 = new Date(outVal);

        if (f2 > f1) {
            const noches = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24));
            const total  = noches * precioSel;

            lista.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                    <span>Sencilla Elite (${noches} n):</span> <strong>$${(preciosBase.Sencilla * noches).toLocaleString()}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                    <span>Doble Luxury (${noches} n):</span> <strong>$${(preciosBase.Doble * noches).toLocaleString()}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                    <span>Suite Imperial (${noches} n):</span> <strong>$${(preciosBase.Suite * noches).toLocaleString()}</strong>
                </div>
            `;

            txtTotal.innerText = `$${total.toLocaleString()}`;
            txtDetalles.innerText = `Cálculo basado en ${noches} noche(s)`;
        } else {
            lista.innerHTML = `<p style="color:#e74c3c; font-size:0.75rem;">La fecha de salida debe ser posterior a la de ingreso.</p>`;
            txtTotal.innerText = "$0";
            txtDetalles.innerText = "";
        }
    } else {
        lista.innerHTML = `<p style="color:#444; font-size:0.75rem;">Ingrese fechas para ver el desglose por tipo de habitación.</p>`;
        txtTotal.innerText = "$0";
        txtDetalles.innerText = "Seleccione fechas válidas";
    }
};

// ─── FILTRO Y RENDER DE HORAS SEGÚN FRANJA ───────────────────────────────────
export const filtrarHorasUI = (franja) => {
    const grid = document.getElementById('hora-grid-dinamico');
    if (!grid) return;

    const horas = {
        'mañana': ['08:00', '09:00', '10:00', '11:00'],
        'tarde':  ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        'noche':  ['18:00', '19:00', '20:00', '21:00', '22:00']
    };

    // Actualizar estilos de pestañas
    document.querySelectorAll('.time-tabs .tab-btn').forEach(btn => {
        const esActiva = btn.innerText.trim().toLowerCase() === franja.toLowerCase();
        btn.classList.toggle('active', esActiva);
        btn.style.borderColor = esActiva ? '#d4af37' : '#333';
    });

    const valorActual = document.getElementById('h-hora-val')?.value || '14:00';

    grid.innerHTML = (horas[franja] || []).map(h => `
        <div class="time-chip ${h === valorActual ? 'selected' : ''}" 
             style="padding:8px; border:1px solid #333; text-align:center; border-radius:5px; cursor:pointer; 
                    background:${h === valorActual ? '#d4af37' : 'transparent'}; 
                    color:${h === valorActual ? '#000' : '#fff'}"
             onclick="UI.seleccionarHora('${h}')">
            ${h}
        </div>
    `).join('');
};

// ─── SELECCIÓN DE UNA HORA ESPECÍFICA ────────────────────────────────────────
export const seleccionarHora = (hora) => {
    document.querySelectorAll('.time-chip').forEach(chip => {
        chip.classList.remove('selected');
        chip.style.background = 'transparent';
        chip.style.color = '#fff';
    });

    const chipSeleccionado = [...document.querySelectorAll('.time-chip')].find(c => c.innerText.trim() === hora);
    if (chipSeleccionado) {
        chipSeleccionado.classList.add('selected');
        chipSeleccionado.style.background = '#d4af37';
        chipSeleccionado.style.color = '#000';
    }

    const hiddenInput = document.getElementById('h-hora-val');
    if (hiddenInput) hiddenInput.value = hora;
};

// ─── EXPORTACIONES FINALES ───────────────────────────────────────────────────
// renderFormReserva, actualizarCotizacion, filtrarHorasUI y seleccionarHora
// YA están exportados arriba con export const → NO repetir export { ... }

// Si necesitas exportar algo adicional en el futuro, agrégalo aquí.
// Por ahora: vacío