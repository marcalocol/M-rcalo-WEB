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

  var botonPagar = document.getElementById('bf-pagar');
  var errorPago = document.getElementById('bf-error');
  var CLAVE_SOLICITUD = 'marcalo-busqueda-express';

  function mensajeWhatsApp(d, orden) {
    return 'Hola, soy ' + d.nombre + ' (WhatsApp: ' + d.whatsapp + '). ' +
      (orden ? 'Pagué la Búsqueda express (orden ' + orden + ')' : 'Quiero solicitar la Búsqueda express ($120.000)') +
      ' para la marca "' + d.marca + '".' +
      (d.actividad ? ' Mi empresa se dedica a: ' + d.actividad + '.' : '');
  }

  function mostrarGracias(titulo, texto, enlaceWa, tag) {
    if (tag) document.getElementById('bf-gracias-tag').textContent = tag;
    document.getElementById('bf-gracias-titulo').textContent = titulo;
    document.getElementById('bf-gracias-texto').textContent = texto;
    document.getElementById('bf-gracias-wa').href = enlaceWa;
    resultados.hidden = false;
    formLead.hidden = true;
    gracias.hidden = false;
    gracias.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function linkWa(texto) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  formLead.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!ultima) return;
    var f = new FormData(formLead);
    var datos = {
      nombre: String(f.get('nombre') || '').trim(),
      whatsapp: String(f.get('whatsapp') || '').trim(),
      actividad: String(f.get('actividad') || '').trim(),
      marca: ultima.original
    };
    errorPago.hidden = true;
    botonPagar.disabled = true;
    botonPagar.textContent = 'Abriendo el pago…';

    fetch('/api/bold-firma?marca=' + encodeURIComponent(datos.marca))
      .then(function (r) { if (!r.ok) throw new Error('firma'); return r.json(); })
      .then(function (o) {
        if (typeof window.BoldCheckout !== 'function') throw new Error('bold');
        try { sessionStorage.setItem(CLAVE_SOLICITUD, JSON.stringify(datos)); } catch (err) { /* sin almacenamiento */ }
        var checkout = new window.BoldCheckout({
          orderId: o.orderId,
          currency: o.currency,
          amount: o.amount,
          apiKey: o.apiKey,
          integritySignature: o.integritySignature,
          description: o.description,
          redirectionUrl: window.location.origin + '/buscador.html'
        });
        checkout.open();
        botonPagar.disabled = false;
        botonPagar.textContent = 'Pagar $120.000 →';
      })
      .catch(function () {
        // Si el pago en línea falla, seguimos por WhatsApp como antes.
        botonPagar.disabled = false;
        botonPagar.textContent = 'Pagar $120.000 →';
        errorPago.textContent = 'No pudimos abrir el pago en línea. Escríbenos por WhatsApp y te enviamos el link de pago.';
        errorPago.hidden = false;
        mostrarGracias('Coordinemos tu pago por WhatsApp', 'No pudimos abrir el pago en línea. Envíanos tus datos y te enviamos el link de pago.', linkWa(mensajeWhatsApp(datos)), 'Un paso más');
      });
  });

  // Regreso desde Bold después del pago.
  var params = new URLSearchParams(window.location.search);
  var orden = params.get('bold-order-id');
  if (orden) {
    var estado = (params.get('bold-tx-status') || '').toLowerCase();
    var datos = null;
    try { datos = JSON.parse(sessionStorage.getItem(CLAVE_SOLICITUD) || 'null'); } catch (err) { /* sin almacenamiento */ }
    datos = datos || { nombre: '', whatsapp: '', actividad: '', marca: '' };
    if (datos.marca) {
      inputMarca.value = datos.marca;
      buscar(datos.marca);
    }
    if (estado === 'rejected' || estado === 'failed') {
      mostrarGracias('Tu pago no fue aprobado', 'Puedes intentarlo de nuevo o escribirnos por WhatsApp y te ayudamos.', linkWa(mensajeWhatsApp(datos)), 'Pago no aprobado');
      formLead.hidden = false;
    } else if (estado === 'pending') {
      mostrarGracias('Tu pago está en proceso', 'Cuando se confirme empezamos tu búsqueda. Envíanos tus datos por WhatsApp con tu número de orden: ' + orden + '.', linkWa(mensajeWhatsApp(datos, orden)), 'Pago pendiente');
    } else {
      try { sessionStorage.removeItem(CLAVE_SOLICITUD); } catch (err) { /* sin almacenamiento */ }
      mostrarGracias('Ya estamos trabajando en tu Búsqueda express', 'Tu número de orden es ' + orden + '. Envíanos tus datos por WhatsApp para entregarte los resultados.', linkWa(mensajeWhatsApp(datos, orden)), '¡Pago recibido! ✓');
    }
  }
})();
