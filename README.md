# Sistema Hotel

## Cómo abrir este proyecto correctamente

Para evitar problemas con la carga de scripts (errores de CORS), **no abras los archivos `.html` directamente haciendo doble clic o desde `file://`** en el navegador. Esto provoca que algunos navegadores bloqueen los recursos por razones de seguridad.

### ¿Cómo abrirlo bien?

La forma recomendada es usar un servidor local, que sirve los archivos a través de `http://` y así el navegador permite cargar todos los scripts correctamente.

### Opciones fáciles para levantar un servidor local:

1. **Usando Visual Studio Code**

   - Instala la extensión **Live Server**.
   - Abre la carpeta del proyecto en VS Code.
   - Haz clic derecho sobre el archivo `layoutMaestro.html` y selecciona **"Open with Live Server"**.
   - El proyecto se abrirá en tu navegador con una URL como `http://127.0.0.1:5500/layoutMaestro.html`.
   
2. **Usando Python (si tienes instalado Python 3)**

   - Abre una terminal en la carpeta del proyecto.
   - Ejecuta el comando:

     ```
     python -m http.server 5500
     ```

   - Abre en tu navegador la URL:

     ```
     http://localhost:5500/layoutMaestro.html
     ```

---

Si no sigues estos pasos y abres el HTML directamente, puedes encontrar errores que impiden cargar los scripts y el proyecto no funcionará correctamente.

---

¡Disfruta trabajando en el Sistema Hotel!
