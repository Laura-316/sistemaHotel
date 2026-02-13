Sistema Hotel
Cómo abrir este proyecto sin problemas

Si abres los archivos .html haciendo doble clic o directamente desde tu computadora (con rutas que empiezan con file://), es muy probable que el navegador bloquee algunos archivos y no funcione bien. Esto pasa por seguridad y se llama error de CORS.

¿Entonces, cómo lo abro bien?

Lo mejor es usar un pequeño servidor que “sirva” los archivos para que el navegador los entienda bien y no bloquee nada.

Aquí te dejo dos formas súper fáciles para hacerlo:

Con Visual Studio Code

Instala la extensión llamada Live Server.

Abre la carpeta del proyecto en VS Code.

Haz clic derecho sobre el archivo layoutMaestro.html y elige "Open with Live Server".

Se abrirá en tu navegador una dirección que empieza con http://127.0.0.1:5500/
 y todo funcionará perfecto.

Con Python (si lo tienes instalado)

Abre la terminal o consola en la carpeta del proyecto.

Ejecuta este comando: python -m http.server 5500

Después, abre en tu navegador esta dirección: http://localhost:5500/layoutMaestro.html

Si abres el archivo sin usar servidor (con doble clic), puede que veas que no carga los scripts o funciones y el proyecto no funcione como debe.

¡Listo! Así evitas problemas y puedes disfrutar trabajando con el Sistema Hotel sin dolores de cabeza 😊
