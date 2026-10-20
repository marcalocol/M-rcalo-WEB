/* ===== Movimiento: los bloques aparecen suavemente al bajar por la página =====
   Solo agrega clases: sin JavaScript (o con "reducir movimiento" activado) todo se ve normal. */

(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SELECTOR = [
    '.section > h2', '.section > .section-sub', '.feature-item', '.step', '.plan-card',
    '.price-block', '.faq-item', '.camara-card', '.tipo-marca', '.edu-alert', '.discount-box',
    '.calc-campos', '.calc-resultado', '.quote-form', '.contenido-texto > p', '.contenido-texto > ul'
  ].join(', ');

  // El hero ya tiene su propia animación de entrada, y no animamos bloques dentro de otro bloque animado.
  var elementos = [].slice.call(document.querySelectorAll(SELECTOR)).filter(function (el) {
    return !el.closest('.top-wrap') && !el.closest('[hidden]') && !(el.parentElement && el.parentElement.closest(SELECTOR));
  });
  if (!elementos.length) return;

  elementos.forEach(function (el) {
    // Las tarjetas de una misma cuadrícula aparecen una tras otra.
    var hermanos = [].slice.call(el.parentElement.children).filter(function (h) { return elementos.indexOf(h) !== -1; });
    var posicion = hermanos.indexOf(el);
    if (posicion > 0) el.style.setProperty('--retraso', Math.min(posicion, 5) * 0.08 + 's');
    el.classList.add('revelar');
  });

  function terminar(el) {
    // Al terminar, devolvemos el elemento a su estado normal para que sus efectos al pasar el mouse funcionen igual.
    el.classList.remove('revelar', 'visible');
    el.style.removeProperty('--retraso');
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      var el = entrada.target;
      observador.unobserve(el);
      el.classList.add('visible');
      el.addEventListener('transitionend', function fin(e) {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', fin);
        terminar(el);
      });
      setTimeout(function () { terminar(el); }, 1500);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  elementos.forEach(function (el) { observador.observe(el); });
})();
