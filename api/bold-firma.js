// Genera la orden y la firma de integridad para el Botón de pagos Bold.
// La llave secreta vive solo en Vercel (variable BOLD_SECRET_KEY); nunca llega al navegador.
const crypto = require('crypto');

const MONTO = '120000';
const MONEDA = 'COP';
const LLAVE_IDENTIDAD = process.env.BOLD_API_KEY || 'UmFxyysBx1aavcCGsp6PYPN2fUOrVFABEdaRuFWWv-M';

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const secreta = (process.env.BOLD_SECRET_KEY || '').trim();
  if (!secreta) {
    res.status(500).json({ error: 'Falta la variable BOLD_SECRET_KEY en Vercel' });
    return;
  }

  const marca = String((req.query && req.query.marca) || '').replace(/<[^>]*>/g, ' ').replace(/[^\p{L}\p{N} .&'-]/gu, '').trim().slice(0, 60);
  const orderId = 'BE-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const firma = crypto.createHash('sha256').update(orderId + MONTO + MONEDA + secreta).digest('hex');

  res.status(200).json({
    orderId: orderId,
    amount: MONTO,
    currency: MONEDA,
    apiKey: LLAVE_IDENTIDAD,
    integritySignature: firma,
    description: ('Búsqueda express' + (marca ? ' - ' + marca : '')).slice(0, 100)
  });
};
