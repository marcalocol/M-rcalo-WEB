/* ===== Buscador fonético de marcas (búsqueda asistida) =====
   Genera variaciones fonéticas y de escritura en español para un nombre de marca.
   La búsqueda en la SIC la hace el equipo de Márcalo; aquí solo preparamos la solicitud. */

(function (root) {
  'use strict';

  var MAX_VARIANTES = 16;

  function quitarTildes(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Deja solo letras, números y espacios simples. Conserva la ñ.
  function normalizar(texto) {
    var s = String(texto || '').toLowerCase().replace(/ñ/g, '\u0001');
    s = quitarTildes(s).replace(/\u0001/g, 'ñ');
    return s.replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Clave fonética: dos nombres que "suenan igual" en español producen la misma clave.
  function claveFonetica(texto) {
    var s = normalizar(texto).replace(/ /g, '');
    s = s.replace(/ph/g, 'f')
      .replace(/ñ/g, 'ny')
      .replace(/sh/g, 'ch')
      .replace(/ll/g, 'y')
      .replace(/qu([ei])/g, 'k$1')
      .replace(/q/g, 'k')
      .replace(/c([ei])/g, 's$1')
      .replace(/ch/g, '\u0002')
      .replace(/c/g, 'k')
      .replace(/\u0002/g, 'ch')
      .replace(/g([ei])/g, 'j$1')
      .replace(/gu([ei])/g, 'g$1')
      .replace(/x/g, 'ks')
      .replace(/z/g, 's')
      .replace(/v/g, 'b')
      .replace(/w/g, 'u')
      .replace(/([^c])h/g, '$1')
      .replace(/^h/, '')
      .replace(/y$/, 'i')
      .replace(/(.)\1+/g, '$1');
    return s;
  }

  // Reglas de sustitución: cada una devuelve una lista de transformaciones posibles.
  var REGLAS = [
    function (s) { return [s.replace(/v/g, 'b'), s.replace(/b/g, 'v'), s.replace(/v/, 'b'), s.replace(/b/, 'v')]; },
    function (s) {
      return [
        s.replace(/c([aou])/g, 'k$1'),
        s.replace(/qu([ei])/g, 'k$1'),
        s.replace(/k([aou])/g, 'c$1'),
        s.replace(/k([ei])/g, 'qu$1')
      ];
    },
    function (s) {
      return [
        s.replace(/c([ei])/g, 's$1'),
        s.replace(/z/g, 's'),
        s.replace(/s/g, 'z'),
        s.replace(/z([ei])/g, 'c$1')
      ];
    },
    function (s) { return [s.replace(/ll/g, 'y'), s.replace(/(^|[aeiou ])y(?=[aeiou])/g, '$1ll')]; },
    function (s) {
      return [
        s.replace(/(^|[^c])h/g, '$1'),
        /^[aeiou]/.test(s) ? 'h' + s : s
      ];
    },
    function (s) { return [s.replace(/g([ei])/g, 'j$1'), s.replace(/j([ei])/g, 'g$1')]; },
    function (s) { return [s.replace(/x/g, 'ks'), s.replace(/ks/g, 'x'), s.replace(/^x/, 's')]; },
    function (s) { return [s.replace(/ph/g, 'f'), s.replace(/f/g, 'ph')]; },
    function (s) { return [s.replace(/w/g, 'u'), s.replace(/w/g, 'v'), s.replace(/^u(?=[aeio])/, 'w')]; },
    function (s) { return [s.replace(/i\b/g, 'y'), s.replace(/y\b/g, 'i')]; },
    function (s) { return [s.replace(/ñ/g, 'ni'), s.replace(/ñ/g, 'ny'), s.replace(/n(?=[iy][aeou])/g, 'ñ').replace(/ñ[iy]/g, 'ñ')]; },
    function (s) { return [s.replace(/sh/g, 'ch'), s.replace(/ch/g, 'sh')]; },
    function (s) {
      // Letras dobles: quitar las existentes o duplicar f, l, n, s, t una vez.
      var out = [s.replace(/([^aeiou ])\1/g, '$1')];
      var m = s.match(/([^flnst]|^)([flnst])(?=[aeiou])/);
      if (m) out.push(s.slice(0, m.index + m[1].length) + m[2] + s.slice(m.index + m[1].length));
      return out;
    }
  ];

  // Variaciones de escritura que no suenan igual pero la SIC también compara.
  function variacionesEscritura(base) {
    var out = [];
    if (base.indexOf(' ') !== -1) {
      out.push(base.replace(/ /g, ''));
      out.push(base.replace(/ /g, '-'));
    }
    if (base.indexOf(' ') === -1) {
      if (/s$/.test(base)) out.push(base.replace(/e?s$/, ''));
      else out.push(base + (/[aeiou]$/.test(base) ? 's' : 'es'));
    }
    return out;
  }

  function generarVariantes(texto) {
    var base = normalizar(texto);
    if (!base) return { base: '', clave: '', foneticas: [], escritura: [] };

    var clave = claveFonetica(base);
    var vistos = {};
    vistos[base] = true;
    var foneticas = [];

    function agregar(v) {
      v = v.replace(/\s+/g, ' ').trim();
      // Descarta resultados artificiales como "kafffe" o "kaphphe".
      if (!v || vistos[v] || /(.)\1\1|phph/.test(v)) return false;
      vistos[v] = true;
      if (claveFonetica(v) === clave) foneticas.push(v);
      return true;
    }

    // Primer nivel: una regla a la vez sobre el nombre original.
    var nivel1 = [];
    REGLAS.forEach(function (regla) {
      regla(base).forEach(function (v) { if (agregar(v)) nivel1.push(v); });
    });
    // Segundo nivel: combinar dos reglas (ej. "kafé" → "caffe").
    for (var i = 0; i < nivel1.length && foneticas.length < MAX_VARIANTES * 2; i++) {
      REGLAS.forEach(function (regla) { regla(nivel1[i]).forEach(agregar); });
    }

    var escritura = variacionesEscritura(base).filter(function (v) {
      return v && v !== base && foneticas.indexOf(v) === -1;
    });

    // Las variantes más cercanas al original primero.
    foneticas.sort(function (a, b) {
      return Math.abs(a.length - base.length) - Math.abs(b.length - base.length) || a.localeCompare(b);
    });

    return {
      base: base,
      clave: clave,
      foneticas: foneticas.slice(0, MAX_VARIANTES),
      escritura: escritura
    };
  }

  var api = { normalizar: normalizar, claveFonetica: claveFonetica, generarVariantes: generarVariantes };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MarcaloFonetica = api;
})(this);

/* ===== Interfaz de la página ===== */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var WHATSAPP = '573009574511';
  var F = window.MarcaloFonetica;

  var formBusqueda = document.getElementById('bf-form');
  var inputMarca = document.getElementById('bf-marca');
  var resultados = document.getElementById('bf-resultados');
  var formLead = document.getElementById('bf-lead');
  var gracias = document.getElementById('bf-gracias');
  var ultima = null;

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function pintarChips(contenedor, lista) {
    contenedor.innerHTML = '';
    lista.forEach(function (v) { contenedor.appendChild(el('span', 'bf-chip', v)); });
  }

  function buscar(texto) {
    var r = F.generarVariantes(texto);
    if (!r.base) {
      inputMarca.focus();
      return;
    }
    ultima = { original: texto.trim(), r: r };

    document.getElementById('bf-nombre-buscado').textContent = texto.trim();
    pintarChips(document.getElementById('bf-chips'), r.foneticas.concat(r.escritura));

    formLead.hidden = false;
    gracias.hidden = true;
    resultados.hidden = false;
    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formBusqueda.addEventListener('submit', function (e) {
    e.preventDefault();
    buscar(inputMarca.value);
  });

  // Búsqueda que llega desde la página de inicio (?marca=...).
  var desdeInicio = new URLSearchParams(window.location.search).get('marca');
  if (desdeInicio) {
    inputMarca.value = desdeInicio;
    buscar(desdeInicio);
  }

  formLead.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!ultima) return;
    var f = new FormData(formLead);
    var texto =
      'Hola, soy ' + (f.get('nombre') || '') + ' (WhatsApp: ' + (f.get('whatsapp') || '') + '). ' +
      'Quiero solicitar la Búsqueda express ($120.000) para la marca "' + ultima.original + '".' +
      (f.get('actividad') ? ' Mi empresa se dedica a: ' + f.get('actividad') + '.' : '');
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank');
    formLead.hidden = true;
    gracias.hidden = false;
    gracias.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
