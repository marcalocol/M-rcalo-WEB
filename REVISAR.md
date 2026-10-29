# Pendientes de revisión — rama seo-estructura

Todo el contenido nuevo es un **borrador**. Antes de publicar, revisa especialmente:

## Contenido que escribí sin datos tuyos

- [ ] **Quiénes somos**: reescrito con tus indicaciones (abogadas, sector tecnológico, aliadas
      estratégicas). Si quieren, se pueden agregar nombres, fotos y trayectoria de cada una.
- [ ] **⚠️ Términos y condiciones y Política de datos** (español e inglés): dicen provisionalmente
      "MÁRCALO S.A.S.". Cuando constituyas la empresa, actualiza el nombre exacto (y el NIT si
      quieres incluirlo). Mientras la sociedad no exista, conviene confirmar con quien te asesore
      quién figura como responsable del tratamiento de datos.
- [ ] **Registro internacional**: pregunta frecuente en la página de registro de marca sobre el
      Sistema de Madrid (Protocolo de Madrid).
- [ ] **Los 5 diagnósticos legales**: qué se revisa, señales de que lo necesitas y preguntas
      frecuentes. Confirma que el alcance corresponde a lo que realmente ofrecen.
      - ¿Redactan contratos nuevos? ¿Hacen el cobro de cartera? (las páginas dicen "te proponemos").
- [ ] **Mensajes de WhatsApp** de cada diagnóstico (uno distinto por servicio).
- [ ] **Para diseñadores / Para abogados**: dice que el diseñador puede compartir el resultado
      con su cliente y que hay opciones por volumen para firmas. Confirma ambas cosas.

## Datos legales y plazos para verificar

- [ ] **Cuánto tarda**: ahora dice "entre 8 y 12 meses desde la solicitud", oposiciones 30 días
      hábiles, registro por 10 años y renovación en los 6 meses antes del vencimiento.
- [ ] **Después del registro**: cancelación por no uso durante 3 años seguidos.
- [ ] **Diagnósticos legales**: revisa el detalle de cada uno (qué revisamos, riesgos, qué recibes).
      Protección al consumidor menciona multas de hasta 2.000 salarios mínimos.
- [ ] **Cuánto cuesta**: tarifas de la SIC copiadas del sitio actual (PYME $970.000 / $485.000;
      no PYME $1.347.500 / $673.500). Confirma que son las de 2026.
- [ ] **Términos y condiciones**: agregué que la Búsqueda express cubre solo Colombia y se paga
      con Bold, y un punto nuevo sobre los Diagnósticos legales.

## Búsqueda express: entrega por correo

- [ ] El correo y el nombre del formulario se envían a Bold al abrir el pago (`customerData`).
      **Probar en el preview de Vercel**: hacer un pago de prueba y verificar en el panel de Bold
      que la transacción muestra el correo, y que la ventana de pago abre sin errores.

## Google Ads

- [ ] Revisar la nueva sección 9 de la Política de tratamiento de datos ("Cookies y herramientas
      de medición", español e inglés), que informa el uso de cookies de Google y Meta.
- [ ] Meta: después de publicar, revisar en el Administrador de eventos que lleguen PageView y,
      tras un pago real, Purchase.
- [x] Conversión "Compra" conectada al pago aprobado de Bold.
- [ ] Hacer un pago real y confirmar en Google Ads (Objetivos → Conversiones) que la conversión
      "Compra" aparece (puede tardar hasta 24 horas). Se asume que Bold devuelve el estado
      "approved"; si no aparece, revisar el valor de bold-tx-status en la URL de regreso.
- [ ] (Opcional) Crear la conversión "Clic en WhatsApp" y conectar su fragmento.

## Calculadora de costos

- [ ] Con más de una categoría la calculadora suma la tarifa de la SIC por categoría, pero deja los
      honorarios del plan igual y avisa que "pueden variar". Si tienen una tarifa por categoría
      adicional en honorarios, pásamela y la incluyo.

## Traducción al inglés

- [ ] Nombres de servicios en inglés: "360° Brand Diagnosis", "Let's Talk 1-on-1",
      "Self-Service Plan", "Team Plan", "Shielded Plan", "Legal assessments".
- [ ] Términos y política en inglés: traducción de referencia, con aviso de que prevalece la
      versión en español. Idealmente que la revise un abogado.

## Pendientes técnicos

- [x] Favicon: hecho con la "m" del logo sobre fondo carbón (`favicon.ico`, `images/icon-192.png`, `images/apple-touch-icon.png`).
- [ ] `og-marcalo.png` es provisional (logo sobre fondo apricot).
- [ ] Probar en el preview de Vercel: URLs limpias, redirecciones (que `/buscador.html?...`
      conserve los parámetros) y un pago real o de prueba con Bold, en español y en inglés.
- [ ] Después de publicar: enviar `https://www.marcalocol.com/sitemap.xml` en Google Search Console.
