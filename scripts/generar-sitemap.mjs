// Genera sitemap.xml a partir de paginas.json, con las versiones en español e inglés
// de cada página enlazadas entre sí (hreflang).
//
// Uso (desde la raíz del repositorio):  node scripts/generar-sitemap.mjs
//
// La fecha <lastmod> de cada URL es la del último commit que tocó su archivo
// (o la de hoy, si el archivo todavía no tiene commits).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { paginas, IDIOMAS, RAIZ, archivoDe, urlAbsoluta } from './paginas.mjs';

function ultimaModificacion(archivo) {
  try {
    const fecha = execFileSync('git', ['log', '-1', '--format=%cs', '--', archivo], { cwd: RAIZ, encoding: 'utf8' }).trim();
    if (fecha) return fecha;
  } catch (e) { /* sin git: usamos la fecha de hoy */ }
  return new Date().toISOString().slice(0, 10);
}

const urls = [];
for (const pagina of paginas) {
  const alternas = [
    `    <xhtml:link rel="alternate" hreflang="es-CO" href="${urlAbsoluta(pagina.es)}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${urlAbsoluta(pagina.en)}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlAbsoluta(pagina.es)}" />`
  ].join('\n');
  for (const idioma of IDIOMAS) {
    urls.push([
      '  <url>',
      `    <loc>${urlAbsoluta(pagina[idioma])}</loc>`,
      `    <lastmod>${ultimaModificacion(archivoDe(pagina[idioma]))}</lastmod>`,
      alternas,
      '  </url>'
    ].join('\n'));
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

writeFileSync(join(RAIZ, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml generado con ${urls.length} URLs.`);
