const admin = require('firebase-admin');
const { docsDeNegociosDelUsuario } = require('../middleware/ownership');
const GastosFijosPagados = require('../models/gastoFijoPagado');

async function createGastoFijo(req, res) {
  try {
    const { idNegocio, nombreGasto, costoGasto } = req.body;

    // Generar ID único
    const idGasto = admin.firestore().collection('gastosFijosPagados').doc().id;

    // Crear instancia del modelo
    const newGastoFijo = new GastosFijosPagados(
      idGasto,
      idNegocio,
      nombreGasto,
      costoGasto
    );

    // Guardar en Firestore
    await admin.firestore().collection('gastosFijosPagados').doc(idGasto).set({
      idGasto: newGastoFijo.idGasto,
      idNegocio: newGastoFijo.idNegocio,
      nombreGasto: newGastoFijo.nombreGasto,
      costoGasto: newGastoFijo.costoGasto,
      createdAt: newGastoFijo.createdAt
    });

    return res.status(201).json({
      message: 'Gasto fijo pagado creado con éxito',
      data: newGastoFijo
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear gasto fijo pagado',
      error: error.message
    });
  }
}

async function getGastosFijosPagados(req, res) {
  try {
    const docs = await docsDeNegociosDelUsuario('gastosFijosPagados', req.user.uid);
    const snapshot = { empty: docs.length === 0, forEach: (fn) => docs.forEach(fn) };

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No hay gastos fijos pagados', total: 0, data: [] });
    }

    const gastos = [];

    snapshot.forEach(doc => {
      gastos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.status(200).json({
      message: 'Gastos fijos pagados obtenidos correctamente',
      total: gastos.length,
      data: gastos
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener los gastos fijos pagados',
      error: error.message
    });
  }
}

module.exports = {
  createGastoFijo,
  getGastosFijosPagados
};