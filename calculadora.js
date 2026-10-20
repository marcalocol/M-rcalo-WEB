/* ===== Calculadora: cuánto cuesta registrar una marca =====
   Los precios viven aquí. Si cambian, actualízalos también en las tablas de
   registro-de-marca-colombia.html, cuanto-cuesta.html y sus versiones en inglés. */

(function () {
  'use strict';

  var TARIFA_SIC = {
    pyme: { primera: 970000, adicional: 485000 },
    nopyme: { primera: 1347500, adicional: 673500 }
  };
  var PLANES = { autonomo: 1070000, equipo: 1450000, blindado: 2640000 };
  var PREVIOS = { ninguno: 0, hablemos: 150000, diagnostico: 240000, combo: 350000 };
  var MAX_CATEGORIAS = 45;
  var WHATSAPP = '573009574511';

  var TEXTOS = {
    es: {
      moneda: function (n) { return '$' + n.toLocaleString('es-CO'); },
      planes: { autonomo: 'Plan Autónomo', equipo: 'Plan En Equipo', blindado: 'Plan Blindado' },
      tamano: { pyme: 'tarifa PYME', nopyme: 'tarifa no PYME' },
      categorias: function (n) { return n === 1 ? '1 categoría' : n + ' categorías'; },
      notaVarias: 'Con más de una categoría, los honorarios pueden variar: te confirmamos el valor exacto por WhatsApp.',
      notaUna: 'La tarifa PYME aplica para empresas y personas naturales según sus ingresos, si cumplen los requisitos de la Superintendencia.',
      mensaje: function (d) {
        return 'Hola, usé la calculadora de Márcalo: ' + d.plan + ', ' + d.tamano + ', ' + d.categorias +
          '. Inversión total aproximada: ' + d.total + '. Quiero registrar mi marca.';
      }
    },
    en: {
      moneda: function (n) { return 'COP ' + n.toLocaleString('en-US'); },
      planes: { autonomo: 'Self-Service Plan', equipo: 'Team Plan', blindado: 'Shielded Plan' },
      tamano: { pyme: 'SME fee', nopyme: 'non-SME fee' },
      categorias: function (n) { return n === 1 ? '1 class' : n + ' classes'; },
      notaVarias: 'With more than one class, our fees may vary: we will confirm the exact amount on WhatsApp.',
      notaUna: 'The SME fee applies to companies and individuals based on their income, if they meet the Superintendence\'s requirements.',
      mensaje: function (d) {
        return 'Hi, I used the Márcalo calculator: ' + d.plan + ', ' + d.tamano + ', ' + d.categorias +
          '. Approximate total investment: ' + d.total + '. I want to register my trademark.';
      }
    }
  };

  var form = document.querySelector('[data-calculadora]');
  if (!form) return;
  var T = TEXTOS[(document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es'];
  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var campoCategorias = form.elements.categorias;
  var totalMostrado = null;

  function salida(nombre) { return form.querySelector('[data-' + nombre + ']'); }

  function categorias() {
    var n = parseInt(campoCategorias.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    return Math.min(n, MAX_CATEGORIAS);
  }

  // El total "cuenta" hasta el nuevo valor en lugar de cambiar de golpe.
  function animarTotal(destino) {
    var el = salida('total');
    var inicio = totalMostrado == null ? destino : totalMostrado;
    totalMostrado = destino;
    if (sinMovimiento || inicio === destino) { el.textContent = T.moneda(destino); return; }
    var t0 = null;
    el.classList.remove('calc-cambio');
    void el.offsetWidth;
    el.classList.add('calc-cambio');
    (function paso(t) {
      if (t0 === null) t0 = t;
      var avance = Math.min((t - t0) / 450, 1);
      var suave = 1 - Math.pow(1 - avance, 3);
      var valor = Math.round((inicio + (destino - inicio) * suave) / 500) * 500;
      el.textContent = T.moneda(avance === 1 ? destino : valor);
      if (avance < 1 && totalMostrado === destino) requestAnimationFrame(paso);
    })(performance.now());
  }

  function calcular() {
    var tamano = form.elements.tamano.value || 'pyme';
    var plan = form.elements.plan.value || 'equipo';
    var previo = form.elements.previo.value || 'ninguno';
    var n = categorias();

    var sic = TARIFA_SIC[tamano].primera + (n - 1) * TARIFA_SIC[tamano].adicional;
    var honorarios = PLANES[plan];
    var descuento = PREVIOS[previo];
    var total = honorarios - descuento + sic;

    salida('honorarios').textContent = T.moneda(honorarios);
    salida('descuento').textContent = '−' + T.moneda(descuento);
    salida('fila-descuento').hidden = descuento === 0;
    salida('sic').textContent = T.moneda(sic);
    salida('sic-detalle').textContent = T.categorias(n);
    salida('nota').textContent = n > 1 ? T.notaVarias : T.notaUna;
    form.querySelector('[data-paso="-1"]').disabled = n <= 1;
    form.querySelector('[data-paso="1"]').disabled = n >= MAX_CATEGORIAS;
    animarTotal(total);
    salida('total-barra').textContent = T.moneda(total);

    salida('whatsapp').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(T.mensaje({
      plan: T.planes[plan], tamano: T.tamano[tamano], categorias: T.categorias(n), total: T.moneda(total)
    }));
  }

  form.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-paso]');
    if (!boton) return;
    campoCategorias.value = categorias() + parseInt(boton.getAttribute('data-paso'), 10);
    campoCategorias.value = categorias();
    calcular();
  });
  form.addEventListener('input', calcular);
  form.addEventListener('change', function () { campoCategorias.value = categorias(); calcular(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  form.classList.add('calc-activa');
  calcular();
})();
