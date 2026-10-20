# Márcalo — guía para trabajar en este repositorio

Sitio de Márcalo: registro y protección de marcas en Colombia.
Desplegado en Vercel desde GitHub.

## Reglas de Git

- Nunca hacer commit, push ni merge a `main`.
- Trabajar solo en la rama `seo-estructura` (o la que se indique explícitamente).
- Avisar y esperar aprobación antes de subir cualquier cosa a GitHub.

## Estructura y scripts

- URLs limpias con Vercel (`vercel.json`: `cleanUrls`, `trailingSlash: false`, redirecciones 301).
  `/a` → `a.html`, `/a/b` → `a/b.html`, `/` → `index.html`, `/en` → `en/index.html`.
- `paginas.json` es la lista de páginas: cada fila une una URL en español con su equivalente en inglés.
  Al crear una página, agregarla ahí.
- El header y el footer se editan solo en `parciales/` (`header.es.html`, `header.en.html`,
  `footer.es.html`, `footer.en.html`). Nunca directamente en las páginas.
- Cada página lleva los marcadores `<!-- SEO --><!-- /SEO -->` (en el `<head>`, después de la meta
  description), `<!-- HEADER --><!-- /HEADER -->` y `<!-- FOOTER --><!-- /FOOTER -->`.
- Después de cualquier cambio, correr desde la raíz:
  1. `node scripts/sincronizar.mjs`: copia header/footer, genera canonical, hreflang y Open Graph
     desde el `<title>` y la meta description, y valida las reglas SEO (falla si algo no cumple).
  2. `node scripts/generar-sitemap.mjs`: regenera `sitemap.xml` con hreflang.
- Los scripts son Node sin dependencias y se corren solo en local; Vercel no ejecuta ningún build.
  `.vercelignore` evita publicar `CLAUDE.md`, `REVISAR.md`, `paginas.json`, `parciales/` y `scripts/`.
- No crear `package.json` (haría que Vercel intente compilar el sitio).

## Tecnología

- Sitio estático en HTML y CSS, sin frameworks, sin bundler y sin paso de compilación.
- JavaScript solo donde ya existe (`buscador.js`, formularios a WhatsApp) y las funciones
  serverless de Vercel en `api/`.
- Editar sobre los archivos existentes; no reescribirlos desde cero. Cambios mínimos y
  coherentes con el código que ya hay.

## Diseño (no cambiar)

Usar siempre los tokens de `styles.css` y los patrones existentes (`top-wrap` + `site-header`
+ `hero`, `section`, `eyebrow`, `btn btn-primary/outline/ghost`, `price-row`, `plan-card`,
`edu-alert`, `feature-grid`, `site-footer`, `floating-whatsapp`). No agregar colores ni
fuentes nuevos.

Paleta (`:root` en `styles.css`):

| Token | Valor |
|---|---|
| `--charcoal` | `#222223` |
| `--charcoal-mid` | `#333334` |
| `--text-muted` | `#6B6B6C` |
| `--apricot` (fondo) | `#FFFEEC` |
| `--apricot-dark` | `#F5F4D8` |
| `--gold-green` | `#CAC426` |
| `--gold-green-dark` | `#A8A21E` |
| `--lavender` | `#BCB4FF` |
| `--lavender-light` | `#EDE9FF` |
| `--lavender-mid` | `#9B90F5` |
| `--lavender-dark` | `#6B5FCF` |
| `--white` | `#FFFFFF` |
| `--whatsapp` | `#25D366` |

Tipografía (Google Fonts):

- Títulos: `--font-display` = **Bricolage Grotesque** (400, 600, 700, 800).
- Texto: `--font-body` = **Figtree** (300–900).

## Idioma y tono

- Español de Colombia (`lang="es-CO"`), tuteo, lenguaje claro.
- Precios en pesos colombianos con punto de miles: `$120.000`.
- **No usar frases de relleno** como "sin costos ocultos", "sin letra pequeña", "en palabras
  simples", "sin tecnicismos" (ni sus versiones en inglés): suenan escritas por una IA.
- El equipo son **abogadas** (femenino): "una abogada", "nosotras", "tus abogadas".
- Márcalo **aún no es una sociedad**. En términos y política de datos aparece provisionalmente
  como "MÁRCALO S.A.S."; actualizarlo cuando se constituya la empresa. No usar el nombre en otras páginas.
- Enfoque: no somos solo un trámite. Somos aliadas estratégicas: para qué sirve la marca, cómo
  protegerla, cómo posicionarla, qué hace la competencia y qué hacer después del registro.

## SEO: reglas por página

- Una sola búsqueda (intención de búsqueda / palabra clave) principal por página; no
  competir entre páginas por la misma búsqueda.
- Un solo `<h1>` por página, alineado con esa búsqueda principal.
- Cada página tiene su propio:
  - `<title>`
  - `<meta name="description">` de **máximo 155 caracteres**
  - `<link rel="canonical">` con la URL absoluta definitiva (`https://marcalocol.com/...`)
  - Open Graph: `og:title`, `og:description`, `og:url`, `og:type`, `og:image`,
    `og:locale` (`es_CO` / `en_US`) y `og:site_name`
  - `hreflang` hacia su equivalente en el otro idioma (ver abajo)
- Al crear o mover una página, actualizar `sitemap.xml`.

## Nombres y reglas de servicios

- El servicio antes llamado "Diagnóstico 360°" se llama ahora **"Diagnóstico 360° de tu
  marca"** en todo el sitio (textos, planes, términos y mensajes de WhatsApp).
- **Diagnósticos legales** (contratos, secretos empresariales, laboral, cobranza,
  protección al consumidor): no muestran precios. Su botón abre WhatsApp
  (`https://wa.me/573009574511`) con un mensaje prellenado **distinto por servicio**.
- **Solo la Búsqueda express tiene pago en línea (Bold).** Ningún otro servicio usa Bold.
- La Búsqueda express es **solo fonética** (no incluye búsqueda gráfica de logos o diseños).
- La tarifa PYME de la SIC aplica a empresas **y a personas naturales** según sus ingresos.
- El registro tarda **entre 8 y 12 meses** desde la solicitud y termina con una resolución de
  concesión o de negación.
- La Búsqueda express cubre **solo Colombia** (marcas en la Superintendencia de Industria
  y Comercio, SIC). Decirlo explícitamente donde se ofrezca.

## Integración de pago con Bold (no romper)

- `busqueda-de-marca-express.html` y `en/express-trademark-search.html` cargan
  `https://checkout.bold.co/library/boldPaymentButton.js` y `/buscador.js`.
- `buscador.js` llama a `/api/bold-firma?marca=...`, abre `new BoldCheckout({...})` y
  procesa el regreso con `bold-order-id` y `bold-tx-status` en la URL.
- `api/bold-firma.js` genera `orderId` y la firma de integridad SHA-256
  (`orderId + monto + moneda + BOLD_SECRET_KEY`). El monto (`120000` COP) vive en el
  servidor. `api/bold-estado.js` solo informa si la llave secreta está configurada.
- La llave secreta solo existe como variable de entorno en Vercel; nunca en el código.
- `redirectionUrl` en `buscador.js` es la URL de la página actual, así Bold devuelve al usuario
  a la búsqueda en su idioma. Si la página cambia de URL, dejar una redirección 301 desde la
  anterior (como `/buscador.html` → `/busqueda-de-marca-express`) para los pagos en curso.
- Los textos de `buscador.js` están en el objeto `TEXTOS` (`es` / `en`), según `<html lang>`.

## Movimiento y calculadora

- `animaciones.js` (cargado desde el footer en todas las páginas) hace aparecer los bloques al
  bajar por la página; las animaciones de entrada del hero son solo CSS. Todo respeta
  "reducir movimiento" (`prefers-reduced-motion`) y sin JavaScript el contenido se ve normal.
- `calculadora.js` (solo en "¿Cuánto cuesta?", español e inglés) calcula honorarios + tarifa de la
  SIC. **Los precios están en `calculadora.js`**: si cambian, actualizarlos ahí y en las tablas de
  `registro-de-marca-colombia.html`, `registro-de-marca-colombia/cuanto-cuesta.html` y sus versiones
  en inglés.
- No cambiar los IDs del DOM que usa `buscador.js` (`bf-form`, `bf-marca`,
  `bf-resultados`, `bf-lead`, `bf-pagar`, `bf-error`, `bf-gracias*`, `bf-chips`,
  `bf-nombre-buscado`).

## Versión en inglés

- El sitio tendrá versión en inglés bajo `/en/`, con URLs en inglés, `lang="en"`.
- Cada página en español y su equivalente en inglés se enlazan entre sí con
  `<link rel="alternate" hreflang="es-CO">`, `hreflang="en"` y `hreflang="x-default"`
  (apuntando a la versión en español), y lo mismo en `sitemap.xml`.
