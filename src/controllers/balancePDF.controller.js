const { admin } = require('../config/firebase');
const { generarYSubirPdfBalance } = require('../services/balancePDF.service');

async function generarPdfBalanceSemanal(req, res) {
  try {
    const { idBalance } = req.params;

    if (!idBalance) {
      return res.status(400).json({
        message: 'idBalance es requerido'
      });
    }

    const balanceRef = admin.firestore().collection('balancesSemanales').doc(idBalance);
    const balanceSnap = await balanceRef.get();

    if (!balanceSnap.exists) {
      return res.status(404).json({
        message: 'No se encontró el balance semanal'
      });
    }

    const balanceData = balanceSnap.data();

    const { pdfUrl, pdfPath } = await generarYSubirPdfBalance(balanceData);

    const idReporte = admin.firestore().collection('reportesBalance').doc().id;

    await admin.firestore().collection('reportesBalance').doc(idReporte).set({
      idReporte,
      idBalance,
      idNegocio: balanceData.idNegocio,
      weekKey: balanceData.weekKey,
      pdfUrl,
      pdfPath,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({
      message: 'PDF generado con éxito',
      data: {
        idReporte,
        idBalance,
        idNegocio: balanceData.idNegocio,
        weekKey: balanceData.weekKey,
        pdfUrl,
        pdfPath
      }
    });
  } catch (error) {
    console.error('Error al generar PDF del balance:', error);
    return res.status(500).json({
      message: 'Error al generar PDF del balance',
      error: error.message
    });
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
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay reportes para este negocio',
        data: []
      });
    }

    const reportes = snapshot.docs.map(doc => doc.data());

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
  generarPdfBalanceSemanal,
  getReportesBalanceByNegocio
};