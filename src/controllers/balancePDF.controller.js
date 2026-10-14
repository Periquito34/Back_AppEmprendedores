const { admin } = require('../config/firebase');
const { sortByDateDesc } = require('../utils/sortByDate');
const { generarPdfBalance } = require('../services/balancePDF.service');

// Envia el PDF como archivo descargable
function enviarPdf(res, pdfBuffer, weekKey) {
  const nombre = `balance-${String(weekKey || 'semanal').replace(/[^\w-]/g, '')}.pdf`;
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${nombre}"`,
    'Content-Length': pdfBuffer.length,
    'Cache-Control': 'no-store'
  });
  return res.status(200).send(pdfBuffer);
}

// POST - Genera el PDF del balance, lo registra en "PDF generados" y lo devuelve.
// El PDF no se guarda en Storage: se genera de nuevo al descargarlo (ver descargarPdfBalanceSemanal).
// req.recurso lo deja requireRecursoOwner('balancesSemanales', 'idBalance')
async function generarPdfBalanceSemanal(req, res) {
  try {
    const balanceData = req.recurso;
    const pdfBuffer = await generarPdfBalance(balanceData);

    const idReporte = admin.firestore().collection('reportesBalance').doc().id;
    await admin.firestore().collection('reportesBalance').doc(idReporte).set({
      idReporte,
      idBalance: balanceData.id,
      idNegocio: balanceData.idNegocio,
      weekKey: balanceData.weekKey,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return enviarPdf(res, pdfBuffer, balanceData.weekKey);
  } catch (error) {
    console.error('Error al generar PDF del balance:', error);
    return res.status(500).json({
      message: 'Error al generar PDF del balance',
      error: error.message
    });
  }
}

// GET - Vuelve a generar el PDF de un balance para descargarlo (sin registrar un reporte nuevo)
async function descargarPdfBalanceSemanal(req, res) {
  try {
    const pdfBuffer = await generarPdfBalance(req.recurso);
    return enviarPdf(res, pdfBuffer, req.recurso.weekKey);
  } catch (error) {
    console.error('Error al descargar PDF del balance:', error);
    return res.status(500).json({ message: 'Error al generar PDF del balance', error: error.message });
  }
}

async function getReportesBalanceByNegocio(req, res) {
  try {
    const { idNegocio } = req.params;

    if (!idNegocio) {
      return res.status(400).json({
        message: 'idNegocio es requerido'
      });
    }

    const snapshot = await admin.firestore()
      .collection('reportesBalance')
      .where('idNegocio', '==', idNegocio)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay reportes para este negocio',
        data: []
      });
    }

    const reportes = sortByDateDesc(snapshot.docs.map(doc => doc.data()), 'createdAt');

    return res.status(200).json({
      message: 'Reportes obtenidos con éxito',
      total: reportes.length,
      data: reportes
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
}

module.exports = {
  descargarPdfBalanceSemanal,
  generarPdfBalanceSemanal,
  getReportesBalanceByNegocio
};