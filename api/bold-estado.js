// Diagnóstico: indica si la llave secreta de Bold está configurada, sin revelarla.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const original = process.env.BOLD_SECRET_KEY || '';
  const secreta = original.trim();
  res.status(200).json({
    llaveSecretaConfigurada: secreta.length > 0,
    longitud: secreta.length,
    teniaEspaciosAlInicioOFinal: original !== secreta,
    ambiente: process.env.VERCEL_ENV || 'desconocido'
  });
};
