document.addEventListener('DOMContentLoaded', () => {
    // REFERENCIAS
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // DATOS MAESTROS
    const ADMIN_USER = { email: "admin@elite.com", password: "123", role: "admin", name: "Administrador" };

    // 1. PERSISTENCIA
    const sesionActiva = JSON.parse(localStorage.getItem('sesion_activa'));
    if (sesionActiva) mostrarPanel(sesionActiva);

    // 2. NAVEGACIÓN LOGIN/REGISTRO
    document.getElementById('go-to-register').onclick = () => { loginForm.classList.add('hidden'); registerForm.classList.remove('hidden'); };
    document.getElementById('go-to-login').onclick = () => { registerForm.classList.add('hidden'); loginForm.classList.remove('hidden'); };

    // 3. REGISTRO
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const newUser = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value 
        };
        const users = JSON.parse(localStorage.getItem('hotel_users')) || [];
        if (users.find(u => u.email === newUser.email)) return alert("El correo ya existe.");
        users.push(newUser);
        localStorage.setItem('hotel_users', JSON.stringify(users));
        alert("¡Registro exitoso!");
        location.reload();
    };

    // 4. LOGIN
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        const users = JSON.parse(localStorage.getItem('hotel_users')) || [];
        let user = (email === ADMIN_USER.email && pass === ADMIN_USER.password && role === ADMIN_USER.role) 
                   ? ADMIN_USER : users.find(u => u.email === email && u.password === pass && u.role === role);

        if (user) {
            localStorage.setItem('sesion_activa', JSON.stringify(user));
            mostrarPanel(user);
        } else alert("Datos incorrectos.");
    };

    // 5. PANEL DE CONTROL
    function mostrarPanel(user) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        document.getElementById('user-badge').innerText = `${user.name} (${user.role})`;
        
        cargarMenu(user);
        renderDashboard(user);
    }

    function cargarMenu(user) {
        const menu = document.getElementById('menu-items');
        let opciones = ['Dashboard', 'Nueva Reserva'];
        
        if (user.role === 'admin') {
            opciones.push('Gestionar Reservas', 'Gestión Usuarios', 'Estadísticas');
        } else {
            opciones.push('Mis Reservas');
        }
        opciones.push('Cerrar Sesión');

        menu.innerHTML = opciones.map(opt => `<a href="#" class="nav-link" onclick="ejecutarAccion('${opt}')">${opt}</a>`).join('');
    }

    window.ejecutarAccion = (accion) => {
        const user = JSON.parse(localStorage.getItem('sesion_activa'));
        if (accion === 'Dashboard') renderDashboard(user);
        if (accion === 'Nueva Reserva') renderFormReserva(user);
        if (accion === 'Mis Reservas') renderHistorial(user, true);
        if (accion === 'Gestionar Reservas') renderHistorial(user, false);
        if (accion === 'Gestión Usuarios') renderUsuarios();
        if (accion === 'Estadísticas') renderEstadisticas();
        if (accion === 'Cerrar Sesión') { localStorage.removeItem('sesion_activa'); location.reload(); }
    };

    // 6. MÓDULO RESERVAS (CÁLCULO COP)
    function renderFormReserva(user) {
        mainContent.innerHTML = `
            <h2 class="serif-title">Crear Reserva</h2>
            <form id="res-form" class="auth-card" style="max-width:500px">
                <label>Habitación</label>
                <select id="h-tipo" class="input-group">
                    <option value="120000">Sencilla Elite ($120.000)</option>
                    <option value="200000">Doble Luxury ($200.000)</option>
                    <option value="500000">Suite Imperial ($500.000)</option>
                </select>
                <label>Ingreso / Salida</label>
                <input type="date" id="h-in" required>
                <input type="date" id="h-out" required>
                <div id="h-total" style="margin:15px 0; font-weight:bold; color:#c5a059">Total: $0 COP</div>
                <button type="submit" class="btn-primary">Confirmar</button>
            </form>`;

        const calc = () => {
            const d1 = new Date(document.getElementById('h-in').value);
            const d2 = new Date(document.getElementById('h-out').value);
            if (d2 > d1) {
                const noches = (d2 - d1) / (864e5);
                const total = noches * document.getElementById('h-tipo').value;
                document.getElementById('h-total').innerText = `Total: $${total.toLocaleString('es-CO')} COP (${noches} noches)`;
            }
        };
        document.getElementById('res-form').onchange = calc;
        document.getElementById('res-form').onsubmit = (e) => {
            e.preventDefault();
            const db = JSON.parse(localStorage.getItem('hotel_reservas')) || [];
            db.push({
                id: Date.now(),
                userEmail: user.email,
                userName: user.name,
                tipo: document.getElementById('h-tipo').selectedOptions[0].text,
                fechas: `${document.getElementById('h-in').value} a ${document.getElementById('h-out').value}`,
                total: document.getElementById('h-total').innerText
            });
            localStorage.setItem('hotel_reservas', JSON.stringify(db));
            alert("Reserva creada.");
            ejecutarAccion(user.role === 'admin' ? 'Gestionar Reservas' : 'Mis Reservas');
        };
    }

    // 7. HISTORIAL Y FILTRO
    function renderHistorial(user, isClient) {
        let db = JSON.parse(localStorage.getItem('hotel_reservas')) || [];
        if (isClient) db = db.filter(r => r.userEmail === user.email);

        mainContent.innerHTML = `
            <h2 class="serif-title">Reservas</h2>
            <input type="text" id="filtro" placeholder="Buscar por nombre o habitación..." style="width:100%; padding:10px; margin-bottom:10px; background:#1e1e1e; border:1px solid #333; color:white;">
            <div id="tabla-res">${pintarTabla(db)}</div>`;

        document.getElementById('filtro').oninput = (e) => {
            const f = e.target.value.toLowerCase();
            const filt = db.filter(r => r.userName.toLowerCase().includes(f) || r.tipo.toLowerCase().includes(f));
            document.getElementById('tabla-res').innerHTML = pintarTabla(filt);
        };
    }

    function pintarTabla(data) {
        return `<table class="admin-table">
            <thead><tr><th>Cliente</th><th>Habitación</th><th>Fechas</th><th>Total</th><th>Acción</th></tr></thead>
            <tbody>${data.map(r => `<tr><td>${r.userName}</td><td>${r.tipo}</td><td>${r.fechas}</td><td>${r.total}</td><td><button class="btn-delete" onclick="borrarRes(${r.id})">Anular</button></td></tr>`).join('')}</tbody>
        </table>`;
    }

    window.borrarRes = (id) => {
        let db = JSON.parse(localStorage.getItem('hotel_reservas'));
        localStorage.setItem('hotel_reservas', JSON.stringify(db.filter(r => r.id !== id)));
        ejecutarAccion('Gestionar Reservas');
    };

    // 8. GESTIÓN DE USUARIOS (BOTÓN EDITAR)
    function renderUsuarios() {
        const users = JSON.parse(localStorage.getItem('hotel_users')) || [];
        mainContent.innerHTML = `
            <h2 class="serif-title">Usuarios</h2>
            <table class="admin-table">
                <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
                <tbody>${users.map(u => `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.role}</td>
                        <td>
                            <button class="btn-primary" style="width:auto; padding:5px 10px" onclick="editarUser('${u.email}')">Editar</button>
                            <button class="btn-delete" style="width:auto; padding:5px 10px" onclick="borrarUser('${u.email}')">X</button>
                        </td>
                    </tr>`).join('')}</tbody>
            </table>`;
    }

    window.editarUser = (email) => {
        const users = JSON.parse(localStorage.getItem('hotel_users'));
        const u = users.find(x => x.email === email);
        mainContent.innerHTML = `
            <h2 class="serif-title">Editando: ${u.name}</h2>
            <form id="edit-f" class="auth-card" style="max-width:400px">
                <label>Nombre Nuevo</label>
                <input type="text" id="e-name" value="${u.name}" class="input-group">
                <label>Cambiar Rol</label>
                <select id="e-role">
                    <option value="client" ${u.role==='client'?'selected':''}>Cliente</option>
                    <option value="operator" ${u.role==='operator'?'selected':''}>Operador</option>
                    <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                </select>
                <button type="submit" class="btn-primary">Guardar</button>
            </form>`;
        
        document.getElementById('edit-f').onsubmit = (e) => {
            e.preventDefault();
            const mod = users.map(x => x.email === email ? {...x, name:document.getElementById('e-name').value, role:document.getElementById('e-role').value} : x);
            localStorage.setItem('hotel_users', JSON.stringify(mod));
            alert("Actualizado.");
            renderUsuarios();
        };
    };

    window.borrarUser = (email) => {
        let users = JSON.parse(localStorage.getItem('hotel_users'));
        localStorage.setItem('hotel_users', JSON.stringify(users.filter(u => u.email !== email)));
        renderUsuarios();
    };

    function renderDashboard(u) { mainContent.innerHTML = `<h1 class="serif-title">Hola, ${u.name}</h1><p>Desde aquí puedes gestionar todas tus actividades en Hotel Elite.</p>`; }
    function renderEstadisticas() {
        const db = JSON.parse(localStorage.getItem('hotel_reservas')) || [];
        const total = db.length;
        mainContent.innerHTML = `<h2 class="serif-title">Estadísticas</h2><div class="stat-card"><h3>Reservas Totales</h3><p>${total}</p></div>`;
    }
});