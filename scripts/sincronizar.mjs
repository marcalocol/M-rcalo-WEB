// Copia el header, el footer y las etiquetas SEO en todas las páginas de paginas.json,
// y revisa que cada página cumpla las reglas de CLAUDE.md.
//
// Uso (desde la raíz del repositorio):  node scripts/sincronizar.mjs
//
// Cada página debe tener estos marcadores; el script reemplaza lo que haya entre ellos:
//   <!-- SEO --><!-- /SEO -->         dentro del <head>, después de la meta description
//   <!-- HEADER --><!-- /HEADER -->   donde va el <header>
//   <!-- FOOTER --><!-- /FOOTER -->   donde va el <footer>
// El canonical, los hreflang y el Open Graph se arman con el <title> y la meta description de la página.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { paginas, IDIOMAS, RAIZ, archivoDe, urlAbsoluta } from './paginas.mjs';

const MAX_DESCRIPCION = 155;
const IMAGEN_OG = urlAbsoluta('/images/og-marcalo.png');
const LANG = { es: 'es-CO', en: 'en' };
const LOCALE = { es: 'es_CO', en: 'en_US' };

const parciales = {};
for (const idioma of IDIOMAS) {
  parciales[idioma] = {
    header: readFileSync(join(RAIZ, `parciales/header.${idioma}.html`), 'utf8').trim(),
    footer: readFileSync(join(RAIZ, `parciales/footer.${idioma}.html`), 'utf8').trim()
  };
}

function escaparAtributo(texto) {
  return texto.replace(/&(?!(amp|quot|lt|gt|#\d+);)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function textoPlano(html) {
  return html.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
}

// ---------- Datos estructurados (schema.org, JSON-LD) ----------
// Se generan a partir del HTML de cada página: la ficha de Márcalo en el inicio,
// las migas de pan (<nav class="migas">) y las preguntas frecuentes (<details class="faq-item">).
const NEGOCIO = {
  es: 'Abogadas en propiedad intelectual y derecho empresarial. Registro y estrategia de marca en Colombia, y diagnósticos legales para empresas.',
  en: 'Women lawyers in intellectual property and business law. Trademark registration and brand strategy in Colombia, and legal assessments for companies.'
};

function jsonLd(objeto) {
  // "<" escapado para que el JSON nunca cierre el <script> por accidente.
  return `<script type="application/ld+json">${JSON.stringify(objeto).replace(/</g, '\\u003c')}</script>`;
}

function textoDeHtml(html) {
  return textoPlano(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function datosEstructurados(pagina, idioma, html) {
  const bloques = [];
  if (pagina.seccion === 'inicio') {
    bloques.push({
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      '@id': urlAbsoluta('/') + '#marcalo',
      name: 'Márcalo',
      url: urlAbsoluta(pagina[idioma]),
      logo: urlAbsoluta('/images/logo.png'),
      image: IMAGEN_OG,
      description: NEGOCIO[idioma],
      telephone: '+57 300 957 4511',
      email: 'contacto_@marcalocol.com',
      address: { '@type': 'PostalAddress', addressLocality: 'Bogotá', addressCountry: 'CO' },
      areaServed: { '@type': 'Country', name: 'Colombia' },
      availableLanguage: ['es', 'en'],
      sameAs: ['https://instagram.com/marcalo_col']
    });
  }
  const migas = html.match(/<nav class="migas"[^>]*>([\s\S]*?)<\/nav>/);
  if (migas) {
    const items = [];
    const patron = /<a href="([^"]+)">([\s\S]*?)<\/a>|<span aria-current="page">([\s\S]*?)<\/span>/g;
    let m;
    while ((m = patron.exec(migas[1]))) {
      items.push({ nombre: textoDeHtml(m[2] || m[3]), url: m[1] ? urlAbsoluta(m[1]) : urlAbsoluta(pagina[idioma]) });
    }
    bloques.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.nombre, item: it.url }))
    });
  }
  const preguntas = [];
  const patronFaq = /<details class="faq-item"[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g;
  let f;
  while ((f = patronFaq.exec(html))) {
    preguntas.push({ '@type': 'Question', name: textoDeHtml(f[1]), acceptedAnswer: { '@type': 'Answer', text: textoDeHtml(f[2]) } });
  }
  if (preguntas.length) {
    bloques.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: preguntas });
  }
  return bloques.map(jsonLd);
}

function bloqueSeo(pagina, idioma, titulo, descripcion, html) {
  const otro = idioma === 'es' ? 'en' : 'es';
  return [
    `<link rel="canonical" href="${urlAbsoluta(pagina[idioma])}" />`,
    `<link rel="alternate" hreflang="es-CO" href="${urlAbsoluta(pagina.es)}" />`,
    `<link rel="alternate" hreflang="en" href="${urlAbsoluta(pagina.en)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${urlAbsoluta(pagina.es)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Márcalo" />`,
    `<meta property="og:locale" content="${LOCALE[idioma]}" />`,
    `<meta property="og:locale:alternate" content="${LOCALE[otro]}" />`,
    `<meta property="og:title" content="${escaparAtributo(titulo)}" />`,
    `<meta property="og:description" content="${escaparAtributo(descripcion)}" />`,
    `<meta property="og:url" content="${urlAbsoluta(pagina[idioma])}" />`,
    `<meta property="og:image" content="${IMAGEN_OG}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Márcalo" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="icon" type="image/png" sizes="192x192" href="/images/icon-192.png" />`,
    `<link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
    ...datosEstructurados(pagina, idioma, html)
  ].join('\n');
}

function reemplazarBloque(html, nombre, contenido, errores) {
  const patron = new RegExp(`<!-- ${nombre} -->[\\s\\S]*?<!-- /${nombre} -->`);
  if (!patron.test(html)) {
    errores.push(`falta el marcador <!-- ${nombre} --><!-- /${nombre} -->`);
    return html;
  }
  return html.replace(patron, () => `<!-- ${nombre} -->\n${contenido}\n<!-- /${nombre} -->`);
}

function header(idioma, pagina) {
  const otro = idioma === 'es' ? 'en' : 'es';
  return parciales[idioma].header
    .replace('{{URL_OTRO_IDIOMA}}', pagina[otro])
    .replace(new RegExp(`data-seccion="${pagina.seccion}"`, 'g'), `data-seccion="${pagina.seccion}" aria-current="page"`);
}

let hayErrores = false;
let cambiados = 0;
const vistas = new Map();

for (const pagina of paginas) {
  for (const idioma of IDIOMAS) {
    const archivo = archivoDe(pagina[idioma]);
    const ruta = join(RAIZ, archivo);
    const errores = [];

    if (vistas.has(pagina[idioma])) errores.push(`URL repetida en paginas.json (${pagina[idioma]})`);
    vistas.set(pagina[idioma], true);

    if (!existsSync(ruta)) {
      console.error(`✗ ${archivo}: no existe`);
      hayErrores = true;
      continue;
    }

    const original = readFileSync(ruta, 'utf8');
    const titulo = (original.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const descripcion = (original.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    const lang = (original.match(/<html lang="([^"]+)"/) || [])[1];
    const h1 = (original.match(/<h1[\s>]/g) || []).length;

    if (!titulo) errores.push('falta <title>');
    if (!descripcion) errores.push('falta <meta name="description">');
    else if ([...textoPlano(descripcion)].length > MAX_DESCRIPCION) {
      errores.push(`la meta description tiene ${[...textoPlano(descripcion)].length} caracteres (máximo ${MAX_DESCRIPCION})`);
    }
    if (lang !== LANG[idioma]) errores.push(`<html lang="${lang}"> debería ser "${LANG[idioma]}"`);
    if (h1 !== 1) errores.push(`tiene ${h1} <h1> (debe tener exactamente 1)`);

    let html = original;
    if (titulo && descripcion) {
      html = reemplazarBloque(html, 'SEO', bloqueSeo(pagina, idioma, textoPlano(titulo), textoPlano(descripcion), original), errores);
    }
    html = reemplazarBloque(html, 'HEADER', header(idioma, pagina), errores);
    html = reemplazarBloque(html, 'FOOTER', parciales[idioma].footer, errores);

    if (errores.length) {
      hayErrores = true;
      errores.forEach((e) => console.error(`✗ ${archivo}: ${e}`));
    }
    if (html !== original) {
      writeFileSync(ruta, html);
      cambiados++;
      console.log(`✓ ${archivo} actualizado`);
    }
  }
}

console.log(`\n${cambiados} archivo(s) actualizados.`);
if (hayErrores) {
  console.error('Hay errores: revisa los mensajes marcados con ✗.');
  process.exit(1);
}
