const admin = require('firebase-admin');
const GastosFijos = require('../models/gastoFijo.model');

async function createGastoFijo(req, res) {
  try {
    const { idNegocio, nombreGasto, costoGasto, descripcion, recurrencia, fechasEjecucion } = req.body;

    // Generar un ID único para el gasto
    const idGasto = admin.firestore().collection('gastosFijos').doc().id;

    // Crear la instancia de tu modelo
    const newGastoFijo = new GastosFijos(
      idGasto,
      idNegocio,
      nombreGasto,
      costoGasto,
      descripcion,
      recurrencia,
      fechasEjecucion
    );

    // Guardar en Firestore (colección "gastosFijos")
    await admin.firestore().collection('gastosFijos').doc(idGasto).set({
      idNegocio: newGastoFijo.idNegocio,
      nombreGasto: newGastoFijo.nombreGasto,
      costoGasto: newGastoFijo.costoGasto,
      descripcion: newGastoFijo.descripcion,
      recurrencia: newGastoFijo.recurrencia,
      fechasEjecucion: newGastoFijo.fechasEjecucion,
      createdAt: newGastoFijo.createdAt
    });

    return res.status(201).json({
      message: 'Gasto fijo creado con éxito',
      data: newGastoFijo
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear gasto fijo',
      error: error.message
    });
  }
}

module.exports = { createGastoFijo };
