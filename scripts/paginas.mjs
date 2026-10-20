// Datos y utilidades compartidas por los scripts del sitio.
// La lista de páginas vive en paginas.json: cada fila une una página en español con su equivalente en inglés.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const SITIO = 'https://marcalocol.com';
export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const IDIOMAS = ['es', 'en'];

export const paginas = JSON.parse(readFileSync(join(RAIZ, 'paginas.json'), 'utf8'));

// "/" → index.html, "/en" → en/index.html, "/a/b" → a/b.html (Vercel sirve URLs limpias con cleanUrls).
export function archivoDe(url) {
  if (url === '/') return 'index.html';
  if (url === '/en') return 'en/index.html';
  return url.slice(1) + '.html';
}

export function urlAbsoluta(url) {
  return SITIO + url;
}
