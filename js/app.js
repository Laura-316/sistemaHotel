import { getUsers, StorageService, initStorage } from './storage.js';
import { mostrarPanel } from './ui/ui.js';

// Inicializar datos base (Admin y Operador)
initStorage();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const btnGoRegister = document.getElementById('go-to-register');
    const btnGoLogin = document.getElementById('go-to-login');

    // --- LÓGICA DE NAVEGACIÓN ENTRE FORMULARIOS ---
    btnGoRegister.onclick = () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    };

    btnGoLogin.onclick = () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    };

    // --- LÓGICA DE INICIO DE SESIÓN ---
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        const roleSel = document.getElementById('role').value;

        const users = getUsers();
        // Buscamos usuario que coincida con email, clave y rol
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            localStorage.setItem('sesion_activa', JSON.stringify(user));
            mostrarPanel(user);
        } else {
            alert("Credenciales incorrectas o usuario no encontrado.");
        }
    };

    // --- LÓGICA DE REGISTRO ---
    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const nuevoUsuario = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };

        const resultado = StorageService.registrarUsuario(nuevoUsuario);

        if (resultado.success) {
            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            registerForm.reset();
            btnGoLogin.click(); // Regresa al login
        } else {
            alert(resultado.error);
        }
    };

    // --- PERSISTENCIA DE SESIÓN ---
    const sesion = JSON.parse(localStorage.getItem('sesion_activa'));
    if (sesion) {
        mostrarPanel(sesion);
    }
});
/**
 * NOTA: Las funciones como 'renderGestionReservas' o 'ejecutarAccion'
 * ahora se manejan internamente en ui.js o a través del objeto global window,
 * por lo que no es necesario importarlas aquí.
 */