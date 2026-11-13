# 🎬 Sockbuster Video & Socks | Evaluación 3 — Modelamiento de Soluciones Informáticas

Prototipo web de comercio electrónico de **calcetines temáticos**, desarrollado para el caso de estudio Sockbuster de TI3025 (INACAP, Primavera 2026).

> **Sitio web publicado:** `https://sbkmz07.github.io/Sockbuster-EV3/`  


> **Autores:** Sebastián Muñoz, Gustavo Veiga

## Páginas solicitadas

- [`index.html`](index.html): presentación de marca, banner y autores.
- [`catalogo.html`](catalogo.html): catálogo interactivo, filtros, carrito, checkout, reseñas y administración.
- [`diagramas.html`](diagramas.html): **5 vistas UML (4+1)**, explicaciones y trazabilidad RF/RNF.

## Requerimientos verificados

| Código | Descripción | Implementación |
|---|---|---|
| RF01 | Explorar/filtrar calcetines; imagen, precio, stock y tallas | Catálogo, filtros y modal de detalle |
| RF02 | Agregar al carrito, modificar cantidades y checkout simulado | Carrito con cantidades, total e ID `SB-...` |
| RF03 | Alta de calcetines, temática, stock y precios | Panel «Gestión de inventario», con cuenta admin |
| RF04 | Reseñas con estrellas 1–5 y comentarios por usuarios registrados | Registro, inicio de sesión y ficha de cada calcetín |
| RNF01 | Web disponible en nube y accesible mediante navegador | Preparada para publicar en GitHub Pages con HTTPS |
| RNF02 | HTTPS + autenticación JWT para operaciones administrativas | **Modo seguro opcional** con Supabase Auth + RLS (ver abajo) |

**Importante:** `checkout` es una **simulación**: no existe pasarela de pago real ni cobro de dinero. El pedido simulado se almacena solo en el navegador y no disminuye el stock del servidor.

## Arquitectura 4+1 y diagramas

1. **Vista lógica:** [`uml/01-vista-logica.puml`](uml/01-vista-logica.puml) — clases, atributos, operaciones y multiplicidades.
2. **Vista de desarrollo:** [`uml/02-vista-desarrollo.puml`](uml/02-vista-desarrollo.puml) — componentes alineados a los archivos reales.
3. **Vista de procesos:** [`uml/03-vista-proceso-checkout.puml`](uml/03-vista-proceso-checkout.puml) (bifurcación/paralelismo), [`uml/04-vista-proceso-filtrado.puml`](uml/04-vista-proceso-filtrado.puml) (secuencia de componentes), [`uml/07-vista-proceso-resenas.puml`](uml/07-vista-proceso-resenas.puml) (actividades).
4. **Vista física:** [`uml/05-vista-fisica.puml`](uml/05-vista-fisica.puml) — equipo cliente, GitHub Pages, almacenamiento local y nube opcional.
5. **+1 Escenarios:** [`uml/06-escenarios-casos-uso.puml`](uml/06-escenarios-casos-uso.puml) — actores y casos de uso de RF01–RF04.

Los SVG de la carpeta `assets/diagrams/` son vistas listas para abrir incluso sin instalar programas de diagramas. Los `.puml` son el modelo fuente editable en PlantUML.

## Abrir en Visual Studio Code (sin saber programación)

1. Descarga y descomprime el proyecto. Abre **Visual Studio Code**.
2. Haz clic en **Archivo → Abrir carpeta** y selecciona `Sockbuster-EV3`.
3. Instala la extensión gratuita **Live Server** (de Ritwick Dey) si aún no la tienes.
4. Abre `index.html`, haz clic derecho y elige **Open with Live Server**. Se abrirá en tu navegador.
5. Prueba los menús **Inicio**, **Catálogo** y **Arquitectura 4+1**.
6. Cambia tu nombre completo en `js/students.js` antes de subir el trabajo.

> Si no usas Live Server pero tienes Python instalado: abre una terminal en la carpeta del proyecto y ejecuta `python -m http.server 8000`, luego visita `http://localhost:8000`. **No** hagas doble clic en `index.html` para abrirlo con `file://`: los módulos ES requieren un servidor local.

## Pruebas fáciles (modo demo)

1. Entra a **Catálogo**, presiona «Ciencia ficción» y confirma que aparezcan solo los modelos de esa colección.
2. Abre «Galaxia Retro», selecciona una talla y agrega 1 unidad.
3. Abre el carrito, usa los botones `+` y `−`, y presiona **Simular checkout**. Aparecerá un ID único de pedido.
4. En **Iniciar sesión → Crear cuenta**, registra una cuenta **de prueba**, abre un producto y publica una reseña de 1 a 5 estrellas.
5. En otra sesión (o después de cerrar sesión) ingresa con la cuenta de prueba de administrador: correo `admin@sockbuster.demo`, contraseña `Demo12345!`.
6. Presiona **Gestión de inventario (RF03)**: podrás editar stock, precio o crear un modelo nuevo.
7. Abre **Arquitectura 4+1** y amplía los diagramas para comprobar que estén legibles.

**Aviso:** esas credenciales están documentadas y son públicas, y las cuentas demo se almacenan en el navegador. **No son seguridad real** y no deben usarse para información privada ni producción. La contraseña de demo se procesa con SHA-256 solo como recurso didáctico, sin protección frente a manipulación del almacenamiento local.

## Publicar gratis en GitHub Pages

1. Ve a `https://github.com/` e inicia sesión o crea tu cuenta.
2. Presiona **New repository**; nombre sugerido: `Sockbuster-EV3`; visibilidad: **Public**.
3. Crea el repositorio. Presiona **Add file → Upload files**, selecciona **todos los archivos y carpetas descomprimidos del proyecto** (no solo el ZIP). Confirma los cambios con **Commit changes**.
4. En el repositorio, abre **Settings → Pages**. En **Build and deployment**, selecciona **Deploy from a branch**, rama `main`, carpeta `/(root)` y **Save**.
5. Cuando GitHub Pages muestre la dirección de la web, ábrela y prueba los tres enlaces del menú.
6. En **README.md**, reemplaza `TU_USUARIO` por el usuario correcto de GitHub, guarda y haz commit.
7. **Lo único que se entrega en la plataforma INACAP es la URL del repositorio público.** El README debe incluir la URL real de la web publicada.

**El sitio no se publica automáticamente al descargar el ZIP**: hay que subirlo a GitHub y habilitar Pages. Consulta [documentación oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Extra opcional: JWT y reglas reales de administrador (RNF02)

GitHub Pages sirve archivos estáticos por HTTPS, pero **no es un servidor de autenticación JWT**. Para que el RNF02 se cumpla técnicamente y no solo en el diagrama, sigue estos pasos opcionales:

1. Crea un proyecto en `https://supabase.com/`.
2. Abre **SQL Editor** y ejecuta **una sola vez** el archivo `supabase/schema.sql` completo (crea tablas, usuarios, políticas RLS y catálogo).
3. Abre `js/config.js` y escribe `SUPABASE_URL` (Project URL) y `SUPABASE_ANON_KEY` (**publishable / anon** pública, NUNCA una secret / service_role). Guarda el archivo.
4. En Supabase Auth → URL Configuration, registra como **Redirect URL** la dirección publicada de GitHub Pages, por ejemplo `https://TU_USUARIO.github.io/Sockbuster-EV3/**`. Publica los cambios en GitHub Pages.
5. Regístrate desde la propia web y confirma la dirección de correo si el proyecto lo requiere. En Supabase, SQL Editor, concede rol admin a tu cuenta: `update public.profiles set role='admin' where id=(select id from auth.users where email='TU_CORREO@EJEMPLO.COM');`.
6. Vuelve a iniciar sesión; prueba la administración. Supabase Auth emite JWT y PostgreSQL aplica las políticas RLS.

**No compartas contraseñas personales ni claves secretas**. En modo nube la cuenta de prueba `admin@sockbuster.demo` no existe y la gestión de usuarios se realiza mediante Supabase Auth.

## Estructura de archivos

```text
Sockbuster-EV3/
├── index.html
├── catalogo.html
├── diagramas.html
├── css/styles.css
├── js/
│   ├── data.js           (productos iniciales y categorías)
│   ├── db.js             (acceso a datos / autenticación / carrito / pedidos)
│   ├── catalog.js        (interactividad del catálogo)
│   ├── home.js           (portada)
│   ├── students.js       (NOMBRES COMPLETOS, EDITAR)
│   └── config.js         (Supabase opcional)
├── assets/products/     (ilustraciones originales de los calcetines)
├── assets/diagrams/     (previsualizaciones SVG de UML)
├── uml/                 (fuentes PlantUML y generador SVG)
├── supabase/schema.sql  (base de datos y seguridad opcional)
└── README.md
```

## Alcance y límites conocidos

- Sin Supabase, los datos no se sincronizan entre navegadores ni computadores: es un **prototipo local**.
- Sin Supabase, el administrador de prueba no está protegido por JWT real. La **arquitectura** del modo seguro está definida y se puede configurar.
- Los productos y las obras en que se inspiran son ficticios. Las imágenes son **ilustraciones SVG originales**, no fotografías de un stock comercial real.
- La guía exige una carga inicial óptima, pero no contiene un valor numérico de tiempo; por eso no se declara falsamente un SLA específico.
- La nota final depende del docente y de que el sitio esté publicado con los integrantes correctos.
