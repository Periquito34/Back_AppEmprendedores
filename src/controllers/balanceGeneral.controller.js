const { db } = require('../config/firebase');
const { obtenerBalanceGeneralService } = require('../services/balanceGeneral.service');

// GET - Balance general del negocio calculado desde Firestore
async function getBalanceGeneral(req, res) {
  try {
    const uid = req.user?.uid;
    const { idNegocio } = req.params;

    if (!idNegocio) {
      return res.status(400).json({ message: 'idNegocio es requerido' });
    }

    const negocioDoc = await db.collection('businesses').doc(idNegocio).get();
    if (!negocioDoc.exists) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    // Validar que el negocio pertenece al usuario autenticado
    if (negocioDoc.data().uid !== uid) {
      return res.status(403).json({ message: 'No tienes permisos para ver este negocio' });
    }

    const balance = await obtenerBalanceGeneralService(idNegocio, negocioDoc.data().capitalInicial);

    return res.status(200).json({
      message: 'Balance general calculado correctamente',
      data: {
        idNegocio,
        ...balance,
        calculatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error calculando balance general:', error);
    return res.status(500).json({ message: 'Error calculando balance general' });
  }
}

module.exports = { getBalanceGeneral };
